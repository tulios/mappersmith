import MethodDescriptor from 'src/method-descriptor'
import Request from 'src/request'
import CsrfMiddleware from 'src/middlewares/csrf'

describe('Middleware / CSRF', () => {
  let methodDescriptor, request, middleware

  beforeEach(() => {
    methodDescriptor = new MethodDescriptor({ method: 'get' })
    request = new Request(methodDescriptor)
  })

  it('adds a header if cookie is set in document.cookie', () => {
    middleware = CsrfMiddleware('csrfToken', 'x-csrf-token')()
    const token = 'xyz'
    document.cookie = `csrfToken=${token}`
    const newRequest = middleware.request(request)
    expect(newRequest.headers()['x-csrf-token']).toEqual(token)
  })

  describe('csrfToken is missing from document.cookie', () => {
    beforeEach(() => {
      const data = {}
      data.attr = data
      document.cookie = 'csrfToken='
      middleware = CsrfMiddleware('csrfToken', 'x-csrf-token')()
      request = new Request(methodDescriptor)
    })

    it('does not add "x-csrf-token"', () => {
      const newRequest = middleware.request(request)
      expect(newRequest.headers()).toEqual({})
    })
  })
})
