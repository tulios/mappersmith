// COMBAK: All of these should not live here, they were moved from typings/index.d.ts

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
  readonly resourceName: string
  readonly resourceMethod: string
  readonly clientId: string
  readonly context: Context
}

export type Middleware = (params: MiddlewareParams) => MiddlewareDescriptor

/**
 * @typedef MethodDescriptor
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {boolean} obj.allowResourceHostOverride
 *   @param {String|Function} obj.path
 *   @param {String} obj.method
 *   @param {Object} obj.headers
 *   @param {Object} obj.params
 *   @param {Object} obj.queryParamAlias
 *   @param {String} obj.bodyAttr - body attribute name. Default: 'body'
 *   @param {String} obj.headersAttr - headers attribute name. Default: 'headers'
 *   @param {String} obj.authAttr - auth attribute name. Default: 'auth'
 *   @param {Number} obj.timeoutAttr - timeout attribute name. Default: 'timeout'
 *   @param {String} obj.hostAttr - host attribute name. Default: 'host'
 */

interface Args {
  host: string
  allowResourceHostOverride: boolean
  method: string
  headers: Record<string, string>
  params: Record<string, string>
  queryParamAlias: Record<string, string>
  binary: boolean
  bodyAttr: string
  headersAttr: string
  authAttr: string
  timeoutAttr: string
  hostAttr: string
  path: string | ((args: Record<string, any>) => string)
  middleware: Array<Middleware>
  middlewares: Array<Middleware>
}

export default class MethodDescriptor {
  public host: string
  public allowResourceHostOverride: boolean
  public binary: boolean
  public method: string
  public headers: Record<string, string>
  public params: Record<string, string>
  public queryParamAlias: Record<string, string>
  public bodyAttr: string
  public headersAttr: string
  public authAttr: string
  public timeoutAttr: string
  public hostAttr: string
  public path: string | ((args: Record<string, any>) => string)
  public middleware: Array<Middleware>

  constructor(obj: Args) {
    this.host = obj.host
    this.allowResourceHostOverride = obj.allowResourceHostOverride || false
    this.path = obj.path
    this.method = obj.method || 'get'
    this.headers = obj.headers
    this.params = obj.params
    this.queryParamAlias = obj.queryParamAlias || {}
    this.binary = obj.binary || false

    this.bodyAttr = obj.bodyAttr || 'body'
    this.headersAttr = obj.headersAttr || 'headers'
    this.authAttr = obj.authAttr || 'auth'
    this.timeoutAttr = obj.timeoutAttr || 'timeout'
    this.hostAttr = obj.hostAttr || 'host'

    const resourceMiddleware = obj.middleware || obj.middlewares || []
    this.middleware = resourceMiddleware
  }
}
