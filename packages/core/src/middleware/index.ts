import type { Request } from '../request'
import type { Response } from '../response'
export type RequestGetter = () => Promise<Request>
export type ResponseGetter = () => Promise<Response>
export type AbortFn = (error: Error) => void
export type RenewFn = () => Promise<Response>
export interface MiddlewareDescriptor {
  __name?: string
  /**
   * Allows a middleware to tap into the prepare request phase
   */
  prepareRequest(
    /**
     * This function must return a `Promise` resolving the `Request`.
     *
     * The method `enhance` can be used to generate a new request based on the previous one.
     */
    next: RequestGetter,
    /**
     * Function that can be used to abort the middleware execution early on and throw a custom error to the user.
     */
    abort: AbortFn
  ): Promise<Request | void>
  /**
   * Allows a middleware to tap into the response phase
   */
  response(
    /**
     * This function must return a `Promise` resolving the `Response`.
     *
     * The method `enhance` can be used to generate a new response based on the previous one.
     */
    next: ResponseGetter,
    /**
     * Function that is used to rerun the middleware stack.
     *
     * Useful for example when automatically refreshing an expired access token.
     */
    renew: RenewFn,
    /**
     * The final request object (after the whole middleware chain has prepared and all `prepareRequest` been executed).
     *
     * Useful for example when you want to get access to the request without invoking `next`
     */
    request: Request
  ): Promise<Response>
}
export interface MiddlewareParams {
  readonly clientId: string | null
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
export * from './basic-auth'
export * from './encode-json'
export * from './csrf'
export * from './duration'
export * from './global-error-handler'
export * from './log'
export * from './retry'
export * from './timeout'
