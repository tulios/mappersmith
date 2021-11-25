import MethodDescriptor from './method-descriptor'
import { Request } from './request'

const methodDescriptorParams = {
  param: 'method-desc-value',
  'method-desc-param': 'method-desc-value',
}

const methodDescriptorArgs = {
  headers: { header: 'method-desc-value', 'Method-Desc-Header': 'method-desc-value' },
  host: 'http://original-host.com/',
  params: methodDescriptorParams,
  path: '/path',
}

const methodDescriptor = new MethodDescriptor(methodDescriptorArgs)

const requestParams = {
  auth: { username: 'peter', password: 'pan' },
  body: { payload: { 'request-payload': 'request-value' }, 'request-payload': 'request-value' },
  headers: { header: 'request-value', 'Request-Header': 'request-value' },
  host: 'http://request-host.com/',
  param: 'request-value',
  'request-param': 'request-value',
  timeout: 450,
}

describe('Request', () => {
  it('requestParams is optional', async () => {
    const request = new Request(methodDescriptor)
    expect(request).toEqual({
      methodDescriptor,
      requestParams: {},
    })
  })

  it('sets requestParams', async () => {
    const request = new Request(methodDescriptor, requestParams)

    expect(request).toEqual({
      methodDescriptor,
      requestParams,
    })
  })

  describe('#params', () => {
    it('merges methodDescriptor params with requestParams', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.params()).toEqual({
        'method-desc-param': 'method-desc-value',
        param: 'request-value',
        'request-param': 'request-value',
      })
    })
  })

  describe('#method', () => {
    it('returns method descriptor method', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.method()).toEqual(methodDescriptor.method)
    })
  })

  describe('#host', () => {
    it('returns host name without trailing slash', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.host()).toEqual('http://original-host.com')
    })

    it('returns request host name when allow resource host override', async () => {
      const methodDescriptor = new MethodDescriptor({
        ...methodDescriptorArgs,
        allowResourceHostOverride: true,
      })
      const request = new Request(methodDescriptor, requestParams)
      expect(request.host()).toEqual('http://request-host.com')
    })
  })

  describe('#path', () => {
    it('returns path with parameters and leading slash.', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.path()).toEqual(
        '/path?param=request-value&method-desc-param=method-desc-value&request-param=request-value'
      )
    })

    it('returns result of method descriptor path function', async () => {
      const methodDescriptor = new MethodDescriptor({
        ...methodDescriptorArgs,
        path: (params) => {
          return Object.keys(params).join('/')
        },
      })
      const request = new Request(methodDescriptor, requestParams)
      expect(request.path()).toEqual(
        '/param/method-desc-param/request-param?param=request-value&method-desc-param=method-desc-value&request-param=request-value'
      )
    })
  })

  describe('#pathTemplate', () => {
    it('returns path with parameters and leading slash.', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.pathTemplate()).toEqual('/path')
    })

    it('adds a slash if none exist', async () => {
      const methodDescriptor = new MethodDescriptor({
        ...methodDescriptorArgs,
        path: 'without-slash',
      })
      const request = new Request(methodDescriptor, requestParams)
      expect(request.pathTemplate()).toEqual('/without-slash')
    })

    it.skip('returns result of method descriptor path function', async () => {
      const methodDescriptor = new MethodDescriptor({
        ...methodDescriptorArgs,
        path: (params) => {
          return Object.keys(params).join('/')
        },
      })
      const request = new Request(methodDescriptor, requestParams)
      expect(request.pathTemplate()).toEqual('/param/method-desc-param/request-param')
    })
  })

  describe('#url', () => {
    it('returns the full URL', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.url()).toEqual(
        'http://original-host.com/path?param=request-value&method-desc-param=method-desc-value&request-param=request-value'
      )
    })
  })

  describe('#headers', () => {
    it('returns an object with the headers with names converted to lowercase', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.headers()).toEqual({
        header: 'request-value',
        'method-desc-header': 'method-desc-value',
        'request-header': 'request-value',
      })
    })
  })

  describe('#body', () => {
    it('returns requestParams body', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.body()).toEqual(requestParams.body)
    })
  })

  describe('#auth', () => {
    it('returns requestParams auth', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.auth()).toEqual(requestParams.auth)
    })
  })

  describe('#timeout', () => {
    it('returns requestParams timeout', async () => {
      const request = new Request(methodDescriptor, requestParams)
      expect(request.timeout()).toEqual(requestParams.timeout)
    })
  })

  describe('#isBinary', () => {
    it('returns method descriptor binary value', async () => {
      const methodDescriptor = new MethodDescriptor({
        ...methodDescriptorArgs,
        binary: true,
      })
      const request = new Request(methodDescriptor, requestParams)
      expect(request.isBinary()).toEqual(true)
    })
  })

  describe('#enhance', () => {
    it('returns a new request enhanced by current request', async () => {
      const request = new Request(methodDescriptor, requestParams)
      const extras = {
        auth: { 'enhanced-auth': 'enhanced-auth-value' },
        body: 'enhanced-body',
        headers: { 'enhanced-header': 'enhanced-header-value' },
        host: 'http://enhanced-host.com',
        params: { 'enhanced-param': 'enhanced-param-value' },
        timeout: 100,
      }
      expect(request.enhance(extras)).toEqual(
        new Request(methodDescriptor, {
          ...extras.params,
          param: 'request-value',
          'request-param': 'request-value',
          auth: extras.auth,
          body: extras.body,
          host: extras.host,
          headers: { ...extras.headers, ...requestParams.headers },
          timeout: 100,
        })
      )
    })
  })
})
