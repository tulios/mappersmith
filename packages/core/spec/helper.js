import fauxJax from 'faux-jax-tulios'
import Request from '../src/request'
import Response from '../src/response'
import MethodDescriptor from '../src/method-descriptor'
import { configs as defaultConfigs } from '../src/index'

export function createGatewayAsserts(gatewayArgsGenerator) {
  return {
    assertSuccess: () => {
      return createGatewaySuccessAssert(...gatewayArgsGenerator())
    },

    assertFailure: () => {
      return createGatewayFailureAssert(...gatewayArgsGenerator())
    },
  }
}

export function createGatewaySuccessAssert(Gateway, methodDescriptor, requestParams) {
  return (done, assertsCallback) => {
    const request = new Request(methodDescriptor, requestParams)
    const gateway = new Gateway(request, defaultConfigs.gatewayConfigs)

    gateway
      .call()
      .then((response) => {
        assertsCallback(response)
        done()
      })
      .catch((response) => {
        const error = response.rawData ? response.rawData() : response
        console.log(response.error())
        done(`test failed with promise error: ${error}`)
      })
  }
}

export function createGatewayFailureAssert(Gateway, methodDescriptor, requestParams) {
  return (done, assertsCallback) => {
    const request = new Request(methodDescriptor, requestParams)
    const gateway = new Gateway(request, defaultConfigs.gatewayConfigs)

    gateway
      .call()
      .then((response) => {
        const error = response.rawData ? response.rawData() : response
        done(`Expected this request to fail: ${error}`)
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

export const headerMiddleware = ({ resourceName, resourceMethod }) => ({
  request(request) {
    return request.enhance({
      headers: {
        'x-middleware-phase': 'request',
      },
    })
  },

  response(next) {
    return next().then((response) =>
      response.enhance({
        headers: {
          'x-middleware-phase': 'response',
          'x-resource-name': resourceName,
          'x-resource-method': resourceMethod,
        },
      })
    )
  },
})

export const headerMiddlewareV2 = ({ resourceName, resourceMethod }) => ({
  prepareRequest(next) {
    return next().then((request) =>
      request.enhance({
        headers: {
          'x-middleware-phase': 'prepare-request',
        },
      })
    )
  },

  response(next) {
    return next().then((response) =>
      response.enhance({
        headers: {
          'x-middleware-phase': 'response',
          'x-resource-name': resourceName,
          'x-resource-method': resourceMethod,
        },
      })
    )
  },
})

export const asyncHeaderMiddleware = ({ resourceName, resourceMethod }) => ({
  async request(request) {
    return request.enhance({
      headers: {
        'x-middleware-phase': 'request',
      },
    })
  },

  response(next) {
    return next().then((response) =>
      response.enhance({
        headers: {
          'x-middleware-phase': 'response',
          'x-resource-name': resourceName,
          'x-resource-method': resourceMethod,
        },
      })
    )
  },
})

export const hostMiddleware = () => ({
  prepareRequest(next) {
    return next().then((request) =>
      request.enhance({
        host: 'http://new-host.com',
      })
    )
  },
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
  },
})

let countPrepareRequestMiddlewareCurrent = 0
let countPrepareRequestMiddlewareStack = []

export const getCountPrepareRequestMiddlewareCurrent = () => countPrepareRequestMiddlewareCurrent
export const getCountPrepareRequestMiddlewareStack = () => countPrepareRequestMiddlewareStack
export const resetCountPrepareRequestMiddleware = () => {
  countPrepareRequestMiddlewareCurrent = 0
  countPrepareRequestMiddlewareStack = []
}

export const countPrepareRequestMiddleware = () => ({
  prepareRequest(next) {
    return next().then((request) => {
      const count = parseInt(request.header('x-count'), 10)
      countPrepareRequestMiddlewareStack.push(count)
      return request.enhance({ headers: { 'x-count': count + 1 } })
    })
  },

  response(next) {
    return next()
  },
})

export const createRequest = (args = {}) => new Request(new MethodDescriptor(args))
