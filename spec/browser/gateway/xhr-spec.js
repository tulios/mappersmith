import fauxJax from 'faux-jax'

import { configs } from 'src/index'
import XHR from 'src/gateway/xhr'
import MethodDescriptor from 'src/method-descriptor'

import { createGatewayAsserts, respondWith } from 'spec/browser/helper'

let originalConfigs
let methodDescriptor, requestParams, httpResponse
const { assertSuccess, assertFailure } = createGatewayAsserts(() => [
  XHR,
  methodDescriptor,
  requestParams
])

describe('XHR', () => {
  beforeEach(() => {
    fauxJax.install()

    if (!originalConfigs) {
      originalConfigs = configs.gateway
    }

    requestParams = {}

    methodDescriptor = new MethodDescriptor({
      host: 'http://example.org',
      path: '/api/examples.json'
    })

    httpResponse = {
      status: 200,
      responseText: JSON.stringify({ work: true })
    }
  })

  afterEach(() => {
    fauxJax.restore()
    configs.gateway = originalConfigs
  })

  for (let methodName of ['get', 'post', 'put', 'delete', 'patch']) {
    describe(`#${methodName}`, () => {
      beforeEach(() => {
        methodDescriptor.method = methodName
      })

      it('resolves the promise with the response', (done) => {
        respondWith(httpResponse)
        assertSuccess()(done, (response) => {
          expect(response.request().method()).toEqual(methodName)
          expect(response.status()).toEqual(200)
          expect(response.data()).toEqual({ work: true })
          expect(response.headers()).toEqual(jasmine.objectContaining({ 'content-type': 'application/json' }))
          expect(response.timeElapsed).not.toBeNull()
        })
      })

      it('sends all defined headers', (done) => {
        requestParams = {
          [methodDescriptor.headersAttr]: { authorization: 'token' }
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestHeaders).toEqual(jasmine.objectContaining({
            authorization: 'token'
          }))
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })

      describe('when the request fails', () => {
        it('rejects the promise with the response', (done) => {
          respondWith({
            status: 404,
            responseText: JSON.stringify({ fail: true })
          })

          assertFailure()(done, (response) => {
            expect(response.status()).toEqual(404)
            expect(response.timeElapsed).not.toBeNull()
            expect(response.data()).toEqual({ fail: true })
            expect(response.headers()).toEqual(jasmine.objectContaining({
              'content-type': 'application/json'
            }))
          })
        })
      })
    })
  }

  for (let methodName of ['post', 'put', 'delete', 'patch']) {
    describe(`#${methodName} with body`, () => {
      beforeEach(() => {
        methodDescriptor.method = methodName
      })

      it('encode as x-www-form-urlencoded by default', (done) => {
        requestParams = {
          [methodDescriptor.bodyAttr]: { firstName: 'John', lastName: 'Doe' }
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestBody).toEqual('firstName=John&lastName=Doe')
          expect(fauxJaxRequest.requestHeaders).toEqual(jasmine.objectContaining({
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          }))
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })

      it('prioritizes user-defined Content-Type header', (done) => {
        requestParams = {
          [methodDescriptor.bodyAttr]: JSON.stringify({ firstName: 'John', lastName: 'Doe' }),
          headers: { 'content-type': 'application/json' }
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestHeaders).toEqual(jasmine.objectContaining({
            'content-type': 'application/json'
          }))
          expect(fauxJaxRequest.requestBody).toEqual(JSON.stringify({
            firstName: 'John',
            lastName: 'Doe'
          }))
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })
    })
  }

  for (let methodName of ['put', 'delete', 'patch']) {
    describe(`#${methodName} emulating HTTP method`, () => {
      beforeEach(() => {
        methodDescriptor.method = methodName
        configs.gateway.emulateHTTP = true
      })

      it('sends a POST request', (done) => {
        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestMethod).toEqual('POST')
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })

      it(`adds _method=${methodName} to body`, (done) => {
        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestBody).toEqual(`_method=${methodName}`)
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })

      it(`adds header X-HTTP-Method-Override=${methodName}`, (done) => {
        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestHeaders).toEqual(jasmine.objectContaining({
            'x-http-method-override': methodName
          }))
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })
    })
  }

  describe('with option "configure"', () => {
    it('calls the callback with xhr object', (done) => {
      methodDescriptor.method = 'get'
      const configure = jasmine.createSpy('XHRConfigureCallback')
      configs.gateway.XHR.configure = configure

      respondWith(httpResponse)
      assertSuccess()(done, (response) => {
        expect(response.status()).toEqual(200)
        expect(configure).toHaveBeenCalledWith(jasmine.any(XMLHttpRequest))
      })
    })
  })

  describe('with option "withCredentials"', () => {
    it('sets the value', (done) => {
      methodDescriptor.method = 'get'
      configs.gateway.XHR.withCredentials = true

      respondWith(httpResponse, (fauxJaxRequest) => {
        expect(fauxJaxRequest.withCredentials).toEqual(true)
      })
      assertSuccess()(done, (response) => {
        expect(response.status()).toEqual(200)
      })
    })
  })
})
