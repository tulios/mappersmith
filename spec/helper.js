import fauxJax from 'faux-jax-tulios'
import Request from 'src/request'
import Response from 'src/response'
import MethodDescriptor from 'src/method-descriptor'
import { assign } from 'src/utils'

export function createGatewayAsserts(gatewayArgsGenerator) {
  return {
    assertSuccess: () => {
      return createGatewaySuccessAssert(...gatewayArgsGenerator())
    },

    assertFailure: () => {
      return createGatewayFailureAssert(...gatewayArgsGenerator())
    }
  }
}

export function createGatewaySuccessAssert(Gateway, methodDescriptor, requestParams) {
  return (done, assertsCallback) => {
    const request = new Request(methodDescriptor, requestParams)
    const gateway = new Gateway(request)

    gateway
      .call()
      .then((response) => {
        assertsCallback(response)
        done()
      })
      .catch((response) => {
        const message = response.rawData()
        done.fail(`test failed with promise error: ${message}`)
      })
  }
}

export function createGatewayFailureAssert(Gateway, methodDescriptor, requestParams) {
  return (done, assertsCallback) => {
    const request = new Request(methodDescriptor, requestParams)
    const gateway = new Gateway(request)

    gateway
      .call()
      .then((response) => {
        done.fail(`Expected this request to fail: ${response}`)
      })
      .catch((response) => {
        assertsCallback(response)
        done()
      })
  }
}

export function respondWith(responseObj, assertsCallback) {
  fauxJax.on('request', (fauxJaxRequest) => {
    assertsCallback && assertsCallback(fauxJaxRequest)
    fauxJaxRequest.respond(
      responseObj.status,
      Object.assign({ 'content-type': 'application/json' }, responseObj.headers),
      responseObj.responseText
    )
  })
}

export const headerMiddleware = () => ({
  request(request) {
    return new Request(
      new MethodDescriptor(
        assign({}, request.methodDescriptor, {
          headers: { 'x-middleware-phase': 'request' }
        })
      ),
      request.requestParams
    )
  },

  response(promise) {
    return promise.then((response) => new Response(
      response.request(),
      response.status(),
      response.rawData(),
      assign({}, response.headers(), {
        'x-middleware-phase': 'response'
      })
    ))
  }
})
