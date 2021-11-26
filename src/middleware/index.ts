import { Request } from '../request'
import { Response } from '../response'

export interface Authorization {
  readonly password: string
  readonly username: string
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
