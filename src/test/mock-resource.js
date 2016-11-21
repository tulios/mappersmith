import MockRequest from './mock-request'
import Request from '../request'

function MockResource(id, client) {
  this.id = id
  this.manifest = client._manifest
  this.resourceName = null
  this.methodName = null
  this.requestParams = {}
  this.responseData = null
  this.responseHeaders = {}
  this.responseStatus = 200
  this.mockRequest = null
}

MockResource.prototype = {
  resource(resourceName) {
    this.resourceName = resourceName
    return this
  },

  method(methodName) {
    this.methodName = methodName
    return this
  },

  with(requestParams) {
    this.requestParams = requestParams
    return this
  },

  headers(responseHeaders) {
    this.responseHeaders = responseHeaders
    return this
  },

  status(responseStatus) {
    this.responseStatus = responseStatus
    return this
  },

  response(responseData) {
    this.responseData = responseData
    this.mockRequest = this.toMockRequest()

    return this.mockRequest.assertObject()
  },

  toMockRequest() {
    const methodDescriptor = this.manifest.createMethodDescriptor(this.resourceName, this.methodName)
    const request = new Request(methodDescriptor, this.requestParams)

    return new MockRequest(this.id, {
      method: request.method(),
      url: request.url(),
      response: {
        status: this.responseStatus,
        headers: this.responseHeaders,
        body: this.responseData
      }
    })
  }
}

export default MockResource
