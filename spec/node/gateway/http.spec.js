import fauxJax from 'faux-jax-tulios'

import { configs } from 'src/index'
import HTTP from 'src/gateway/http'
import MethodDescriptor from 'src/method-descriptor'
import { btoa, assign } from 'src/utils'

import { createGatewayAsserts, respondWith } from 'spec/helper'

describe('Gateway / HTTP', () => {
  let originalConfigs
  let methodDescriptor, requestParams, httpResponse

  const { assertSuccess, assertFailure } = createGatewayAsserts(() => [
    HTTP,
    methodDescriptor,
    requestParams,
  ])

  beforeEach(() => {
    jest.useRealTimers()
    fauxJax.install()

    if (!originalConfigs) {
      originalConfigs = configs.gatewayConfigs
    }

    requestParams = {}

    methodDescriptor = new MethodDescriptor({
      host: 'http://example.org',
      path: '/api/examples.json',
    })

    httpResponse = {
      status: 200,
      responseText: JSON.stringify({ work: true }),
    }
  })

  afterEach(() => {
    fauxJax.restore()
    configs.gatewayConfigs = originalConfigs
  })

  for (const methodName of [
    'get',
    // , 'post', 'put', 'delete', 'patch'
  ]) {
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
          expect(response.headers()).toEqual(
            expect.objectContaining({ 'content-type': 'application/json' })
          )
          expect(response.timeElapsed).not.toBeNull()
        })
      })

      it.only('sends all defined headers', (done) => {
        console.log(`[spec ${methodName}] gateway =>`, configs.gateway)
        requestParams = {
          [methodDescriptor.headersAttr]: { authorization: 'token' },
        }
        console.log(`[spec ${methodName}] httpResponse =>`, httpResponse)
        respondWith(httpResponse, (fauxJaxRequest) => {
          console.log(
            `[spec ${methodName}] fauxJaxRequest.requestHeaders`,
            fauxJaxRequest.requestHeaders
          )
          expect(fauxJaxRequest.requestHeaders).toEqual(
            expect.objectContaining({
              authorization: 'token',
            })
          )
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })

      describe('when the request fails', () => {
        it('rejects the promise with the response', (done) => {
          respondWith({
            status: 404,
            responseText: JSON.stringify({ fail: true }),
          })

          assertFailure()(done, (response) => {
            expect(response.status()).toEqual(404)
            expect(response.timeElapsed).not.toBeNull()
            expect(response.data()).toEqual({ fail: true })
            expect(response.headers()).toEqual(
              expect.objectContaining({
                'content-type': 'application/json',
              })
            )
          })
        })
      })
    })
  }

  for (const methodName of ['post', 'put', 'delete', 'patch']) {
    describe(`#${methodName} with body`, () => {
      beforeEach(() => {
        methodDescriptor.method = methodName
      })

      it('encode as x-www-form-urlencoded by default', (done) => {
        requestParams = {
          [methodDescriptor.bodyAttr]: { firstName: 'John', lastName: 'Doe' },
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestBody).toEqual('firstName=John&lastName=Doe')
          expect(fauxJaxRequest.requestHeaders).toEqual(
            expect.objectContaining({
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            })
          )
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })

      it('prioritizes user-defined Content-Type header', (done) => {
        requestParams = {
          [methodDescriptor.bodyAttr]: JSON.stringify({ firstName: 'John', lastName: 'Doe' }),
          headers: { 'content-type': 'application/json' },
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestHeaders).toEqual(
            expect.objectContaining({
              'content-type': 'application/json',
            })
          )
          expect(fauxJaxRequest.requestBody).toEqual(
            JSON.stringify({
              firstName: 'John',
              lastName: 'Doe',
            })
          )
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })

      it('adds "content-length" header', (done) => {
        const body = { name: 'ÄÅÁÃÀÉ' }
        requestParams = {
          [methodDescriptor.bodyAttr]: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestHeaders).toEqual(
            expect.objectContaining({ 'content-length': '23' })
          )
          expect(fauxJaxRequest.requestBody).toEqual(JSON.stringify(body))
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })
    })
  }

  for (const methodName of ['put', 'delete', 'patch']) {
    describe(`#${methodName} emulating HTTP method`, () => {
      beforeEach(() => {
        methodDescriptor.method = methodName
        configs.gatewayConfigs.emulateHTTP = true
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
          expect(fauxJaxRequest.requestHeaders).toEqual(
            expect.objectContaining({
              'x-http-method-override': methodName,
            })
          )
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
        })
      })
    })
  }

  for (const methodName of ['get', 'post', 'put', 'delete', 'patch']) {
    describe(`#${methodName} with request.auth() configured`, () => {
      beforeEach(() => {
        methodDescriptor.method = methodName
      })

      it('adds "Authorization: Basic base64" header', (done) => {
        const authData = { username: 'bob', password: 'bob' }
        const maskedAuth = assign({}, authData, { password: '***' })
        requestParams = {
          [methodDescriptor.authAttr]: authData,
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestHeaders).toEqual(
            expect.objectContaining({
              authorization: `Basic ${btoa('bob:bob')}`,
            })
          )
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
          expect(response.originalRequest.auth()).toEqual(maskedAuth)
        })
      })
    })
  }

  describe('#head', () => {
    beforeEach(() => {
      methodDescriptor.method = 'head'
      httpResponse = { status: 200 }
    })

    it('resolves the promise with the response', (done) => {
      respondWith(httpResponse)
      assertSuccess()(done, (response) => {
        expect(response.request().method()).toEqual('head')
        expect(response.status()).toEqual(200)
        expect(response.data()).toEqual('')
        expect(response.headers()).toEqual(
          expect.objectContaining({ 'content-type': 'application/json' })
        )
        expect(response.timeElapsed).not.toBeNull()
      })
    })

    it('sends all defined headers', (done) => {
      requestParams = {
        [methodDescriptor.headersAttr]: { authorization: 'token' },
      }

      respondWith(httpResponse, (fauxJaxRequest) => {
        expect(fauxJaxRequest.requestHeaders).toEqual(
          expect.objectContaining({
            authorization: 'token',
          })
        )
      })

      assertSuccess()(done, (response) => {
        expect(response.status()).toEqual(200)
      })
    })

    describe('when the request fails', () => {
      it('rejects the promise with the response', (done) => {
        respondWith({ status: 404 })

        assertFailure()(done, (response) => {
          expect(response.status()).toEqual(404)
          expect(response.timeElapsed).not.toBeNull()
          expect(response.data()).toEqual('')
          expect(response.headers()).toEqual(
            expect.objectContaining({
              'content-type': 'application/json',
            })
          )
        })
      })
    })

    describe(`with request.auth() configured`, () => {
      it('adds "Authorization: Basic base64" header', (done) => {
        const authData = { username: 'bob', password: 'bob' }
        const maskedAuth = assign({}, authData, { password: '***' })
        requestParams = {
          [methodDescriptor.authAttr]: authData,
        }

        respondWith(httpResponse, (fauxJaxRequest) => {
          expect(fauxJaxRequest.requestHeaders).toEqual(
            expect.objectContaining({
              authorization: `Basic ${btoa('bob:bob')}`,
            })
          )
        })

        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
          expect(response.originalRequest.auth()).toEqual(maskedAuth)
        })
      })
    })
  })

  describe('with option "configure"', () => {
    it('calls the callback with request params', (done) => {
      methodDescriptor.method = 'get'
      const configure = jest.fn()
      configs.gatewayConfigs.HTTP.configure = configure

      respondWith(httpResponse)
      assertSuccess()(done, (response) => {
        expect(response.status()).toEqual(200)
        expect(configure).toHaveBeenCalledWith(expect.any(Object))
      })
    })
  })

  describe('with event callbacks', () => {
    for (const callbackName of [
      'onRequestWillStart',
      'onRequestSocketAssigned',
      'onResponseReadable',
      'onResponseEnd',
    ]) {
      it(`calls the ${callbackName} callback with request params`, (done) => {
        methodDescriptor.method = 'get'
        const callback = jest.fn()
        configs.gatewayConfigs.HTTP[callbackName] = callback

        respondWith(httpResponse)
        assertSuccess()(done, (response) => {
          expect(response.status()).toEqual(200)
          expect(callback).toHaveBeenCalledWith(expect.any(Object))
        })
      })
    }
  })
})
