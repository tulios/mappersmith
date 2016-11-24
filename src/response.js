import { lowerCaseObjectKeys, assign } from './utils'

/**
 * @param {Request} originalRequest
 * @param {Integer} responseStatus
 * @param {String} responseData
 * @param {Object} responseHeaders
 */
function Response(originalRequest, responseStatus, responseData, responseHeaders) {
  this.originalRequest = originalRequest
  this.responseStatus = responseStatus
  this.responseData = responseData
  this.responseHeaders = responseHeaders || {}
  this.timeElapsed = null
}

Response.prototype = {
  request() {
    return this.originalRequest
  },

  status() {
    // IE sends 1223 instead of 204
    if (this.responseStatus === 1223) {
      return 204
    }

    return this.responseStatus
  },

  success() {
    const status = this.status()
    return status >= 200 && status < 400
  },

  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   */
  headers() {
    return lowerCaseObjectKeys(this.responseHeaders)
  },

  rawData() {
    return this.responseData
  },

  /**
   * Returns the response data, if "Content-Type" is "application/json"
   * it parses the response and returns an object. Response data with be
   * passed through {MethodDescriptor}.processor function if configured
   */
  data() {
    let data = this.responseData
    const processor = this.request().processor() || ((response, data) => data)

    if (this.isContentTypeJSON()) {
      data = JSON.parse(this.responseData)
    }

    return processor(this, data)
  },

  isContentTypeJSON() {
    return /application\/json/.test(this.headers()['content-type'])
  },

  /**
   * Enhances current response returning a new Response
   * @param {Object} extras
   *   @param {Integer} extras.status - it will replace the current status
   *   @param {String} extras.rawData - it will replace the current rawStatus
   *   @param {Object} extras.headers - it will be merged with current headers
   */
  enhance(extras) {
    return new Response(
      this.request(),
      extras.status || this.status(),
      extras.rawData || this.rawData(),
      assign({}, this.headers(), extras.headers)
    )
  }
}

export default Response
