import MethodDescriptor from 'src/method-descriptor'
import Request from 'src/request'
import TimeoutMiddleware from 'src/middlewares/timeout'

describe('Middleware / Timeout', () => {
  let methodDescriptor, request, middleware

  beforeEach(() => {
    methodDescriptor = new MethodDescriptor({ method: 'get' })
    request = new Request(methodDescriptor)
    middleware = TimeoutMiddleware(100)()
  })

  it('configures the timeout', () => {
    const newRequest = middleware.request(request)
    expect(newRequest.timeout()).toEqual(100)
  })

  describe('when the timeout property is explicitly defined', () => {
    it('keeps the original timeout value', () => {
      request = new Request(methodDescriptor, { timeout: 500 })
      const newRequest = middleware.request(request)
      expect(newRequest.timeout()).toEqual(500)
    })
  })
})
