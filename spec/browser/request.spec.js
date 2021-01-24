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

    it('does not return the body configured param', () => {
      methodDescriptor.params = { id: 1, payload: 'abc' }
      methodDescriptor.bodyAttr = 'payload'
      const request = new Request(methodDescriptor, { title: 'test' })
      expect(request.params()).toEqual({ id: 1, title: 'test' })
    })

    it('does not return the headers configured param', () => {
      methodDescriptor.params = { id: 1, myHeaders: { a: 1 } }
      methodDescriptor.headersAttr = 'myHeaders'
      const request = new Request(methodDescriptor, { title: 'test' })
      expect(request.params()).toEqual({ id: 1, title: 'test' })
    })

    it('does not return the host configured param', () => {
      methodDescriptor.params = { id: 1, myHost: 'http://example.org' }
      methodDescriptor.headersAttr = 'myHost'
      const request = new Request(methodDescriptor, { title: 'test' })
      expect(request.params()).toEqual({ id: 1, title: 'test' })
    })
  })

  describe('#host', () => {
    it('has blank as the default host', () => {
      expect(new Request(methodDescriptor).host()).toEqual('')
    })

    it('returns the configured host param from params', () => {
      methodDescriptor.hostAttr = 'differentHostParam'
      methodDescriptor.allowResourceHostOverride = true
      const request = new Request(methodDescriptor, { differentHostParam: 'http://example.org' })
      expect(request.host()).toEqual('http://example.org')
    })

    describe('with pre configured host', () => {
      it('returns the host', () => {
        methodDescriptor.host = 'http://example.org'
        const request = new Request(methodDescriptor)
        expect(request.host()).toEqual('http://example.org')
      })
    })

    describe('with request host and allowResourceHostOverride=true', () => {
      it('returns the host', () => {
        methodDescriptor.allowResourceHostOverride = true
        const request = new Request(methodDescriptor, { host: 'http://example.org' })
        expect(request.host()).toEqual('http://example.org')
      })
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

    it('appends params as query string', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.params = { id: 1, title: 'test' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json?id=1&title=test')
    })

    it('encodes query string params', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.params = { email: 'email+test@example.com' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json?email=email%2Btest%40example.com')
    })

    it('appends the query string with a leading & if the path has a hard-coded query string', () => {
      methodDescriptor.path = '/api/example.json?id=1'
      methodDescriptor.params = { title: 'test' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json?id=1&title=test')
    })

    it('renames the params according to their queryParamAlias when appending them to the query string', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.params = { userId: 1, transactionId: 2 }
      methodDescriptor.queryParamAlias = { userId: 'user_id' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json?user_id=1&transactionId=2')
    })

    it('encodes aliased query string params', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.params = { userEmail: 'email+test@example.com' }
      methodDescriptor.queryParamAlias = { userEmail: 'user_email' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json?user_email=email%2Btest%40example.com')
    })

    it('interpolates paths with dynamic segments', () => {
      methodDescriptor.path = '/api/example/{id}.json'
      methodDescriptor.params = { id: 1, title: 'test' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example/1.json?title=test')
    })

    it('interpolates paths with optional dynamic segments', () => {
      methodDescriptor.path = '/api/example/{id?}.json'
      methodDescriptor.params = { 'id': 1, title: 'test' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example/1.json?title=test')
    })

    it('interpolates paths with optional dynamic segments with falsy value', () => {
      methodDescriptor.path = '/api/{boolean}/example/{id?}.json'
      methodDescriptor.params = { 'id': 0, boolean: false, title: 'test' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/false/example/0.json?title=test')
    })

    it('interpolates paths with multiple occurrence of same dynamic segment', () => {
      methodDescriptor.path = '/api/{path?}/{path}/{id}.json'
      methodDescriptor.params = { id: 1, path: 'test', title: 'value' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/test/test/1.json?title=value')
    })

    it('encodes params in dynamic segments', () => {
      methodDescriptor.path = '/api/example.json?email={email}'
      methodDescriptor.params = { email: 'email+test@example.com' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json?email=email%2Btest%40example.com')
    })

    it('does not apply queryParamAlias to interpolated dynamic segments', () => {
      methodDescriptor.path = '/api/example/{userId}.json'
      methodDescriptor.params = { userId: 1 }
      methodDescriptor.queryParamAlias = { userId: 'user_id' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example/1.json')
    })

    describe('when dynamic segment is not provided', () => {
      it('removes optional dynamic segments', () => {
        methodDescriptor.path = '{prefix?}/api/{optional?}/example.json'
        methodDescriptor.params = {}
        const path = new Request(methodDescriptor).path()
        expect(path).toEqual('/api/example.json')
      })

      it('removes optional dynamic segments with null or undefined value', () => {
        methodDescriptor.path = '/api/{null?}/path/{undefined?}/example.json'
        methodDescriptor.params = { 'undefined': undefined, 'null': null }
        const path = new Request(methodDescriptor).path()
        expect(path).toEqual('/api/path/example.json')
      })

      it('raises an exception', () => {
        methodDescriptor.path = '/api/example/{id}.json'
        expect(() => new Request(methodDescriptor).path())
          .toThrowError('[Mappersmith] required parameter missing (id), "/api/example/{id}.json" cannot be resolved')
      })
    })

    describe('when path is a function', () => {
      it('calls the function to resolve request path', () => {
        methodDescriptor.path = jest.fn(() => 'dynamic_path')
        const path = new Request(methodDescriptor).path()
        expect(methodDescriptor.path).toHaveBeenCalled()
        expect(path).toEqual('/dynamic_path')
      })

      it('passes given params to the path function', () => {
        methodDescriptor.path = jest.fn(params => {
          const idParts = params.id.split('')
          delete params['id']
          return `${idParts.join('/')}.json`
        })
        methodDescriptor.params = { id: '123' }

        const path = new Request(methodDescriptor).path()
        expect(path).toEqual('/1/2/3.json')
      })

      it('path function passes unused params in querystring', () => {
        methodDescriptor.path = params => {
          const idParts = params.id.split('')
          delete params['id']
          return `${idParts.join('/')}.htm`
        }
        methodDescriptor.params = { id: '123', q: 'search' }

        const path = new Request(methodDescriptor).path()
        expect(path).toEqual('/1/2/3.htm?q=search')
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

    it('does not include host', () => {
      methodDescriptor.path = '/api/example.json'
      methodDescriptor.params = { [methodDescriptor.hostAttr]: 'http://example.com' }
      const path = new Request(methodDescriptor).path()
      expect(path).toEqual('/api/example.json')
    })
  })

  describe('#url', () => {
    it('joins host and path', () => {
      methodDescriptor.host = 'http://example.org'
      methodDescriptor.path = 'api/example.json'
      const url = new Request(methodDescriptor).url()
      expect(url).toEqual('http://example.org/api/example.json')
    })
  })

  describe('#headers', () => {
    it('returns the configured headers param from params', () => {
      methodDescriptor.headersAttr = 'differentHeadersParam'
      const request = new Request(methodDescriptor, { differentHeadersParam: { Authorization: 'token-123' } })
      expect(request.headers()).toEqual({ authorization: 'token-123' })
    })

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

  describe('#header', () => {
    it('returns the value of the given header name', () => {
      methodDescriptor.headers = { Authorization: 'token-123' }
      const request = new Request(methodDescriptor)
      expect(request.header('authorization')).toEqual('token-123')
    })
  })

  describe('#body', () => {
    it('returns the configured body param from params', () => {
      methodDescriptor.bodyAttr = 'differentParam'
      const request = new Request(methodDescriptor, { differentParam: 'abc123' })
      expect(request.body()).toEqual('abc123')
    })
  })

  describe('#auth', () => {
    it('returns the configured auth param from params', () => {
      const authData = { username: 'bob', password: 'bob' }
      methodDescriptor.authAttr = 'differentAuthParam'
      const request = new Request(methodDescriptor, { differentAuthParam: authData })
      expect(request.auth()).toEqual(authData)
    })
  })

  describe('#timeout', () => {
    it('returns the configured timeout param from params', () => {
      methodDescriptor.timeoutAttr = 'differentTimeoutParam'
      const request = new Request(methodDescriptor, { differentTimeoutParam: 1000 })
      expect(request.timeout()).toEqual(1000)
    })
  })

  describe('#method', () => {
    it('returns the http method always in lowercase', () => {
      methodDescriptor.method = 'GET'
      const request = new Request(methodDescriptor)
      expect(request.method()).toEqual('get')
    })
  })

  describe('#enhance', () => {
    it('creates a new request based on the current request merging the params', () => {
      const request = new Request(methodDescriptor, { a: 1 })
      const enhancedRequest = request.enhance({ params: { b: 2 } })
      expect(enhancedRequest).not.toEqual(request)
      expect(enhancedRequest.params()).toEqual({ a: 1, b: 2 })
    })

    it('creates a new request based on the current request merging the headers', () => {
      const request = new Request(methodDescriptor, { headers: { 'x-old': 'no' } })
      const enhancedRequest = request.enhance({ headers: { 'x-special': 'yes' } })
      expect(enhancedRequest).not.toEqual(request)
      expect(enhancedRequest.headers()).toEqual({ 'x-old': 'no', 'x-special': 'yes' })
    })

    it('creates a new request based on the current request replacing the body', () => {
      const request = new Request(methodDescriptor, { body: 'payload-1' })
      const enhancedRequest = request.enhance({ body: 'payload-2' })
      expect(enhancedRequest).not.toEqual(request)
      expect(enhancedRequest.body()).toEqual('payload-2')
    })

    it('creates a new request based on the current request replacing the auth', () => {
      const authData1 = { username: 'bob', password: 'bob' }
      const authData2 = { username: 'bob', password: 'bill' }
      const request = new Request(methodDescriptor, { auth: authData1 })
      const enhancedRequest = request.enhance({ auth: authData2 })
      expect(enhancedRequest).not.toEqual(request)
      expect(enhancedRequest.auth()).toEqual(authData2)
    })

    it('creates a new request based on the current request replacing the timeout', () => {
      const request = new Request(methodDescriptor, { timeout: 1000 })
      const enhancedRequest = request.enhance({ timeout: 2000 })
      expect(enhancedRequest).not.toEqual(request)
      expect(enhancedRequest.timeout()).toEqual(2000)
    })

    it('does not remove the previously assigned "body"', () => {
      const request = new Request(methodDescriptor, { body: 'test' })
      const enhancedRequest = request.enhance({})
      expect(enhancedRequest.body()).toEqual('test')
    })

    it('does not remove the previously assigned "auth"', () => {
      const request = new Request(methodDescriptor, { auth: { username: 'a', password: 'b' } })
      const enhancedRequest = request.enhance({})
      expect(enhancedRequest.auth()).toEqual({ username: 'a', password: 'b' })
    })

    it('does not remove the previously assigned "timeout"', () => {
      const request = new Request(methodDescriptor, { timeout: 1000 })
      const enhancedRequest = request.enhance({})
      expect(enhancedRequest.timeout()).toEqual(1000)
    })

    it('does not remove the previously assigned "host" if allowResourceHostOverride=true', () => {
      methodDescriptor.allowResourceHostOverride = true
      const request = new Request(methodDescriptor, { host: 'http://example.org' })
      const enhancedRequest = request.enhance({})
      expect(enhancedRequest.host()).toEqual('http://example.org')
    })

    describe('for requests with a different "headers" key', () => {
      beforeEach(() => {
        methodDescriptor = new MethodDescriptor({ headersAttr: 'snowflake' })
      })

      it('creates a new request based on the current request merging the custom "headers" key', () => {
        const request = new Request(methodDescriptor, { snowflake: { 'x-old': 'no' } })
        const enhancedRequest = request.enhance({ headers: { 'x-special': 'yes' } })
        expect(enhancedRequest).not.toEqual(request)
        expect(enhancedRequest.headers()).toEqual({ 'x-old': 'no', 'x-special': 'yes' })
      })
    })

    describe('for requests with a different "body" key', () => {
      beforeEach(() => {
        methodDescriptor = new MethodDescriptor({ bodyAttr: 'snowflake' })
      })

      it('creates a new request based on the current request replacing the custom "body"', () => {
        const request = new Request(methodDescriptor, { snowflake: 'payload-1' })
        const enhancedRequest = request.enhance({ body: 'payload-2' })
        expect(enhancedRequest).not.toEqual(request)
        expect(enhancedRequest.body()).toEqual('payload-2')
      })
    })

    describe('for requests with a different "auth" key', () => {
      beforeEach(() => {
        methodDescriptor = new MethodDescriptor({ authAttr: 'snowflake' })
      })

      it('creates a new request based on the current request replacing the custom "auth"', () => {
        const authData1 = { username: 'bob', password: 'bob' }
        const authData2 = { username: 'bob', password: 'bill' }
        const request = new Request(methodDescriptor, { snowflake: authData1 })
        const enhancedRequest = request.enhance({ auth: authData2 })
        expect(enhancedRequest).not.toEqual(request)
        expect(enhancedRequest.auth()).toEqual(authData2)
      })
    })

    describe('for requests with a different "timeout" key', () => {
      beforeEach(() => {
        methodDescriptor = new MethodDescriptor({ timeoutAttr: 'snowflake' })
      })

      it('creates a new request based on the current request replacing the custom "timeout"', () => {
        const request = new Request(methodDescriptor, { snowflake: 1000 })
        const enhancedRequest = request.enhance({ timeout: 2000 })
        expect(enhancedRequest).not.toEqual(request)
        expect(enhancedRequest.timeout()).toEqual(2000)
      })
    })

    describe('for requests with a different "host" key', () => {
      beforeEach(() => {
        methodDescriptor = new MethodDescriptor({ hostAttr: 'snowflake' })
        methodDescriptor.allowResourceHostOverride = true
      })

      it('creates a new request based on the current request replacing the custom "host"', () => {
        const request = new Request(methodDescriptor, { snowflake: 'http://new-api.com' })
        const enhancedRequest = request.enhance({ host: 'http://old-api.com' })
        expect(enhancedRequest).not.toEqual(request)
        expect(enhancedRequest.host()).toEqual('http://old-api.com')
      })
    })
  })
})
