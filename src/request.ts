import MethodDescriptor, { Parameters } from './method-descriptor'
import { toQueryString, lowerCaseObjectKeys, assign } from './utils'
import type { Primitive } from './utils'

const REGEXP_DYNAMIC_SEGMENT = /{([^}?]+)\??}/
const REGEXP_OPTIONAL_DYNAMIC_SEGMENT = /\/?{([^}?]+)\?}/g
const REGEXP_TRAILING_SLASH = /\/$/

export interface RequestParams {
  readonly auth?: Record<string, string>
  readonly body?: Record<string, string> | string
  readonly headers?: Headers
  readonly host?: string
  readonly params?: Parameters
  readonly timeout?: number
  [param: string]: object | string | number | boolean | undefined
}

/**
 * @typedef Request
 * @param {MethodDescriptor} methodDescriptor
 * @param {RequestParams} requestParams, defaults to an empty object ({})
 */
export class Request {
  public methodDescriptor: MethodDescriptor
  public requestParams: RequestParams

  constructor (methodDescriptor: MethodDescriptor, requestParams: RequestParams = {}) {
    this.methodDescriptor = methodDescriptor
    this.requestParams = requestParams
  }

  public params () {
    const params = assign(
      {},
      this.methodDescriptor.params,
      this.requestParams
    )

    const isParam = (key: string) => (
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
      }, {} as Parameters)
  }

  /**
   * Returns the HTTP method in lowercase
   */
  public method () {
    return this.methodDescriptor.method.toLowerCase()
  }

  /**
   * Returns host name without trailing slash
   * Example: 'http://example.org'
   */
  public host () {
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
  public path () {
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
      const value = params[key]
      if (value != null && typeof value !== 'object') {
        path = path.replace(pattern, encodeURIComponent(value))
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
    if (queryString.length !== 0) {
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
  public pathTemplate () {
    let path = this.methodDescriptor.path

    if (typeof this.methodDescriptor.path !== 'function' && this.methodDescriptor.path[0] !== '/') {
      path = `/${path}`
    }

    return path
  }

  /**
   * Returns the full URL
   * Example: http://example.org/some/path?param1=true
   *
   */
  public url () {
    return `${this.host()}${this.path()}`
  }

  /**
   * Returns an object with the headers. Header names are converted to
   * lowercase
   */
  public headers () {
    return lowerCaseObjectKeys(
      assign(
        {},
        this.methodDescriptor.headers,
        this.requestParams?.[this.methodDescriptor.headersAttr]
      )
    )
  }

  /**
   * Utility method to get a header value by name
   */
  public header (name: string) {
    return this.headers()[name.toLowerCase()]
  }

  public body () {
    return this.requestParams?.[this.methodDescriptor.bodyAttr]
  }

  public auth () {
    return this.requestParams?.[this.methodDescriptor.authAttr]
  }

  public timeout () {
    return this.requestParams?.[this.methodDescriptor.timeoutAttr]
  }

  /**
   * Enhances current request returning a new Request
   * @param {RequestParams} extras
   *   @param {Object} extras.auth - it will replace the current auth
   *   @param {String|Object} extras.body - it will replace the current body
   *   @param {Headers} extras.headers - it will be merged with current headers
   *   @param {String} extras.host - it will replace the current timeout
   *   @param {Parameters} extras.params - it will be merged with current params
   *   @param {Number} extras.timeout - it will replace the current timeout
   */
  public enhance (extras: RequestParams) {
    const authKey = this.methodDescriptor.authAttr
    const bodyKey = this.methodDescriptor.bodyAttr
    const headerKey = this.methodDescriptor.headersAttr
    const hostKey = this.methodDescriptor.hostAttr
    const timeoutKey = this.methodDescriptor.timeoutAttr

    const requestParams = assign({}, this.requestParams, extras.params)
    requestParams[headerKey] = assign({}, this.requestParams?.[headerKey], extras.headers)

    extras.auth && (requestParams[authKey] = extras.auth)
    extras.body && (requestParams[bodyKey] = extras.body)
    extras.host && (requestParams[hostKey] = extras.host)
    extras.timeout && (requestParams[timeoutKey] = extras.timeout)

    return new Request(this.methodDescriptor, requestParams)
  }

  /**
   * Is the request expecting a binary response?
   */
  public isBinary () {
    return this.methodDescriptor.binary
  }
}

export default Request
