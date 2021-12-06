export type Primitive = string | number | boolean

export interface Hash {
  [key: string]: Primitive
}

export interface Headers {
  readonly [key: string]: Primitive
}

interface Auth {
  readonly [key: string]: Primitive
}

export interface Params {
  readonly [key: string]: object | Primitive | undefined | null
}

export interface RequestParams {
  readonly auth?: Auth
  readonly body?: object | string
  readonly headers?: Headers
  readonly host?: string
  readonly params?: Params
  readonly timeout?: number
  [param: string]: object | Primitive | undefined | null
}

export type ParameterEncoderFn = (arg: Primitive) => string

/**
 * Gateway types:
 */
export interface HTTPRequestParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface HTTPGatewayConfiguration {
  configure?: ((requestParams: HTTPRequestParams) => HTTPRequestParams) | null
  onRequestWillStart?: ((requestParams: HTTPRequestParams) => void) | null
  onRequestSocketAssigned?: ((requestParams: HTTPRequestParams) => void) | null
  onSocketLookup?: ((requestParams: HTTPRequestParams) => void) | null
  onSocketConnect?: ((requestParams: HTTPRequestParams) => void) | null
  onSocketSecureConnect?: ((requestParams: HTTPRequestParams) => void) | null
  onResponseReadable?: ((requestParams: HTTPRequestParams) => void) | null
  onResponseEnd?: ((requestParams: HTTPRequestParams) => void) | null
  useSocketConnectionTimeout?: boolean
}

export interface Gateway {
  call(): void
  dispatchClientError(message: string, error: Error): void
  dispatchResponse(response: Response): void
  // eslint-disable-next-line @typescript-eslint/ban-types
  extends(methods: { [fn: string]: Function }): void
  options(): object
  prepareBody(method: string, headers: Headers): string
  shouldEmulateHTTP(): boolean
}

export interface NetworkGateway {
  delete?(): void
  get(): void
  head(): void
  patch(): void
  post(): void
  put(): void
}

export interface XhrGateway extends Gateway, NetworkGateway {
  readonly withCredentials: boolean
  configure?: ((xmlHttpRequest: XMLHttpRequest) => void) | null
  configureBinary(xmlHttpRequest: XMLHttpRequest): void
  configureCallbacks(xmlHttpRequest: XMLHttpRequest): void
  configureTimeout(xmlHttpRequest: XMLHttpRequest): void
  createResponse(xmlHttpRequest: XMLHttpRequest): void
  createXHR(): XMLHttpRequest
  performRequest(method: string): void
  setHeaders(xmlHttpRequest: XMLHttpRequest, headers: Headers): void
}

export interface GatewayConfiguration {
  Fetch: object
  HTTP: HTTPGatewayConfiguration
  Mock?: object
  XHR: Partial<XhrGateway>
  enableHTTP408OnTimeouts?: boolean
  emulateHTTP?: boolean
}
