import fauxJax from 'faux-jax-tulios'
import Fetch from '../../../src/gateway/fetch'
import { configs } from '../../../src/index'
import MethodDescriptor from '../../../src/method-descriptor'
import { createGatewayAsserts, respondWith } from '../../helper'

describe('Gateway / Fetch', () => {
  let originalConfigs
  let methodDescriptor, requestParams, httpResponse

  const { assertSuccess, assertFailure } = createGatewayAsserts(() => [
    Fetch,
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

  it('sets the gateway correctly', async () => {
    const { configs } = await import('../../../src/index')
    expect(configs.gateway).toBe(Fetch)
  })

  for (const methodName of ['get', 'post', 'put', 'delete', 'patch']) {
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
})
