// @deprecated: Version 1 of retry is deprecated and should not be used anymore
declare module 'mappersmith/middleware/retry' {
  import {Middleware} from 'mappersmith'

  const Retry: Middleware
  export default Retry
}

declare module 'mappersmith/middleware/retry/v2' {
  import {Middleware, Response} from 'mappersmith'

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
