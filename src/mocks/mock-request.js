import MockAssert from './mock-assert'
import Response from '../response'
import { isPlainObject, toQueryString } from '../utils'

/**
 * @param {number} id
 * @param {object} props
 *   @param {string} props.method
 *   @param {string|function} props.url
 *   @param {string|function} props.body - request body
 *   @param {object} props.response
 *     @param {string} props.response.body
 *     @param {object} props.response.headers
 *     @param {integer} props.response.status
 */
function MockRequest (id, props) {
  this.id = id

  this.method = props.method || 'get'
  this.urlFunction = typeof props.url === 'function'
  this.url = props.url
  this.bodyFunction = typeof props.body === 'function'
  this.body = this.bodyFunction ? props.body : toQueryString(props.body)
  this.responseHeaders = props.response.headers || {}
  this.setResponseData(props.response.body)
  this.responseStatus = props.response.status || 200

  this.calls = []
}

MockRequest.prototype = {
  /**
   * If passed a plain object, the data is stringified and the content-type header is set to JSON
   *
   * @public
   */
  setResponseData (responseData) {
    if (isPlainObject(responseData)) {
      this.responseData = JSON.stringify(responseData)
      if (!this.responseHeaders['content-type']) {
        this.responseHeaders['content-type'] = 'application/json'
      }
    } else {
      this.responseData = responseData
    }
  },

  /**
   * @return {Response}
   */
  call (request) {
    this.calls.push(request)
    return new Response(
      request,
      this.responseStatus,
      this.responseData,
      this.responseHeaders
    )
  },

  /**
   * @return {MockAssert}
   */
  assertObject () {
    return new MockAssert(this.calls)
  },

  /**
   * Checks if the request matches with the mock HTTP method, URL and body
   *
   * @return {boolean}
   */
  isExactMatch (request) {
    const bodyMatch = this.bodyFunction
      ? this.body(request.body())
      : this.body === toQueryString(request.body())

    const urlMatch = this.urlFunction
      ? this.url(request.url(), request.params())
      : this.url === request.url()

    return this.method === request.method() && urlMatch && bodyMatch
  },

  /**
   * Checks if the request partially matches the mock HTTP method and URL
   *
   * @return {boolean}
   */
  isPartialMatch (request) {
    return new RegExp(this.method).test(request.method()) &&
      new RegExp(this.url).test(request.url())
  },

  /**
   * @return {MockRequest}
   */
  toMockRequest () {
    return this
  }
}

export default MockRequest
