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
  type Request = import("../src/request").Request

  export interface ResponseParams {
    readonly status: number
    readonly rawData: string
    readonly headers: Headers
    readonly error: Error
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

  type AbortFn = import("../src/method-descriptor").AbortFn
  type Authorization = import("../src/method-descriptor").Authorization
  type Context = import("../src/method-descriptor").Context
  type Headers = import("../src/method-descriptor").Headers
  type Middleware = import("../src/method-descriptor").Middleware
  type MiddlewareDescriptor = import("../src/method-descriptor").MiddlewareDescriptor
  type MiddlewareParams = import("../src/method-descriptor").MiddlewareParams
  type Parameters = import("../src/method-descriptor").Parameters
  type RenewFn = import("../src/method-descriptor").RenewFn
  type RequestGetter = import("../src/method-descriptor").RequestGetter
  type ResponseGetter = import("../src/method-descriptor").ResponseGetter

  export type AsyncFunctions<HashType> = {
    [Key in keyof HashType]: (params?: Parameters) => Promise<Response>
  }

  export type Client<ResourcesType> = {
    [ResourceKey in keyof ResourcesType]: AsyncFunctions<ResourcesType[ResourceKey]>
  }

  export interface Options<ResourcesType> {
    readonly clientId?: string
    readonly host?: string
    readonly allowResourceHostOverride?: boolean
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
