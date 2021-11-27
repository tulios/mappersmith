declare module 'mappersmith/middleware/global-error-handler' {
  import { Middleware, Response } from 'mappersmith'

  const GlobalErrorHandler: Middleware

  export type ErrorHandlerMiddlewareCallback = (response: Response) => boolean

  export function setErrorHandler(fn: ErrorHandlerMiddlewareCallback): void
  export default GlobalErrorHandler
}
