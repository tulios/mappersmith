/* eslint-disable @typescript-eslint/triple-slash-reference */
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
  export type Request = import('./generated/request').Request
  export type Headers = import('./generated/types').Headers
  export type Parameters = import('./generated/types').Params
  export type Gateway = import('./generated/types').Gateway
  type NetworkGateway = import('./generated/types').NetworkGateway
  export type XhrGateway = import('./generated/types').XhrGateway
  export type HTTPRequestParams = import('./generated/types').HTTPRequestParams
  export type HTTPGatewayConfiguration = import('./generated/types').HTTPGatewayConfiguration
  export type GatewayConfiguration = import('./generated/types').GatewayConfiguration
  type ParameterEncoderFn = import('./generated/types').ParameterEncoderFn
  export type Response = import('./generated/response').Response

  export type AbortFn = import('./generated/middleware').AbortFn
  export type Authorization = import('./generated/middleware').Authorization
  export type Context = import('./generated/middleware').Context
  export type Middleware = import('./generated/middleware').Middleware
  export type MiddlewareDescriptor = import('./generated/middleware').MiddlewareDescriptor
  export type MiddlewareParams = import('./generated/middleware').MiddlewareParams
  export type RenewFn = import('./generated/middleware').RenewFn
  export type RequestGetter = import('./generated/middleware').RequestGetter
  export type ResponseGetter = import('./generated/middleware').ResponseGetter

  export type AsyncFunctions<HashType> = {
    [Key in keyof HashType]: (params?: Parameters) => Promise<Response>
  }

  export type Client<ResourcesType> = {
    [ResourceKey in keyof ResourcesType]: AsyncFunctions<ResourcesType[ResourceKey]>
  }

  export type FetchGateway = Gateway

  export interface HTTPGateway extends Gateway, NetworkGateway {
    createResponse(response: Response, rawData: string): Response
    onError(error: Error): void
    onResponse(response: Response, options: object, params: object): void
    performRequest(method: string): void
  }

  export interface MockGateway extends Gateway, NetworkGateway {
    callMock(): Promise<Response>
  }

  export interface Configuration {
    fetch: typeof fetch
    gateway: Gateway
    gatewayConfigs: GatewayConfiguration
    maxMiddlewareStackExecutionAllowed: number
    middleware: Middleware[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise: Promise<any>
  }

  export interface Options<ResourcesType> {
    readonly clientId?: string
    readonly host?: string
    readonly allowResourceHostOverride?: boolean
    readonly parameterEncoder?: ParameterEncoderFn
    readonly ignoreGlobalMiddleware?: boolean
    readonly middleware?: Middleware[]
    readonly gatewayConfigs?: Partial<GatewayConfiguration>
    /**
     * @alias middleware
     */
    readonly middlewares?: Middleware[]
    readonly resources: ResourcesType
  }

  export const configs: Configuration

  export function setContext(context: Context): void

  export default function forge<ResourcesType>(
    options: Options<ResourcesType>
  ): Client<ResourcesType>
}
