import MockResponse from './mock-response'
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
  this.mockResponse = null
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
    this.mockResponse = this.toMockResponse()

    return this.mockResponse.assertObject()
  },

  toMockResponse() {
    const methodDescriptor = this.manifest.createMethodDescriptor(this.resourceName, this.methodName)
    const request = new Request(methodDescriptor, this.requestParams)

    return new MockResponse(this.id, {
      method: request.method(),
      url: request.url(),
      status: this.responseStatus,
      headers: this.responseHeaders,
      response: this.responseData
    })
  }
}

export default MockResource
