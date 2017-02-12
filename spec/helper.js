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
        const error = response.rawData ? response.rawData() : response
        done.fail(`test failed with promise error: ${error}`)
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
        const error = response.rawData ? response.rawData() : response
        done.fail(`Expected this request to fail: ${error}`)
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
    return request.enhance({
      headers: { 'x-middleware-phase': 'request' }
    })
  },

  response(next) {
    return next().then((response) => response.enhance({
      headers: { 'x-middleware-phase': 'response' }
    }))
  }
})

let countMiddlewareCurrent = 0
let countMiddlewareStack = []

export const getCountMiddlewareCurrent = () => countMiddlewareCurrent
export const getCountMiddlewareStack = () => countMiddlewareStack
export const resetCountMiddleware = () => {
  countMiddlewareCurrent = 0
  countMiddlewareStack = []
}

export const countMiddleware = () => ({
  request(request) {
    return request
  },

  response(next) {
    return next().then((response) => {
      countMiddlewareStack.push(response.data())
      return new Response(response.request(), 200, ++countMiddlewareCurrent)
    })
  }
})

export const getManifest = (middlewares = []) => ({
  host: 'http://example.org',
  middlewares,
  resources: {
    User: {
      all: { path: '/users' },
      byId: { path: '/users/{id}' }
    },
    Blog: {
      post: { method: 'post', path: '/blogs' },
      addComment: { method: 'put', path: '/blogs/{id}/comment' }
    }
  }
})
