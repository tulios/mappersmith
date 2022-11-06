import { responseFactory } from '@mappersmith/test'
import { MiddlewareDescriptor, ResponseGetter } from '../mappersmith'
import { RetryMiddleware, calculateExponentialRetryTime } from './retry'

function retryMiddlewareExamples(
  middleware: Partial<MiddlewareDescriptor>,
  headerRetryCount: string,
  headerRetryTime: string
) {
  beforeAll(() => {
    jest.useRealTimers()
  })

  describe('when the call is not HTTP GET or HEAD', () => {
    for (const methodName of ['post', 'put', 'delete', 'patch']) {
      it(`resolves the promise without retries for ${methodName.toUpperCase()}`, async () => {
        expect.assertions(2)
        const response = responseFactory({ method: methodName })
        return middleware
          .response?.(
            () => Promise.resolve(response),
            () => Promise.resolve(response),
            response.originalRequest
          )
          .then((response) => {
            // Retry was never considered
            expect(response.header(headerRetryCount)).toEqual(undefined)
            expect(response.header(headerRetryTime)).toEqual(undefined)
          })
      })
    }
  })

  describe('when the call succeeds', () => {
    it('resolves the promise without retries', async () => {
      expect.assertions(2)
      const response = responseFactory({ method: 'get' })
      return middleware
        .response?.(
          () => Promise.resolve(response),
          () => Promise.resolve(response),
          response.originalRequest
        )
        .then((response) => {
          expect(response.header(headerRetryCount)).toEqual(0)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
        })
    })
  })

  describe('when the call succeeds within the configured number of retries', () => {
    it('resolves the promise adding the number of retries as a header', async () => {
      expect.assertions(2)
      const originalResponse = responseFactory({ method: 'get' })
      let callsCount = 0

      const next: ResponseGetter = () => {
        const newResponse = originalResponse.enhance({ status: ++callsCount < 3 ? 500 : 200 })
        return newResponse.status() !== 200
          ? Promise.reject(newResponse)
          : Promise.resolve(newResponse)
      }

      return middleware
        .response?.(next, () => Promise.resolve(originalResponse), originalResponse.originalRequest)
        .then((response) => {
          expect(response.header(headerRetryCount)).toEqual(2)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
        })
    })
  })

  describe('when the call fails after the configured number of retries', () => {
    it('rejects the promise adding the number of retries as a header', async () => {
      expect.assertions(2)
      const response = responseFactory({ method: 'get', status: 500 })
      const next: ResponseGetter = () => Promise.reject(response)

      return middleware
        .response?.(next, () => Promise.resolve(response), response.originalRequest)
        .catch((response) => {
          expect(response.header(headerRetryCount)).toEqual(3)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
        })
    })
  })

  describe('when the call fails and the retry validation fails', () => {
    it('rejects the promise with a retryCount header of zero', async () => {
      expect.assertions(1)
      const response = responseFactory({ method: 'get', status: 401 })
      const next: ResponseGetter = () => Promise.reject(response)

      middleware
        .response?.(next, () => Promise.resolve(response), response.originalRequest)
        .catch((response) => {
          expect(response.header(headerRetryCount)).toEqual(0)
        })
    })
  })
}

describe('Middleware / RetryMiddleware', () => {
  const retries = 3
  const headerRetryCount = 'X-Mappersmith-Retry-Count'
  const headerRetryTime = 'X-Mappersmith-Retry-Time'
  const middleware = RetryMiddleware({ retries, headerRetryCount, headerRetryTime })({
    clientId: 'test',
    context: {},
    resourceMethod: 'test',
    resourceName: 'test',
  })

  it('exposes name', () => {
    expect(RetryMiddleware().name).toEqual('RetryMiddleware')
  })

  retryMiddlewareExamples(middleware, headerRetryCount, headerRetryTime)
})

describe('calculateExponentialRetryTime', () => {
  it('increases the retry time using a randomization function that grows exponentially', () => {
    const retryConfigs = {
      factor: 0.5,
      multiplier: 2,
      maxRetryTimeInSecs: 0.25,
    }

    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.32)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.6)

    // 50 * 0.5 (factor) = 25
    // random(25, 75) -> [random[0.32] * (75 - 25) + 25] = 41
    // 41 * 2 (multiplier) = 82
    // min(82, 250 (max retry)) -> 82
    expect(calculateExponentialRetryTime(50, retryConfigs)).toEqual(82)

    // 82 * 0.5 (factor) = 41
    // random(41, 123) -> [random[0.25] * (123 - 41) + 41] = 61,5
    // 61,5 * 2 (multipler) = 123
    // min(123, 250 (max retry)) -> 123
    expect(calculateExponentialRetryTime(82, retryConfigs)).toEqual(123)

    // 123 * 0.5 (factor) = 61,5
    // random(61,5, 184,5) -> [random[0.60] * (184,5 - 61,5) + 61,5] = 135,3
    // 135,3 * 2 (multipler) = 270,6
    // min(270,6, 250 (max retry)) -> 250
    expect(calculateExponentialRetryTime(123, retryConfigs)).toEqual(250)
  })
})
