import MockAssert from './mock-assert'
import Response from '../response'
import { isPlainObject, toQueryString } from '../utils'

/**
 * @param {Integer} id
 * @param {Object} props
 *   @param {String} props.method
 *   @param {String} props.url
 *   @param {String} props.body - request body
 *   @param {Object} props.response
 *     @param {String} props.response.body
 *     @param {Object} props.response.headers
 *     @param {Integer} props.response.status
 */
function MockRequest(id, props) {
  this.id = id

  this.method = props.method || 'get'
  this.url = props.url
  this.body = toQueryString(props.body)
  this.responseData = props.response.body
  this.responseHeaders = props.response.headers || {}
  this.responseStatus = props.response.status || 200

  this.calls = []

  if (isPlainObject(this.responseData)) {
    this.responseData = JSON.stringify(this.responseData)
    if (!this.responseHeaders['content-type']) {
      this.responseHeaders['content-type'] = 'application/json'
    }
  }
}

MockRequest.prototype = {
  /**
   * @return {Response}
   */
  call(request) {
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
  assertObject() {
    return new MockAssert(this.calls)
  },

  /**
   * Checks if the request matches with the mock HTTP method, URL and body
   *
   * @return {Boolean}
   */
  isExactMatch(request) {
    return this.method === request.method() &&
      this.url === request.url() &&
      this.body === toQueryString(request.body())
  },

  /**
   * Checks if the request partially matches the mock HTTP method and URL
   *
   * @return {Boolean}
   */
  isPartialMatch(request) {
    return new RegExp(this.method).test(request.method()) &&
      new RegExp(this.url).test(request.url())
  }
}

export default MockRequest
