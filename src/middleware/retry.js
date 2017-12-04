import { configs } from '../index'
import { assign } from '../utils'

let retryConfigs = {
  headerRetryCount: 'X-Mappersmith-Retry-Count',
  headerRetryTime: 'X-Mappersmith-Retry-Time',
  maxRetryTimeInSecs: 5,
  initialRetryTimeInSecs: 0.1,
  factor: 0.2, // randomization factor
  multiplier: 2, // exponential factor
  retries: 5, // max retries
  validateRetry: () => true // a function that returns true if the request should be retried
}

/**
 * @param {Object} newConfigs
 *   @param {String} newConfigs.headerRetryCount (default: 'X-Mappersmith-Retry-Count')
 *   @param {String} newConfigs.headerRetryTime (default: 'X-Mappersmith-Retry-Time')
 *   @param {Number} newConfigs.maxRetryTimeInSecs (default: 5)
 *   @param {Number} newConfigs.initialRetryTimeInSecs (default: 1)
 *   @param {Number} newConfigs.factor (default: 0.2) - randomization factor
 *   @param {Number} newConfigs.multiplier (default: 2) - exponential factor
 *   @param {Number} newConfigs.retries (default: 5) - max retries
 */
export const setRetryConfigs = (newConfigs) => {
  retryConfigs = assign({}, retryConfigs, newConfigs)
}

/**
 * This middleware will automatically retry GET requests up to the configured amount of
 * retries using a randomization function that grows exponentially. The retry count and
 * the time used will be included as a header in the response.
 *
 * The retry time is calculated using the following formula:
 *   retryTime = min(
 *     random(previousRetryTime - randomizedFactor, previousRetryTime + randomizedFactor) * multipler,
 *     maxRetryTime
 *   )
 *
 * Take a look at `calculateExponentialRetryTime` for more information.
 *
 * Parameters can be configured using the method `setRetryConfigs`.
 */
const RetryMiddleware = () => ({
  request (request) {
    this.enableRetry = (request.method() === 'get')
    return request
  },

  response (next) {
    if (!this.enableRetry) {
      return next()
    }

    return new configs.Promise((resolve, reject) => {
      const retryTime = retryConfigs.initialRetryTimeInSecs * 1000
      retriableRequest(resolve, reject, next)(randomFromRetryTime(retryTime))
    })
  }
})

export default RetryMiddleware

const retriableRequest = (resolve, reject, next) => {
  const retry = (retryTime, retryCount = 0) => {
    const nextRetryTime = calculateExponentialRetryTime(retryTime)
    const shouldRetry = retryCount < retryConfigs.retries
    const scheduleRequest = () => {
      setTimeout(() => retry(nextRetryTime, retryCount + 1), retryTime)
    }

    next()
      .then((response) => {
        resolve(enhancedResponse(response, retryCount, retryTime))
      })
      .catch((response) => {
        shouldRetry && retryConfigs.validateRetry(response)
          ? scheduleRequest()
          : reject(enhancedResponse(response, retryCount, retryTime))
      })
  }

  return retry
}

/**
 * Increases the retry time for each attempt using a randomization function that grows exponentially.
 * The value is limited by `retryConfigs.maxRetryTimeInSecs`.
 * @param {Number} retryTime
 *
 * @return {Number}
 */
export const calculateExponentialRetryTime = (retryTime) => Math.min(
  randomFromRetryTime(retryTime) * retryConfigs.multiplier,
  retryConfigs.maxRetryTimeInSecs * 1000
)

const randomFromRetryTime = (retryTime) => {
  const delta = retryConfigs.factor * retryTime
  return random(retryTime - delta, retryTime + delta)
}

const random = (min, max) => {
  return Math.random() * (max - min) + min
}

const enhancedResponse = (response, retryCount, retryTime) => response.enhance({
  headers: {
    [retryConfigs.headerRetryCount]: retryCount,
    [retryConfigs.headerRetryTime]: retryTime
  }
})
