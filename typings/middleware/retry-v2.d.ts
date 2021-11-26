declare module 'mappersmith/middleware/retry/v2' {
  import { Middleware, Response } from 'mappersmith'

  export interface RetryMiddlewareOptions {
    readonly headerRetryCount: string
    readonly headerRetryTime: string
    readonly maxRetryTimeInSecs: number
    readonly initialRetryTimeInSecs: number
    readonly factor: number
    readonly multiplier: number
    readonly retries: number
    validateRetry(response: Response): boolean
  }

  export default function Retry(config?: Partial<RetryMiddlewareOptions>): Middleware
}
