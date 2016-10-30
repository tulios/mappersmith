import Request from 'src/request'
import MethodDescriptor from 'src/method-descriptor'

describe('Request', () => {
  let methodDescriptor

  beforeEach(() => {
    methodDescriptor = new MethodDescriptor({})
  })

  describe('#params', () => {
    describe('without "requestParams"', () => {
      it('returns the "params" configured in the method descriptor', () => {
        methodDescriptor.params = { id: 1 }
        const request = new Request(methodDescriptor)
        expect(request.params()).toEqual({ id: 1 })
      })
    })

    describe('with "requestParams"', () => {
      it('merges "requestParams" and configured "params"', () => {
        methodDescriptor.params = { id: 1 }
        const request = new Request(methodDescriptor, { title: 'test' })
        expect(request.params()).toEqual({ id: 1, title: 'test' })
      })
    })
  })

  describe('#host', () => {
    it('has "/" as the default host', () => {
      expect(new Request(methodDescriptor).host()).toEqual('/')
    })

    it('removes trailing "/"', () => {
      methodDescriptor.host = 'http://example.org/'
      const host = new Request(methodDescriptor).host()
      expect(host).toEqual('http://example.org')
    })
  })

  describe('#path', () => {
    it('ensures leading "/"', () => {
      methodDescriptor.path = 'api/example.json'
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json')
    })

    it('append params as query string', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.params = { id: 1, title: 'test' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json?id=1&title=test')
    })

    it('interpolates paths with dynamic sections', () => {
      methodDescriptor.path = '/api/example/{id}.json'
      methodDescriptor.params = { id: 1, title: 'test' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example/1.json?title=test')
    })

    describe('when dynamic section is not provided', () => {
      it('raises an exception', () => {
        methodDescriptor.path = '/api/example/{id}.json'
        expect(() => new Request(methodDescriptor).path())
          .toThrowError('[Mappersmith] required parameter missing (id), "/api/example/{id}.json" cannot be resolved')
      })
    })

    it('does not include headers', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.params = { [methodDescriptor.headersAttr]: { 'Content-Type': 'application/json' } }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json')
    })

    it('does not include body', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.bodyAttr = 'body'
      methodDescriptor.params = { [methodDescriptor.bodyAttr]: 'body-payload' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json')
    })
  })

  describe('#processor', () => {
    it('returns the "processor" configured in the method descriptor', () => {
      methodDescriptor.processor = () => true
      const request = new Request(methodDescriptor)
      expect(request.processor()()).toEqual(true)
    })
  })

  describe('#headers', () => {
    describe('with pre configured headers', () => {
      it('returns available headers', () => {
        methodDescriptor.headers = { Authorization: 'token-123' }
        const request = new Request(methodDescriptor)
        expect(request.headers()).toEqual({ authorization: 'token-123' })
      })
    })

    describe('with request headers', () => {
      it('returns available headers', () => {
        methodDescriptor.headers = { Authorization: 'token-123' }
        const request = new Request(methodDescriptor, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        expect(request.headers()).toEqual({
          authorization: 'token-123',
          'content-type': 'application/json'
        })
      })
    })
  })
})
