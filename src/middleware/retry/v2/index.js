import { configs } from '../../../index'
import { assign } from '../../../utils'

export const defaultRetryConfigs = {
  headerRetryCount: 'X-Mappersmith-Retry-Count',
  headerRetryTime: 'X-Mappersmith-Retry-Time',
  maxRetryTimeInSecs: 5,
  initialRetryTimeInSecs: 0.1,
  factor: 0.2, // randomization factor
  multiplier: 2, // exponential factor
  retries: 5, // max retries
  validateRetry: response => response.responseStatus >= 500 // a function that returns true if the request should be retried
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
 *  @param {Object} retryConfigs
 *   @param {String} retryConfigs.headerRetryCount (default: 'X-Mappersmith-Retry-Count')
 *   @param {String} retryConfigs.headerRetryTime (default: 'X-Mappersmith-Retry-Time')
 *   @param {Number} retryConfigs.maxRetryTimeInSecs (default: 5)
 *   @param {Number} retryConfigs.initialRetryTimeInSecs (default: 1)
 *   @param {Number} retryConfigs.factor (default: 0.2) - randomization factor
 *   @param {Number} retryConfigs.multiplier (default: 2) - exponential factor
 *   @param {Number} retryConfigs.retries (default: 5) - max retries
 */
const RetryMiddleware = (customConfigs = {}) => () => ({
  request (request) {
    this.enableRetry = (request.method() === 'get')
    return request
  },

  response (next) {
    const retryConfigs = assign({}, defaultRetryConfigs, customConfigs)

    if (!this.enableRetry) {
      return next()
    }

    return new configs.Promise((resolve, reject) => {
      const retryTime = retryConfigs.initialRetryTimeInSecs * 1000
      retriableRequest(resolve, reject, next)(randomFromRetryTime(retryTime, retryConfigs.factor), 0, retryConfigs)
    })
  }
})

export default RetryMiddleware

const retriableRequest = (resolve, reject, next) => {
  const retry = (retryTime, retryCount, retryConfigs) => {
    const nextRetryTime = calculateExponentialRetryTime(retryTime, retryConfigs)
    const shouldRetry = retryCount < retryConfigs.retries
    const scheduleRequest = () => {
      setTimeout(() => retry(nextRetryTime, retryCount + 1, retryConfigs), retryTime)
    }

    next()
      .then((response) => {
        resolve(enhancedResponse(response, retryConfigs.headerRetryCount, retryCount, retryConfigs.headerRetryTime, retryTime))
      })
      .catch((response) => {
        shouldRetry && retryConfigs.validateRetry(response)
          ? scheduleRequest()
          : reject(enhancedResponse(response, retryConfigs.headerRetryCount, retryCount, retryConfigs.headerRetryTime, retryTime))
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
export const calculateExponentialRetryTime = (retryTime, retryConfigs) => Math.min(
  randomFromRetryTime(retryTime, retryConfigs.factor) * retryConfigs.multiplier,
  retryConfigs.maxRetryTimeInSecs * 1000
)

const randomFromRetryTime = (retryTime, factor) => {
  const delta = factor * retryTime
  return random(retryTime - delta, retryTime + delta)
}

const random = (min, max) => {
  return Math.random() * (max - min) + min
}

const enhancedResponse = (response, headerRetryCount, retryCount, headerRetryTime, retryTime) => response.enhance({
  headers: {
    [headerRetryCount]: retryCount,
    [headerRetryTime]: retryTime
  }
})