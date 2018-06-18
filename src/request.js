import { toQueryString, lowerCaseObjectKeys, assign } from './utils'

const REGEXP_DYNAMIC_SEGMENT = /{([^}]+)}/
const REGEXP_TRAILING_SLASH = /\/$/

/**
 * @typedef Request
 * @param {MethodDescriptor} methodDescriptor
 * @param {Object} requestParams, defaults to an empty object ({})
 */
function Request (methodDescriptor, requestParams) {
  this.methodDescriptor = methodDescriptor
  this.requestParams = requestParams || {}
}

Request.prototype = {
  /**
   * @return {Object}
   */
  params () {
    const params = assign(
      {},
      this.methodDescriptor.params,
      this.requestParams
    )

    const isParam = (key) => (
      key !== this.methodDescriptor.headersAttr &&
        key !== this.methodDescriptor.bodyAttr &&
        key !== this.methodDescriptor.authAttr &&
        key !== this.methodDescriptor.timeoutAttr
    )

    return Object
      .keys(params)
      .reduce((obj, key) => {
        if (isParam(key)) {
          obj[key] = params[key]
        }
        return obj
      }, {})
  },

  /**
   * Returns the HTTP method in lowercase
   *
   * @return {String}
   */
  method () {
    return this.methodDescriptor.method.toLowerCase()
  },

  /**
   * Returns host name without trailing slash
   * Example: http://example.org
   *
   * @return {String}
   */
  host () {
    return (this.methodDescriptor.host || '').replace(REGEXP_TRAILING_SLASH, '')
  },

  /**
   * Returns path with parameters and leading slash.
   * Example: /some/path?param1=true
   *
   * @throws {Error} if any dynamic segment is missing.
   * Example:
   * Imagine the path '/some/{name}', the error will be similar to:
   * '[Mappersmith] required parameter missing (name), "/some/{name}" cannot be resolved'
   *
   * @return {String}
   */
  path () {
    let path = this.methodDescriptor.path

    if (this.methodDescriptor.path[0] !== '/') {
      path = `/${this.methodDescriptor.path}`
    }

    const params = this.params()
    Object.keys(params).forEach((key) => {
      const value = params[key]
      const pattern = `{${key}}`

      if (new RegExp(pattern).test(path)) {
        path = path.replace(`{${key}}`, value)
        delete params[key]
      }
    })

    const missingDynamicSegmentMatch = path.match(REGEXP_DYNAMIC_SEGMENT)
    if (missingDynamicSegmentMatch) {
      throw new Error(
        `[Mappersmith] required parameter missing (${missingDynamicSegmentMatch[1]}), "${path}" cannot be resolved`
      )
    }

    const aliasedParams = Object.keys(params).reduce((aliased, key) => {
      const aliasedKey = this.methodDescriptor.queryParamAlias[key] || key
      aliased[aliasedKey] = params[key]
      return aliased
    }, {})

    const queryString = toQueryString(aliasedParams)
    if (queryString.length !== 0) {
      path += `?${queryString}`
    }

    return path
  },

  /**
   * Returns the full URL
   * Example: http://example.org/some/path?param1=true
   *
   * @return {String}
   */
  url () {
    return `${this.host()}${this.path()}`
  },

  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   *
   * @return {Object}
   */
  headers () {
    return lowerCaseObjectKeys(
      assign(
        {},
        this.methodDescriptor.headers,
        this.requestParams[this.methodDescriptor.headersAttr]
      )
    )
  },

  /**
   * Utility method to get a header value by name
   *
   * @param {String} name
   *
   * @return {String|Undefined}
   */
  header (name) {
    return this.headers()[name.toLowerCase()]
  },

  body () {
    return this.requestParams[this.methodDescriptor.bodyAttr]
  },

  auth () {
    return this.requestParams[this.methodDescriptor.authAttr]
  },

  timeout () {
    return this.requestParams[this.methodDescriptor.timeoutAttr]
  },

  /**
   * Enhances current request returning a new Request
   * @param {Object} extras
   *   @param {Object} extras.params - it will be merged with current params
   *   @param {Object} extras.headers - it will be merged with current headers
   *   @param {String|Object} extras.body - it will replace the current body
   *   @param {Object} extras.auth - it will replace the current auth
   *   @param {Number} extras.timeout - it will replace the current timeout
   */
  enhance (extras) {
    const headerKey = this.methodDescriptor.headersAttr
    const bodyKey = this.methodDescriptor.bodyAttr
    const authKey = this.methodDescriptor.authAttr
    const timeoutKey = this.methodDescriptor.timeoutAttr
    const requestParams = assign({}, this.requestParams, extras.params)

    requestParams[headerKey] = assign({}, this.requestParams[headerKey], extras.headers)
    extras.body && (requestParams[bodyKey] = extras.body)
    extras.auth && (requestParams[authKey] = extras.auth)
    extras.timeout && (requestParams[timeoutKey] = extras.timeout)

    return new Request(this.methodDescriptor, requestParams)
  },

  /**
   * Is the request expecting a binary response?
   *
   * @return {Boolean}
   */
  isBinary () {
    return this.methodDescriptor.binary
  }
}

export default Request
