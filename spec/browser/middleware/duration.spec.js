import DurationMiddleware from 'src/middlewares/duration'
import Request from 'src/request'
import Response from 'src/response'
import MethodDescriptor from 'src/method-descriptor'

describe('Middleware / DurationMiddleware', () => {
  let middleware

  const newRequest = (method) =>
    new Request(new MethodDescriptor({ host: 'example.com', path: '/', method }), {})

  const newResponse = (request, responseStatus = 200, responseData = {}, responseHeaders = {}) => {
    return new Response(request, responseStatus, responseData, responseHeaders)
  }

  beforeEach(() => {
    middleware = DurationMiddleware()
  })

  it('exposes name', () => {
    expect(DurationMiddleware.name).toEqual('DurationMiddleware')
  })

  it('adds started_at, ended_at and duration response headers', async () => {
    const request = newRequest('get')
    const finalRequest = await middleware.prepareRequest(() => Promise.resolve(request))
    const response = newResponse(finalRequest)

    const finalResponse = await middleware.response(() => Promise.resolve(response))
    const startedAt = finalResponse.header('x-started-at')
    const endedAt = finalResponse.header('x-ended-at')

    expect(startedAt).toEqual(expect.anything())
    expect(endedAt).toEqual(expect.anything())
    expect(finalResponse.header('x-duration')).toEqual(endedAt - startedAt)
  })
})
