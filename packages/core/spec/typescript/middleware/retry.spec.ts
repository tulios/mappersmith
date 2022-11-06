import forge from '../../../src/mappersmith'
import { RetryMiddleware, RetryMiddlewareOptions } from '../../../src'

const retryConfigs: RetryMiddlewareOptions = {
  headerRetryCount: 'X-Mappersmith-Retry-Count',
  headerRetryTime: 'X-Mappersmith-Retry-Time',
  maxRetryTimeInSecs: 5,
  initialRetryTimeInSecs: 0.1,
  factor: 0.2, // randomization factor
  multiplier: 2, // exponential factor
  retries: 5, // max retries
  validateRetry: (response) => response.responseStatus >= 500, // a function that returns true if the request should be retried
}

forge({
  middleware: [RetryMiddleware(retryConfigs)],
  clientId: 'github',
  host: 'https://status.github.com',
  resources: {},
})
