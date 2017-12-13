import RetryMiddleware, {
  setRetryConfigs,
  calculateExponentialRetryTime
} from 'src/middlewares/retry'
import { retryMiddlewareExamples } from '../shared-examples'

describe('Middleware / RetryMiddleware', () => {
  const retries = 3
  const headerRetryCount = 'X-Mappersmith-Retry-Count'
  const headerRetryTime = 'X-Mappersmith-Retry-Time'
  let middleware

  beforeEach(() => {
    setRetryConfigs({ retries, headerRetryCount, headerRetryTime })
    middleware = RetryMiddleware()
  })

  it('should behave like retry examples', () => {
    retryMiddlewareExamples(middleware, retries, headerRetryCount, headerRetryTime)
  })
})

describe('calculateExponentialRetryTime', () => {
  beforeEach(() => {
    setRetryConfigs({
      factor: 0.5,
      multiplier: 2,
      maxRetryTimeInSecs: 0.25
    })
  })

  it('increases the retry time using a randomization function that grows exponentially', () => {
    spyOn(Math, 'random').and.returnValues(0.32, 0.25, 0.6)

    // 50 * 0.5 (factor) = 25
    // random(25, 75) -> [random[0.32] * (75 - 25) + 25] = 41
    // 41 * 2 (multiplier) = 82
    // min(82, 250 (max retry)) -> 82
    expect(calculateExponentialRetryTime(50)).toEqual(82)

    // 82 * 0.5 (factor) = 41
    // random(41, 123) -> [random[0.25] * (123 - 41) + 41] = 61,5
    // 61,5 * 2 (multipler) = 123
    // min(123, 250 (max retry)) -> 123
    expect(calculateExponentialRetryTime(82)).toEqual(123)

    // 123 * 0.5 (factor) = 61,5
    // random(61,5, 184,5) -> [random[0.60] * (184,5 - 61,5) + 61,5] = 135,3
    // 135,3 * 2 (multipler) = 270,6
    // min(270,6, 250 (max retry)) -> 250
    expect(calculateExponentialRetryTime(123)).toEqual(250)
  })
})
