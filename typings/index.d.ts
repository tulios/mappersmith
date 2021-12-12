/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./middleware/basic-auth.d.ts" />
/// <reference path="./middleware/csrf.d.ts" />
/// <reference path="./middleware/duration.d.ts" />
/// <reference path="./middleware/encode-json.d.ts" />
/// <reference path="./middleware/global-error-handler.d.ts" />
/// <reference path="./middleware/log.d.ts" />
/// <reference path="./middleware/retry.d.ts" />
/// <reference path="./middleware/retry-v2.d.ts" />
/// <reference path="./middleware/timeout.d.ts" />
/// <reference path="./gateway/fetch.d.ts" />
/// <reference path="./test.d.ts" />

declare module 'mappersmith' {
  export type Request = import('./generated/src/request').Request
  export type Headers = import('./generated/src/types').Headers
  export type Parameters = import('./generated/src/types').Params
  export type Gateway = import('./generated/src/gateway/types').Gateway
  type NetworkGateway = import('./generated/src/gateway/types').NetworkGateway
  export type XhrGateway = import('./generated/src/gateway/types').XhrGateway
  export type HTTPRequestParams = import('./generated/src/gateway/types').HTTPRequestParams
  export type HTTPGatewayConfiguration =
    import('./generated/src/gateway/types').HTTPGatewayConfiguration
  export type GatewayConfiguration = import('./generated/src/gateway/types').GatewayConfiguration
  type ParameterEncoderFn = import('./generated/src/types').ParameterEncoderFn
  export type Response = import('./generated/src/response').Response

  export type AbortFn = import('./generated/src/middleware').AbortFn
  export type Authorization = import('./generated/src/middleware').Authorization
  export type Context = import('./generated/src/middleware').Context
  export type Middleware = import('./generated/src/middleware').Middleware
  export type MiddlewareDescriptor = import('./generated/src/middleware').MiddlewareDescriptor
  export type MiddlewareParams = import('./generated/src/middleware').MiddlewareParams
  export type RenewFn = import('./generated/src/middleware').RenewFn
  export type RequestGetter = import('./generated/src/middleware').RequestGetter
  export type ResponseGetter = import('./generated/src/middleware').ResponseGetter

  export type ManifestOptions<Resources> =
    import('./generated/src/manifest').ManifestOptions<Resources>
  /**
   * @deprecated, use ManifestOptions instead
   */
  export type Options<Resources> = ManifestOptions<Resources>
  export type GlobalConfigs = import('./generated/src/manifest').GlobalConfigs
  /**
   * @deprecated, use GlobalConfigs instead
   */
  export type Configuration = GlobalConfigs

  export type AsyncFunction = import('./generated/src/client-builder').AsyncFunction
  export type AsyncFunctions<HashType> =
    import('./generated/src/client-builder').AsyncFunctions<HashType>
  export type Client<Resources> = import('./generated/src/client-builder').Client<Resources>

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
