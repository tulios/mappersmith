import type { GlobalConfigs, ManifestOptions, ResourceTypeConstraint } from './manifest'
export type { GlobalConfigs, ManifestOptions, ResourceTypeConstraint }
export { Request } from './request'
export type { RequestContext } from './request'
// New exports since v3:
export { MethodDescriptor } from './method-descriptor'
export * from './types'
export * from './utils'
export * from './middleware'
export * from './gateway/index'
export { Gateway } from './gateway'
// ---------------------
export type {
  HTTPRequestParams,
  HTTPGatewayConfiguration,
  GatewayConfiguration,
} from './gateway/types'
export { Response, ParsedJSON } from './response'
export type {
  AbortFn,
  Middleware,
  MiddlewareDescriptor,
  MiddlewareParams,
  RenewFn,
  RequestGetter,
  ResponseGetter,
} from './middleware'
export type { AsyncFunction, AsyncFunctions, Client } from './client-builder'
/**
 * @deprecated, use ManifestOptions instead
 */
export type Options<Resources extends ResourceTypeConstraint> = ManifestOptions<Resources>

/**
 * @deprecated, use GlobalConfigs instead
 */
export type Configuration = GlobalConfigs

export { default, version, configs } from './mappersmith'
