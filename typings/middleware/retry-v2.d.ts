declare module 'mappersmith/middleware/retry/v2' {
  import { Middleware, Request, Response } from 'mappersmith'

  export interface RetryMiddlewareOptions {
    readonly headerRetryCount: string
    readonly headerRetryTime: string
    readonly maxRetryTimeInSecs: number
    readonly initialRetryTimeInSecs: number
    readonly factor: number
    readonly multiplier: number
    readonly retries: number
    enableRetry(request: Request): boolean
    validateRetry(response: Response): boolean
  }

  export default function Retry(config?: Partial<RetryMiddlewareOptions>): Middleware
}
