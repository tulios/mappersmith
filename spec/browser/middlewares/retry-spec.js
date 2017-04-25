import RetryMiddleware, { setRetryConfigs, calculateExponentialRetryTime } from 'src/middlewares/retry'
import Request from 'src/request'
import Response from 'src/response'
import MethodDescriptor from 'src/method-descriptor'

describe('Middleware / RetryMiddleware', () => {
  let middleware,
    retries,
    headerRetryCount,
    headerRetryTime

  const newRequest = (method) => new Request(
    new MethodDescriptor({ host: 'example.com', path: '/', method }),
    {}
  )

  const newResponse = (request, responseStatus = 200, responseData = {}, responseHeaders = {}) => {
    return new Response(request, responseStatus, responseData, responseHeaders)
  }

  beforeEach(() => {
    retries = 3
    headerRetryCount = 'X-Mappersmith-Retry-Count'
    headerRetryTime = 'X-Mappersmith-Retry-Time'

    setRetryConfigs({ retries, headerRetryCount, headerRetryTime })
    middleware = RetryMiddleware()
  })

  describe('when the call is not HTTP GET', () => {
    for (let methodName of ['post', 'put', 'delete', 'patch']) {
      it(`resolves the promise without retries for ${methodName.toUpperCase()}`, (done) => {
        const request = newRequest(methodName)
        const response = newResponse(middleware.request(request))

        middleware
          .response(() => Promise.resolve(response))
          .then((response) => {
            // Retry was never considered
            expect(response.header(headerRetryCount)).toEqual(undefined)
            expect(response.header(headerRetryTime)).toEqual(undefined)
            done()
          })
          .catch(done.fail)
      })
    }
  })

  describe('when the call succeeds', () => {
    it('resolves the promise without retries', (done) => {
      const request = newRequest('get')
      const response = newResponse(middleware.request(request))

      middleware
        .response(() => Promise.resolve(response))
        .then((response) => {
          expect(response.header(headerRetryCount)).toEqual(0)
          expect(response.header(headerRetryTime)).toEqual(jasmine.any(Number))
          done()
        })
        .catch(done.fail)
    })
  })

  describe('when the call succeeds within the configured number of retries', () => {
    it('resolves the promise adding the number of retries as a header', (done) => {
      const request = newRequest('get')
      const response = newResponse(middleware.request(request), 400)
      let callsCount = 0

      const next = () => {
        response.responseStatus = (++callsCount < 3) ? 400 : 200
        return response.status() !== 200
          ? Promise.reject(response)
          : Promise.resolve(response)
      }

      middleware
        .response(next)
        .then((response) => {
          expect(response.header(headerRetryCount)).toEqual(2)
          expect(response.header(headerRetryTime)).toEqual(jasmine.any(Number))
          done()
        })
        .catch(done.fail)
    })
  })

  describe('when the call fails after the configured number of retries', () => {
    it('rejects the promise adding the number of retries as a header', (done) => {
      const request = newRequest('get')
      const response = newResponse(middleware.request(request), 400)
      const next = () => Promise.reject(response)

      middleware
        .response(next)
        .then(() => done.fail('This test should reject the promise'))
        .catch((response) => {
          expect(response.header(headerRetryCount)).toEqual(retries)
          expect(response.header(headerRetryTime)).toEqual(jasmine.any(Number))
          done()
        })
    })
  })

  describe('#calculateExponentialRetryTime', () => {
    it('increases the retry time using a randomization function that grows exponentially', () => {
      setRetryConfigs({
        factor: 0.5,
        multiplier: 2,
        maxRetryTimeInSecs: 0.25
      })

      spyOn(Math, 'random').and.returnValues(0.32, 0.25, 0.60)

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
})
