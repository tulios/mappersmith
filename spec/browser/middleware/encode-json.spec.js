import MethodDescriptor from 'src/method-descriptor'
import Request from 'src/request'
import EncodeJsonMiddleware, { CONTENT_TYPE_JSON } from 'src/middlewares/encode-json'

describe('Middleware / EncodeJson', () => {
  let methodDescriptor, request, body, middleware

  beforeEach(() => {
    body = { nice: 'object' }
    methodDescriptor = new MethodDescriptor({ method: 'post' })
    request = new Request(methodDescriptor, { body })
    middleware = EncodeJsonMiddleware()
  })

  it('exposes name', () => {
    expect(EncodeJsonMiddleware.name).toEqual('EncodeJsonMiddleware')
  })

  it('stringify the body and add "content-type" application/json', async () => {
    const newRequest = await middleware.prepareRequest(() => Promise.resolve(request))
    expect(newRequest.body()).toEqual(JSON.stringify(body))
    expect(newRequest.headers()['content-type']).toEqual(CONTENT_TYPE_JSON)
  })

  describe('when the request does not have a body', () => {
    it('returns the original request', async () => {
      request = new Request(new MethodDescriptor({ method: 'get' }))
      expect(request.body()).toBeUndefined()

      const newRequest = await middleware.prepareRequest(() => Promise.resolve(request))
      expect(newRequest.body()).toBeUndefined()
      expect(newRequest.headers()['content-type']).toBeUndefined()
    })
  })

  describe('when body is an invalid JSON', () => {
    beforeEach(() => {
      const data = {}
      data.attr = data
      body = data
      request = new Request(methodDescriptor, { body })
    })

    it('keeps the original request', async () => {
      const newRequest = await middleware.prepareRequest(() => Promise.resolve(request))
      expect(newRequest.body()).toEqual(body)
      expect(newRequest.headers()).toEqual({})
    })
  })

  describe('when there is already a content-type header set', () => {
    let headers

    beforeEach(() => {
      body = { something: 'strange' }
      headers = { 'content-type': 'application/java-archive' }
      methodDescriptor = new MethodDescriptor({ method: 'post' })
      request = new Request(methodDescriptor, { body, headers })
    })

    it('returns the original request', async () => {
      const newRequest = await middleware.prepareRequest(() => Promise.resolve(request))
      expect(newRequest.body()).toEqual(body)
      expect(newRequest.headers()).toEqual(headers)
    })

    describe('when the content-type is application/json', () => {
      let headers

      beforeEach(() => {
        headers = {'content-type': 'application/json'}
      })

      describe('and the body is already encoded', () => {
        let body

        beforeEach(() => {
          body = JSON.stringify({ foo: 'bar' })
          methodDescriptor = new MethodDescriptor({ method: 'post' })
          request = new Request(methodDescriptor, { body, headers })
        })

        it('returns the original request', async () => {
          const newRequest = await middleware.prepareRequest(() => Promise.resolve(request))
          expect(newRequest.body()).toEqual(body)
          expect(newRequest.headers()).toEqual(headers)
        })
      })

      describe('and the body is not encoded', () => {
        let body

        beforeEach(() => {
          body = { foo: 'bar' }
          methodDescriptor = new MethodDescriptor({ method: 'post' })
          request = new Request(methodDescriptor, { body, headers })
        })

        it('encodes the body but keeps the original header', async () => {
          const newRequest = await middleware.prepareRequest(() => Promise.resolve(request))
          expect(newRequest.body()).toEqual(JSON.stringify(body))
          expect(newRequest.headers()).toEqual(headers)
        })
      })
    })

    describe('when the content-type is application/json but with a different charset', () => {
      let headers, body

      beforeEach(() => {
        headers = { 'content-type': 'application/json;charset=utf-7' }
        body = 'strange-stuff'
        methodDescriptor = new MethodDescriptor({ method: 'post' })
        request = new Request(methodDescriptor, { body, headers })
      })

      it('keeps the original request', async () => {
        const newRequest = await middleware.prepareRequest(() => Promise.resolve(request))
        expect(newRequest.body()).toEqual(body)
        expect(newRequest.headers()).toEqual(headers)
      })
    })
  })
})
