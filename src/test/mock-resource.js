import MockRequest from './mock-request'
import Request from '../request'

function MockResource(id, client) {
  if (!client || !client._manifest) {
    throw new Error('[Mappersmith Test] "mockClient" received an invalid client')
  }

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
  /**
   * @return {MockResource}
   */
  resource(resourceName) {
    this.resourceName = resourceName
    return this
  },

  /**
   * @return {MockResource}
   */
  method(methodName) {
    this.methodName = methodName
    return this
  },

  /**
   * @return {MockResource}
   */
  with(requestParams) {
    this.requestParams = requestParams
    return this
  },

  /**
   * @return {MockResource}
   */
  headers(responseHeaders) {
    this.responseHeaders = responseHeaders
    return this
  },

  /**
   * @return {MockResource}
   */
  status(responseStatus) {
    this.responseStatus = responseStatus
    return this
  },

  /**
   * @return {MockResource}
   */
  response(responseData) {
    this.responseData = responseData
    this.mockRequest = this.toMockRequest()

    return this.mockRequest.assertObject()
  },

  /**
   * @return {MockRequest}
   */
  toMockRequest() {
    const methodDescriptor = this.manifest.createMethodDescriptor(this.resourceName, this.methodName)
    const initialRequest = new Request(methodDescriptor, this.requestParams)
    const middlewares = this.manifest.createMiddlewares()
    const finalRequest = middlewares
      .reduce((request, middleware) => middleware.request(request), initialRequest)

    return new MockRequest(this.id, {
      method: finalRequest.method(),
      url: finalRequest.url(),
      body: finalRequest.body(),
      response: {
        status: this.responseStatus,
        headers: this.responseHeaders,
        body: this.responseData
      }
    })
  }
}

export default MockResource
