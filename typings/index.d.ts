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
  export type Gateway = import('./generated/gateway/types').Gateway
  type NetworkGateway = import('./generated/gateway/types').NetworkGateway
  export type XhrGateway = import('./generated/gateway/types').XhrGateway
  export type HTTPRequestParams = import('./generated/gateway/types').HTTPRequestParams
  export type HTTPGatewayConfiguration =
    import('./generated/gateway/types').HTTPGatewayConfiguration
  export type GatewayConfiguration = import('./generated/gateway/types').GatewayConfiguration
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

  export type ManifestOptions<Resources> = import('./generated/manifest').ManifestOptions<Resources>
  /**
   * @deprecated, use ManifestOptions instead
   */
  export type Options<Resources> = ManifestOptions<Resources>
  export type GlobalConfigs = import('./generated/manifest').GlobalConfigs
  /**
   * @deprecated, use GlobalConfigs instead
   */
  export type Configuration = GlobalConfigs

  export type AsyncFunction = import('./generated/client-builder').AsyncFunction
  export type AsyncFunctions<HashType> =
    import('./generated/client-builder').AsyncFunctions<HashType>
  export type Client<Resources> = import('./generated/client-builder').Client<Resources>

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

  export const configs: GlobalConfigs

  /**
   * @deprecated Shouldn't be used, not safe for concurrent use.
   */
  export function setContext(context: Context): void

  export default function forge<Resources>(options: ManifestOptions<Resources>): Client<Resources>
}
