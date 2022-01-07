import { Request } from './request'
import { Response } from './response'
import { MethodDescriptor } from './method-descriptor'
import { requestFactory, responseFactory } from './test'

describe('mappersmith/test', () => {
  const method = 'GET'
  const host = 'http://example.org'
  const path = '/path'
  let methodDescriptor

  beforeEach(() => {
    methodDescriptor = new MethodDescriptor({ method, host, path })
  })

  describe('#requestFactory', () => {
    it('creates a request with a default method descriptor', async () => {
      const request = requestFactory()
      expect(request).toEqual(new Request(methodDescriptor))
    })

    it('accepts params to customize it', async () => {
      const requestParams = {
        auth: {
          'auth-key': 'auth-value',
        },
        body: {
          'body-key': 'body-value',
        },
        headers: {
          'my-header': 'my-header-value',
        },
        params: {
          group: 'general',
        },
        timeout: 20,
        'a key': 'a value',
      }
      const methodDescriptorParams = {
        method: 'POST',
        host: 'http://example.org',
        path: '/users/{group}',
      }

      const request = requestFactory({
        ...methodDescriptorParams,
        ...requestParams,
      })

      expect(request).toEqual(
        new Request(new MethodDescriptor(methodDescriptorParams), requestParams)
      )
    })
  })

  describe('#responseFactory', () => {
    let request

    beforeEach(() => {
      methodDescriptor = new MethodDescriptor({ method, host, path })
      request = new Request(methodDescriptor)
    })

    it('creates a response with a default request', async () => {
      const response = responseFactory()
      expect(response).toEqual(
        new Response(request, 200, '{}', { 'content-type': 'application/json' })
      )
    })

    it('accepts params to customize it', async () => {
      const status = 204
      const data = { foo: 'bar' }
      const headers = {
        'my-header': 'my-header-value',
      }
      const errors = [new Error('an error')]

      const methodDescriptorParams = {
        method: 'POST',
        host: 'http://example.org',
        path: '/users/{group}',
      }

      const response = responseFactory({
        ...methodDescriptorParams,
        status,
        data,
        headers,
        errors,
      })

      request = requestFactory(methodDescriptorParams)

      expect(response).toEqual(
        new Response(
          request,
          status,
          JSON.stringify(data),
          {
            'content-type': 'application/json',
            ...headers,
          },
          errors
        )
      )
    })

    it('accepts data as string or JSON and sets content-type accordingly', async () => {
      const jsonData = { foo: 'bar' }

      expect(
        responseFactory({
          data: jsonData,
        })
      ).toEqual(
        new Response(requestFactory(), 200, JSON.stringify(jsonData), {
          'content-type': 'application/json',
        })
      )

      const stringData = 'the returned text'

      expect(
        responseFactory({
          data: stringData,
        })
      ).toEqual(
        new Response(requestFactory(), 200, stringData, {
          'content-type': 'text/plain',
        })
      )
    })
  })
})
