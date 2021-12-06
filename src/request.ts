import { MethodDescriptor } from './method-descriptor'
import { toQueryString, lowerCaseObjectKeys, assign } from './utils'
import type { Headers, Primitive, RequestParams } from './types'

const REGEXP_DYNAMIC_SEGMENT = /{([^}?]+)\??}/
const REGEXP_OPTIONAL_DYNAMIC_SEGMENT = /\/?{([^}?]+)\?}/g
const REGEXP_TRAILING_SLASH = /\/$/

/**
 * @typedef Request
 * @param {MethodDescriptor} methodDescriptor
 * @param {RequestParams} requestParams, defaults to an empty object ({})
 */
export class Request {
  public methodDescriptor: MethodDescriptor
  public requestParams: RequestParams

  constructor(methodDescriptor: MethodDescriptor, requestParams: RequestParams = {}) {
    this.methodDescriptor = methodDescriptor
    this.requestParams = requestParams
  }

  private isParam(key: string) {
    return (
      key !== this.methodDescriptor.headersAttr &&
      key !== this.methodDescriptor.bodyAttr &&
      key !== this.methodDescriptor.authAttr &&
      key !== this.methodDescriptor.timeoutAttr &&
      key !== this.methodDescriptor.hostAttr
    )
  }

  public params() {
    const params = assign({}, this.methodDescriptor.params, this.requestParams)

    return Object.keys(params).reduce((obj, key) => {
      if (this.isParam(key)) {
        obj[key] = params[key]
      }
      return obj
    }, {} as RequestParams)
  }

  /**
   * Returns the HTTP method in lowercase
   */
  public method() {
    return this.methodDescriptor.method.toLowerCase()
  }

  /**
   * Returns host name without trailing slash
   * Example: 'http://example.org'
   */
  public host() {
    const { allowResourceHostOverride, hostAttr, host } = this.methodDescriptor
    const originalHost = allowResourceHostOverride
      ? this.requestParams[hostAttr] || host || ''
      : host || ''

    if (typeof originalHost === 'string') {
      return originalHost.replace(REGEXP_TRAILING_SLASH, '')
    }

    return ''
  }

  /**
   * Returns path with parameters and leading slash.
   * Example: '/some/path?param1=true'
   *
   * @throws {Error} if any dynamic segment is missing.
   * Example:
   *  Imagine the path '/some/{name}', the error will be similar to:
   *    '[Mappersmith] required parameter missing (name), "/some/{name}" cannot be resolved'
   */
  public path() {
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

    for (const key of dynamicSegmentKeys) {
      const pattern = new RegExp(`{${key}\\??}`, 'g')
      const value = params[key]
      if (value != null && typeof value !== 'object') {
        path = path.replace(pattern, this.methodDescriptor.parameterEncoder(value))
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
      const value = params[key]
      if (value != null && typeof value !== 'object') {
        aliased[aliasedKey] = value
      }
      return aliased
    }, {} as Record<string, Primitive>)

    const queryString = toQueryString(aliasedParams)
    if (typeof queryString === 'string' && queryString.length !== 0) {
      const hasQuery = path.includes('?')
      path += `${hasQuery ? '&' : '?'}${queryString}`
    }

    return path
  }

  /**
   * Returns the template path, without params, before interpolation.
   * If path is a function, returns the result of request.path()
   * Example: '/some/{param}/path'
   */
  public pathTemplate() {
    const path = this.methodDescriptor.path

    const prependSlash = (str: string) => (str[0] !== '/' ? `/${str}` : str)

    if (typeof path === 'function') {
      return prependSlash(path(this.params()))
    }

    return prependSlash(path)
  }

  /**
   * Returns the full URL
   * Example: http://example.org/some/path?param1=true
   *
   */
  public url() {
    return `${this.host()}${this.path()}`
  }

  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   */
  public headers() {
    const headerAttr = this.methodDescriptor.headersAttr
    const headers = (this.requestParams[headerAttr] || {}) as Headers
    const mergedHeaders = { ...this.methodDescriptor.headers, ...headers } as Headers
    return lowerCaseObjectKeys(mergedHeaders)
  }

  /**
   * Utility method to get a header value by name
   */
  public header(name: string) {
    return this.headers()[name.toLowerCase()]
  }

  public body() {
    return this.requestParams[this.methodDescriptor.bodyAttr]
  }

  public auth() {
    return this.requestParams[this.methodDescriptor.authAttr]
  }

  public timeout() {
    return this.requestParams[this.methodDescriptor.timeoutAttr]
  }

  /**
   * Enhances current request returning a new Request
   * @param {RequestParams} extras
   *   @param {Object} extras.auth - it will replace the current auth
   *   @param {String|Object} extras.body - it will replace the current body
   *   @param {Headers} extras.headers - it will be merged with current headers
   *   @param {String} extras.host - it will replace the current timeout
   *   @param {RequestParams} extras.params - it will be merged with current params
   *   @param {Number} extras.timeout - it will replace the current timeout
   */
  public enhance(extras: RequestParams) {
    const authKey = this.methodDescriptor.authAttr
    const bodyKey = this.methodDescriptor.bodyAttr
    const headerKey = this.methodDescriptor.headersAttr
    const hostKey = this.methodDescriptor.hostAttr
    const timeoutKey = this.methodDescriptor.timeoutAttr

    // Note: The result of merging an instance of RequestParams with instance of Params
    // is simply a RequestParams with even more [param: string]'s on it.
    const requestParams: RequestParams = assign({}, this.requestParams, extras.params)

    const headers = this.requestParams[headerKey] as Headers | undefined
    const mergedHeaders = assign({}, headers, extras.headers)
    requestParams[headerKey] = mergedHeaders

    extras.auth && (requestParams[authKey] = extras.auth)
    extras.body && (requestParams[bodyKey] = extras.body)
    extras.host && (requestParams[hostKey] = extras.host)
    extras.timeout && (requestParams[timeoutKey] = extras.timeout)

    return new Request(this.methodDescriptor, requestParams)
  }

  /**
   * Is the request expecting a binary response?
   */
  public isBinary() {
    return this.methodDescriptor.binary
  }
}

export default Request
