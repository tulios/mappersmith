import { performanceNow, toQueryString, isPlainObject } from './utils'
import { configs as defaultConfigs } from './mappersmith'
import { Request } from './request'
import { Response } from './response'
import { isTimeoutError } from './gateway/timeout-error'
import { GatewayConfiguration } from './gateway/types'
import { Primitive } from './types'

const REGEXP_EMULATE_HTTP = /^(delete|put|patch)/i

export type Method = 'get' | 'head' | 'post' | 'put' | 'patch' | 'delete'
export abstract class GatewayInterface {
  public get() {
    throw new Error('Abstract interface - Not implemented')
  }

  public head() {
    throw new Error('Abstract interface - Not implemented')
  }

  public post() {
    throw new Error('Abstract interface - Not implemented')
  }

  public put() {
    throw new Error('Abstract interface - Not implemented')
  }

  public patch() {
    throw new Error('Abstract interface - Not implemented')
  }

  public delete() {
    throw new Error('Abstract interface - Not implemented')
  }
}

export abstract class Gateway {
  public request: Request
  public configs: GatewayConfiguration
  public successCallback: (res: Response) => void
  public failCallback: (res: Response) => void

  constructor(request: Request, configs: GatewayConfiguration) {
    this.request = request
    this.configs = configs
    this.successCallback = function () {
      return undefined
    }
    this.failCallback = function () {
      return undefined
    }
  }

  options() {
    return this.configs
  }

  shouldEmulateHTTP() {
    return this.options().emulateHTTP && REGEXP_EMULATE_HTTP.test(this.request.method())
  }

  call() {
    const timeStart = performanceNow()
    if (!defaultConfigs.Promise) {
      throw new Error('[Mappersmith] Promise not configured (configs.Promise)')
    }
    return new defaultConfigs.Promise((resolve, reject) => {
      this.successCallback = (response) => {
        response.timeElapsed = performanceNow() - timeStart
        resolve(response)
      }

      this.failCallback = (response) => {
        response.timeElapsed = performanceNow() - timeStart
        reject(response)
      }

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this[this.request.method()].apply(this, arguments) // eslint-disable-line prefer-spread,prefer-rest-params
      } catch (e: unknown) {
        const err: Error = e as Error
        this.dispatchClientError(err.message, err)
      }
    })
  }

  dispatchResponse(response: Response) {
    response.success() ? this.successCallback(response) : this.failCallback(response)
  }

  dispatchClientError(message: string, error: Error) {
    if (isTimeoutError(error) && this.options().enableHTTP408OnTimeouts) {
      this.failCallback(new Response(this.request, 408, message, {}, [error]))
    } else {
      this.failCallback(new Response(this.request, 400, message, {}, [error]))
    }
  }

  prepareBody(method: string, headers: Record<string, Primitive>) {
    let body = this.request.body()

    if (this.shouldEmulateHTTP()) {
      body = body || {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isPlainObject(body) && ((body as any)['_method'] = method)
      headers['x-http-method-override'] = method
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyString = toQueryString(body as any)

    if (bodyString) {
      // If it's not simple, let the browser (or the user) set it
      if (isPlainObject(body)) {
        headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8'
      }
    }

    return bodyString
  }
}

export default Gateway
