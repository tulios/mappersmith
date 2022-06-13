import type { Request } from '../request'
import type { Response } from '../response'

export type Context = object

export type RequestGetter = () => Promise<Request>

export type ResponseGetter = () => Promise<Response>

export type AbortFn = (error: Error) => void

export type RenewFn = () => Promise<Response>

export interface MiddlewareDescriptor {
  __name?: string
  /**
   * @deprecated: Use prepareRequest
   */
  request?(request: Request): Promise<Request> | Request
  /**
   * @since 2.27.0
   * Replaced the request method
   */
  prepareRequest(next: RequestGetter, abort: AbortFn): Promise<Request | void>
  response(next: ResponseGetter, renew: RenewFn): Promise<Response>
}

export interface MiddlewareParams {
  readonly clientId: string | null
  readonly context: Context
  readonly resourceMethod: string
  readonly resourceName: string
  readonly mockRequest?: boolean
}

// eslint-disable-next-line @typescript-eslint/ban-types
type DefaultPrivateProps = {}

/**
 * Mappersmith middleware, used to describe a factory function that given MiddlewareParams
 * returns a middleware object (partial of MiddlewareDescriptor).
 *
 * If the middleware needs to save local state you can use PrivateProps to allow it.
 */
export type Middleware<PrivateProps extends Record<string, unknown> = DefaultPrivateProps> = (
  params: MiddlewareParams
) => Partial<MiddlewareDescriptor & PrivateProps>
