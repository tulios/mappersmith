import MethodDescriptor from 'src/method-descriptor'
import Request from 'src/request'
import CsrfMiddleware from 'src/middlewares/csrf'

describe('Middleware / CSRF', () => {
  let methodDescriptor, request, middleware

  beforeEach(() => {
    methodDescriptor = new MethodDescriptor({ method: 'get' })
    request = new Request(methodDescriptor)
  })

  it('exposes name', () => {
    expect(CsrfMiddleware().name).toEqual('CsrfMiddleware')
  })

  it('adds a header if cookie is set in document.cookie', () => {
    middleware = CsrfMiddleware()()
    const token = 'eacb7710-3a75-49ab-a26a-cdffc5250f1c'
    document.cookie = 'csrfToken=eacb7710-3a75-49ab-a26a-cdffc5250f1c; _ga=GAxx'
    const newRequest = middleware.request(request)
    expect(newRequest.headers()['x-csrf-token']).toEqual(token)
  })

  describe('csrfToken is missing from document.cookie', () => {
    beforeEach(() => {
      const data = {}
      data.attr = data
      middleware = CsrfMiddleware('csrfToken', 'x-csrf-token')()
      request = new Request(methodDescriptor)
    })

    it('does not add "x-csrf-token"', () => {
      document.cookie = 'csrfToken='
      const newRequest = middleware.request(request)
      expect(newRequest.headers()).toEqual({})
    })
  })
})
