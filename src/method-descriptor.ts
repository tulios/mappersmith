// COMBAK: All of these should not live here, they were moved from typings/index.d.ts

export interface Headers {
  readonly [header: string]: string
}

export interface Authorization {
  readonly password: string
  readonly username: string
}

export interface Parameters {
  readonly auth?: Authorization
  readonly timeout?: number
  [param: string]: object | string | number | boolean | undefined
}

export type Context = object

export type RequestGetter = () => Promise<Request>

export type ResponseGetter = () => Promise<Response>

export type AbortFn = (error: Error) => void

export type RenewFn = () => Promise<object>

export interface MiddlewareDescriptor {
  /**
   * @deprecated: Please use prepareRequest instead
   */
  request?(request: Request): Promise<Request> | Request
  /**
   * @since 2.27.0
   * Replaced the request method
   */
  prepareRequest?(next: RequestGetter, abort: AbortFn): Promise<Request | void>
  response?(next: ResponseGetter, renew: RenewFn): Promise<Response | object>
}

export interface MiddlewareParams {
  readonly clientId: string
  readonly context: Context
  readonly resourceMethod: string
  readonly resourceName: string
}

export type Middleware = (params: MiddlewareParams) => MiddlewareDescriptor

interface MethodDescriptorParams {
  allowResourceHostOverride?: boolean
  authAttr?: string
  binary?: boolean
  bodyAttr?: string
  headers: Headers
  headersAttr?: string
  host: string
  hostAttr?: string
  method?: string
  middleware?: Array<Middleware>
  middlewares?: Array<Middleware>
  params: Parameters
  path: string | ((args: Record<string, unknown>) => string)
  queryParamAlias?: Record<string, string>
  timeoutAttr?: string
}

/**
 * @typedef MethodDescriptor
 * @param {MethodDescriptorParams} params
 *   @param {boolean} params.allowResourceHostOverride
 *   @param {String} params.authAttr - auth attribute name. Default: 'auth'
 *   @param {boolean} params.binary
 *   @param {String} params.bodyAttr - body attribute name. Default: 'body'
 *   @param {Headers} params.headers
 *   @param {String} params.headersAttr - headers attribute name. Default: 'headers'
 *   @param {String} params.host
 *   @param {String} params.hostAttr - host attribute name. Default: 'host'
 *   @param {String} params.method
 *   @param {Middleware[]} params.middleware
 *   @param {Middleware[]} params.middlewares - alias for middleware
 *   @param {Parameters} params.params
 *   @param {String|Function} params.path
 *   @param {Object} params.queryParamAlias
 *   @param {Number} params.timeoutAttr - timeout attribute name. Default: 'timeout'
 */
export default class MethodDescriptor {
  public allowResourceHostOverride: boolean
  public authAttr: string
  public binary: boolean
  public bodyAttr: string
  public headers: Headers
  public headersAttr: string
  public host: string
  public hostAttr: string
  public method: string
  public middleware: Middleware[]
  public params: Parameters
  public path: string | ((args: Parameters) => string)
  public queryParamAlias: Record<string, string>
  public timeoutAttr: string

  constructor(params: MethodDescriptorParams) {
    this.allowResourceHostOverride = params.allowResourceHostOverride || false
    this.binary = params.binary || false
    this.headers = params.headers
    this.host = params.host
    this.method = params.method || 'get'
    this.params = params.params
    this.path = params.path
    this.queryParamAlias = params.queryParamAlias || {}

    this.authAttr = params.authAttr || 'auth'
    this.bodyAttr = params.bodyAttr || 'body'
    this.headersAttr = params.headersAttr || 'headers'
    this.hostAttr = params.hostAttr || 'host'
    this.timeoutAttr = params.timeoutAttr || 'timeout'

    const resourceMiddleware = params.middleware || params.middlewares || []
    this.middleware = resourceMiddleware
  }
}
