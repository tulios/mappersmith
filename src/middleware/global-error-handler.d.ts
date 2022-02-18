import { Middleware } from './index'
import { Response } from '../response'

declare const GlobalErrorHandler: Middleware

export type ErrorHandlerMiddlewareCallback = (response: Response) => boolean

export function setErrorHandler(fn: ErrorHandlerMiddlewareCallback): void
export default GlobalErrorHandler
