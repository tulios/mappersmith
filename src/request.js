import { toQueryString, lowerCaseObjectKeys, assign } from './utils'

const REGEXP_DYNAMIC_SEGMENT = /{([^}?]+)\??}/
const REGEXP_OPTIONAL_DYNAMIC_SEGMENT = /\/?{([^}?]+)\?}/g
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
        key !== this.methodDescriptor.timeoutAttr &&
        key !== this.methodDescriptor.hostAttr
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
    const { allowResourceHostOverride, hostAttr, host } = this.methodDescriptor
    const originalHost = allowResourceHostOverride
      ? this.requestParams[hostAttr] || host || ''
      : host || ''

    return originalHost.replace(REGEXP_TRAILING_SLASH, '')
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
    const params = this.params()

    let path

    if (typeof this.methodDescriptor.path === 'function') {
      path = this.methodDescriptor.path(params)
    } else {
      path = this.methodDescriptor.path
    }

    if (path[0] !== '/') {
      path = `/${path}`
    }

    // RegExp with 'g'-flag is stateful, therefore defining it locally
    const regexp = new RegExp(REGEXP_DYNAMIC_SEGMENT, 'g')

    const dynamicSegmentKeys = []
    let match
    while ((match = regexp.exec(path)) !== null) {
      dynamicSegmentKeys.push(match[1])
    }

    for (let key of dynamicSegmentKeys) {
      const pattern = new RegExp(`{${key}\\??}`, 'g')
      if (params[key] != null) {
        path = path.replace(pattern, encodeURIComponent(params[key]))
        delete params[key]
      }
    }

    path = path.replace(REGEXP_OPTIONAL_DYNAMIC_SEGMENT, '')

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
      const hasQuery = path.includes('?')
      path += `${hasQuery ? '&' : '?'}${queryString}`
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
   *   @param {String} extras.host - it will replace the current timeout
   */
  enhance (extras) {
    const headerKey = this.methodDescriptor.headersAttr
    const bodyKey = this.methodDescriptor.bodyAttr
    const authKey = this.methodDescriptor.authAttr
    const timeoutKey = this.methodDescriptor.timeoutAttr
    const hostKey = this.methodDescriptor.hostAttr
    const requestParams = assign({}, this.requestParams, extras.params)

    requestParams[headerKey] = assign({}, this.requestParams[headerKey], extras.headers)
    extras.body && (requestParams[bodyKey] = extras.body)
    extras.auth && (requestParams[authKey] = extras.auth)
    extras.timeout && (requestParams[timeoutKey] = extras.timeout)
    extras.host && (requestParams[hostKey] = extras.host)

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
