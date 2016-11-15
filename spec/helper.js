import fauxJax from 'faux-jax-tulios'
import Request from 'src/request'
import MethodDescriptor from 'src/method-descriptor'

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
        const message = response.responseData
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
