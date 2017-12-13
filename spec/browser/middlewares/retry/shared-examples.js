import Request from 'src/request'
import Response from 'src/response'
import MethodDescriptor from 'src/method-descriptor'

export function retryMiddlewareExamples (middleware, retries, headerRetryCount, headerRetryTime) {
  const newRequest = method =>
    new Request(new MethodDescriptor({ host: 'example.com', path: '/', method }), {})

  const newResponse = (request, responseStatus = 200, responseData = {}, responseHeaders = {}) => {
    return new Response(request, responseStatus, responseData, responseHeaders)
  }

  beforeAll(() => {
    jest.useRealTimers()
  })

  describe('when the call is not HTTP GET', () => {
    for (let methodName of ['post', 'put', 'delete', 'patch']) {
      it(`resolves the promise without retries for ${methodName.toUpperCase()}`, done => {
        const request = newRequest(methodName)
        const response = newResponse(middleware.request(request))

        middleware
          .response(() => Promise.resolve(response))
          .then(response => {
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
    it('resolves the promise without retries', done => {
      const request = newRequest('get')
      const response = newResponse(middleware.request(request))

      middleware
        .response(() => Promise.resolve(response))
        .then(response => {
          expect(response.header(headerRetryCount)).toEqual(0)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
          done()
        })
        .catch(done.fail)
    })
  })

  describe('when the call succeeds within the configured number of retries', () => {
    it('resolves the promise adding the number of retries as a header', done => {
      const request = newRequest('get')
      const response = newResponse(middleware.request(request), 500)
      let callsCount = 0

      const next = () => {
        response.responseStatus = ++callsCount < 3 ? 500 : 200
        return response.status() !== 200 ? Promise.reject(response) : Promise.resolve(response)
      }

      middleware
        .response(next)
        .then(response => {
          expect(response.header(headerRetryCount)).toEqual(2)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
          done()
        })
        .catch(done.fail)
    })
  })

  describe('when the call fails after the configured number of retries', () => {
    it('rejects the promise adding the number of retries as a header', done => {
      const request = newRequest('get')
      const response = newResponse(middleware.request(request), 500)
      const next = () => Promise.reject(response)

      middleware
        .response(next)
        .then(() => done.fail('This test should reject the promise'))
        .catch(response => {
          expect(response.header(headerRetryCount)).toEqual(retries)
          expect(response.header(headerRetryTime)).toEqual(expect.any(Number))
          done()
        })
    })
  })

  describe('when the call fails and the retry validation fails', () => {
    it('rejects the promise with a retryCount header of zero', done => {
      const request = newRequest('get')
      const response = newResponse(middleware.request(request), 401)
      const next = () => Promise.reject(response)

      middleware
        .response(next)
        .then(() => done.fail('This test should reject the promise'))
        .catch(response => {
          expect(response.header(headerRetryCount)).toEqual(0)
          done()
        })
    })
  })
}
