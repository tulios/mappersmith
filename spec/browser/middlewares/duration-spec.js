import DurationMiddleware from 'src/middlewares/duration'
import Request from 'src/request'
import Response from 'src/response'
import MethodDescriptor from 'src/method-descriptor'

describe('Middleware / DurationMiddleware', () => {

  let middleware

  const newRequest = (method) => new Request(
    new MethodDescriptor({ host: 'example.com', path: '/', method }),
    {}
  )

  const newResponse = (request, responseStatus = 200, responseData = {}, responseHeaders = {}) => {
    return new Response(request, responseStatus, responseData, responseHeaders)
  }

  beforeEach(() => {
    middleware = DurationMiddleware()
  })

  it('adds started_at, ended_at and duration response headers', (done) => {
    const request = newRequest('get')
    const response = newResponse(middleware.request(request))

    middleware
      .response(() => Promise.resolve(response))
      .then((response) => {
        const startedAt = response.header('x-started-at')
        const endedAt = response.header('x-ended-at')

        expect(startedAt).toEqual(jasmine.anything())
        expect(endedAt).toEqual(jasmine.anything())
        expect(response.header('x-duration')).toEqual(endedAt - startedAt)
        done()
      })
      .catch(done.fail)
  })
})
