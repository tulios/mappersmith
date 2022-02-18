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
/// <reference path="./test.d.ts" />

declare module 'mappersmith' {
  export type Request = import('./generated/src/request').Request
  export type Headers = import('./generated/src/types').Headers
  export type Parameters = import('./generated/src/types').Params
  export class Gateway extends (await import('./generated/src/gateway')).Gateway {}
  export class XhrGateway extends (await import('./generated/src/gateway/xhr')).XHR {}
  export class HTTPGateway extends (await import('./generated/src/gateway/http')).HTTP {}
  export class FetchGateway extends (await import('./generated/src/gateway/fetch')).Fetch {}
  export class MockGateway extends (await import('./generated/src/gateway/mock')).Mock {}
  export type HTTPRequestParams = import('./generated/src/gateway/types').HTTPRequestParams
  export type HTTPGatewayConfiguration =
    import('./generated/src/gateway/types').HTTPGatewayConfiguration
  export type GatewayConfiguration = import('./generated/src/gateway/types').GatewayConfiguration
  export type ParsedJSON = import('./generated/src/response').ParsedJSON
  export class Response<DataType extends ParsedJSON = ParsedJSON> extends (
    await import('./generated/src/response')
  ).Response<DataType> {}

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

  export const configs: GlobalConfigs

  /**
   * @deprecated Shouldn't be used, not safe for concurrent use.
   */
  export function setContext(context: Context): void

  export default function forge<Resources>(options: ManifestOptions<Resources>): Client<Resources>
}
