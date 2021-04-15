/// <reference path="./middleware/basic-auth.d.ts" />
/// <reference path="./middleware/csrf.d.ts" />
/// <reference path="./middleware/duration.d.ts" />
/// <reference path="./middleware/encode-json.d.ts" />
/// <reference path="./middleware/global-error-handler.d.ts" />
/// <reference path="./middleware/log.d.ts" />
/// <reference path="./middleware/retry.d.ts" />
/// <reference path="./middleware/timeout.d.ts" />
/// <reference path="./gateway/fetch.d.ts" />
/// <reference path="./test.d.ts" />

declare module 'mappersmith' {

  export interface Headers {
    readonly [header: string]: string
  }

  export interface Authorization {
    readonly username: string
    readonly password: string
  }

  export interface Parameters {
    readonly auth?: Authorization
    readonly timeout?: number
    [param: string]: object | string | number | boolean | undefined
  }

  export type Context = object

  export interface RequestParams {
    readonly params: Parameters
    readonly headers: Headers
    readonly body: object | string
    readonly auth: object
    readonly timeout: number
    readonly host: string
  }

  export interface ResponseParams {
    readonly status: number
    readonly rawData: string
    readonly headers: Headers
    readonly error: Error
  }

  export interface Request {
    params(): Parameters
    method(): string
    host(): string
    path(): string
    url(): string
    headers(): Headers
    header(name: string): string | undefined
    body(): object | string
    auth(): object
    timeout(): number
    enhance(extras: Partial<RequestParams>): Request
    isBinary(): boolean
  }

  export interface Response {
    readonly responseStatus: number
    request(): Request
    status(): number
    success(): boolean
    headers(): Headers
    header(name: string): string | undefined
    rawData(): string | null
    data<DataType = object | string>(): DataType
    isContentTypeJSON(): boolean
    error(): Error | null
    enhance(extras: Partial<ResponseParams>): Response
  }

  export type RequestGetter = () => Promise<Request>

  export type ResponseGetter = () => Promise<Response>

  export type AbortFn =  (error: Error) => void

  export type RenewFn = () => Promise<object>

  export interface MiddlewareDescriptor {
    // @deprecated: Please use prepareRequest instead
    request?(request: Request): Promise<Request> | Request
    prepareRequest?(next: RequestGetter, abort: AbortFn): Promise<Request | void>
    response?(next: ResponseGetter, renew: RenewFn): Promise<Response | object>
  }

  export interface MiddlewareParams {
    readonly resourceName: string
    readonly resourceMethod: string
    readonly clientId: string
    readonly context: Context
  }

  export type Middleware = (params: MiddlewareParams) => MiddlewareDescriptor

  export type AsyncFunctions<HashType> = {
    [Key in keyof HashType]: (params?: Parameters) => Promise<Response>
  }

  export type Client<ResourcesType> = {
    [ResourceKey in keyof ResourcesType]: AsyncFunctions<ResourcesType[ResourceKey]>
  }

  export interface Options<ResourcesType> {
    readonly clientId?: string
    readonly host?: string
    readonly ignoreGlobalMiddleware?: boolean
    readonly middleware?: Middleware[]
    readonly gatewayConfigs?: Partial<GatewayConfiguration>
    // @alias middleware
    readonly middlewares?: Middleware[]
    readonly resources: ResourcesType
  }

  export interface Gateway {
    call(): void
    dispatchClientError(message: string, error: Error): void
    dispatchResponse(response: Response): void
    extends(methods: {[fn: string]: Function}): void
    options(): object
    prepareBody(method: string, headers: Headers): string
    shouldEmulateHTTP(): boolean
  }

  interface NetworkGateway {
    delete?(): void
    get(): void
    head(): void
    patch(): void
    post(): void
    put(): void
  }

  export interface FetchGateway extends Gateway {}

  export interface HTTPGateway extends Gateway, NetworkGateway {
    createResponse(response: Response, rawData: string): Response
    onError(error: Error): void
    onResponse(response: Response, options: object, params: object): void
    performRequest(method: string): void
  }

  export interface MockGateway extends Gateway, NetworkGateway {
    callMock(): Promise<Response>
  }

  export interface XhrGateway extends Gateway, NetworkGateway {
    readonly withCredentials: boolean
    configure(xmlHttpRequest: XMLHttpRequest): void
    configureBinary(xmlHttpRequest: XMLHttpRequest): void
    configureCallbacks(xmlHttpRequest: XMLHttpRequest): void
    configureTimeout(xmlHttpRequest: XMLHttpRequest): void
    createResponse(xmlHttpRequest: XMLHttpRequest): void
    createXHR(): XMLHttpRequest
    performRequest(method: string): void
    setHeaders(xmlHttpRequest: XMLHttpRequest, headers: Headers): void
  }

  export interface HTTPRequestParams {
    [key: string]: any
  }

  export interface HTTPGatewayConfiguration {
    configure?(requestParams: HTTPRequestParams): HTTPRequestParams
    onRequestWillStart?(requestParams: HTTPRequestParams): void
    onRequestSocketAssigned?(requestParams: HTTPRequestParams): void
    onSocketLookup?(requestParams: HTTPRequestParams): void
    onSocketConnect?(requestParams: HTTPRequestParams): void
    onSocketSecureConnect?(requestParams: HTTPRequestParams): void
    onResponseReadable?(requestParams: HTTPRequestParams): void
    onResponseEnd?(requestParams: HTTPRequestParams): void
    useSocketConnectionTimeout?: boolean
  }

  export interface GatewayConfiguration {
    Fetch: object
    HTTP: HTTPGatewayConfiguration
    Mock: object
    XHR: Partial<XhrGateway>
    enableHTTP408OnTimeouts?: boolean
    emulateHTTP?: boolean
  }

  export interface Configuration {
    fetch: typeof fetch
    gateway: Gateway
    gatewayConfigs: GatewayConfiguration
    maxMiddlewareStackExecutionAllowed: number
    middleware: Middleware[]
    Promise: Promise<any>
  }

  export var configs: Configuration

  export function setContext(context: Context): void

  export default function forge<ResourcesType>(options: Options<ResourcesType>): Client<ResourcesType>
}
