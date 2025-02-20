import MockAssert from './mock-assert'
import Response from '../response'
import { isPlainObject } from '../utils/index'
import { clone } from '../utils/clone'
import { sortedUrl, toSortedQueryString, filterKeys } from './mock-utils'

/**
 * @param {number} id
 * @param {object} props
 *   @param {string} props.method
 *   @param {string|function} props.url
 *   @param {string|function} props.body - request body
 *   @param {string} props.mockName
 *   @param {object} props.response
 *     @param {string} props.response.body
 *     @param {object} props.response.headers
 *     @param {integer} props.response.status
 */

const MATCHED_AS_UNDEFINED_IN_MOCK = 'MATCHED_AS_UNDEFINED_IN_MOCK'
const MATCHED_BY_FUNCTION = 'MATCHED_BY_FUNCTION'
const MISMATCH_BY_FUNCTION = 'MISMATCHED_BY_FUNCTION'

function MockRequest(id, props) {
  this.id = id

  this.mockName = props.mockName ? props.mockName : this.id
  this.method = props.method || 'get'
  this.urlFunction = typeof props.url === 'function'
  this.url = props.url
  this.bodyFunction = typeof props.body === 'function'
  this.body = this.bodyFunction ? props.body : toSortedQueryString(props.body)
  this.headersFunction = typeof props.headers === 'function'
  this.headers = props.headersFunction ? props.headers : toSortedQueryString(props.headers)
  this.headersObject = props.headers
  this.responseHeaders = props.response.headers || {}
  this.setResponseData(props.response.body)
  this.responseHandler = props.response.handler
  this.statusFunction = typeof props.response.status === 'function'
  this.responseStatus = props.response.status || 200

  this.calls = []
}

MockRequest.prototype = {
  /**
   * If passed a plain object, the data is stringified and the content-type header is set to JSON
   *
   * @public
   */
  setResponseData(responseData) {
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
  call(request) {
    const assertObject = this.assertObject()

    if (this.responseHandler) {
      this.setResponseData(this.responseHandler(request, assertObject))
    }

    const status = this.statusFunction
      ? this.responseStatus(request, assertObject)
      : this.responseStatus

    this.calls.push(request)

    const responseData = clone(this.responseData)
    const responseHeaders = clone(this.responseHeaders)
    return new Response(request, status, responseData, responseHeaders)
  },

  /**
   * @return {MockAssert}
   */
  assertObject() {
    return new MockAssert(this.calls)
  },

  bodyMatchRequest(request) {
    if (this.body === undefined) {
      return {
        match: true,
        mockValue: MATCHED_AS_UNDEFINED_IN_MOCK,
        requestValue: MATCHED_AS_UNDEFINED_IN_MOCK,
      }
    }
    if (this.bodyFunction) {
      const match = this.body(request.body())
      const value = match ? MATCHED_BY_FUNCTION : MISMATCH_BY_FUNCTION
      return { match, mockValue: value, requestValue: value }
    }
    const requestBodyAsString = toSortedQueryString(request.body())
    const match = this.body === requestBodyAsString
    return {
      match,
      mockValue: decodeURIComponent(this.body),
      requestValue: decodeURIComponent(requestBodyAsString),
    }
  },

  urlMatchRequest(request) {
    if (this.urlFunction) {
      const match = Boolean(this.url(request.url(), request.params()))
      const value = match ? MATCHED_BY_FUNCTION : MISMATCH_BY_FUNCTION
      return { match, mockValue: value, requestValue: value }
    }
    const requestUrlAsSortedString = sortedUrl(request.url())
    const mockRequestUrlAsSortedString = sortedUrl(this.url)
    const match = mockRequestUrlAsSortedString === requestUrlAsSortedString
    return {
      match,
      mockValue: decodeURIComponent(mockRequestUrlAsSortedString),
      requestValue: decodeURIComponent(requestUrlAsSortedString),
    }
  },

  headersMatchRequest(request) {
    if (!this.headers)
      return {
        match: true,
        mockValue: MATCHED_AS_UNDEFINED_IN_MOCK,
        requestValue: MATCHED_AS_UNDEFINED_IN_MOCK,
      }
    if (this.headersFunction) {
      const match = this.headers(request.headers())
      const value = match ? MATCHED_BY_FUNCTION : MISMATCH_BY_FUNCTION
      return { match, mockValue: value, requestValue: value }
    }
    const filteredRequestHeaders = filterKeys(this.headersObject, request.headers())
    const requestHeadersAsSortedString = toSortedQueryString(filteredRequestHeaders)
    const mockRequestHeadersAsSortedString = toSortedQueryString(this.headersObject)
    const match = requestHeadersAsSortedString === mockRequestHeadersAsSortedString

    return {
      match,
      mockValue: mockRequestHeadersAsSortedString,
      requestValue: requestHeadersAsSortedString,
    }
  },

  methodMatchRequest(request) {
    const requestMethod = request.method()
    const match = this.method === requestMethod
    return {
      match,
      mockValue: this.method,
      requestValue: requestMethod,
    }
  },

  getRequestMatching(request) {
    const method = this.methodMatchRequest(request)
    const url = this.urlMatchRequest(request)
    const body = this.bodyMatchRequest(request)
    const headers = this.headersMatchRequest(request)
    return {
      mockName: this.mockName,
      isExactMatch: method.match && url.match && body.match && headers.match,
      isPartialMatch: this.isPartialMatch(request),
      method,
      url,
      body,
      headers,
    }
  },
  /**
   * Checks if the request matches with the mock HTTP method, URL, headers and body
   *
   * @return {boolean}
   */
  isExactMatch(request) {
    return this.getRequestMatching(request).isExactMatch
  },

  /**
   * Checks if the request partially matches the mock HTTP method and URL
   *
   * @return {boolean}
   */
  isPartialMatch(request) {
    return (
      new RegExp(this.method).test(request.method()) && new RegExp(this.url).test(request.url())
    )
  },

  /**
   * @return {MockRequest}
   */
  toMockRequest() {
    return this
  },
}

export default MockRequest
