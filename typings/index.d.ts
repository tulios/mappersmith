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
  export type Request = import('../src/request').Request
  export type Headers = import('../src/types').Headers
  export type Parameters = import('../src/types').Params
  export type Gateway = import('../src/types').Gateway
  type NetworkGateway = import('../src/types').NetworkGateway
  export type XhrGateway = import('../src/types').XhrGateway
  export type HTTPRequestParams = import('../src/types').HTTPRequestParams
  export type HTTPGatewayConfiguration = import('../src/types').HTTPGatewayConfiguration
  export type GatewayConfiguration = import('../src/types').GatewayConfiguration
  export type Response = import('../src/response').Response

  export type AbortFn = import('../src/middleware').AbortFn
  export type Authorization = import('../src/middleware').Authorization
  export type Context = import('../src/middleware').Context
  export type Middleware = import('../src/middleware').Middleware
  export type MiddlewareDescriptor = import('../src/middleware').MiddlewareDescriptor
  export type MiddlewareParams = import('../src/middleware').MiddlewareParams
  export type RenewFn = import('../src/middleware').RenewFn
  export type RequestGetter = import('../src/middleware').RequestGetter
  export type ResponseGetter = import('../src/middleware').ResponseGetter
  type ParameterEncoderFn = import('../src/types').ParameterEncoderFn

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
