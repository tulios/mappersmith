import { Response } from '../../../response'
import { Middleware } from '../../index'

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
