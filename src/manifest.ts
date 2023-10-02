import { MethodDescriptor, MethodDescriptorParams } from './method-descriptor'
import { assign } from './utils/index'
import type { ParameterEncoderFn } from './types'
import type { GatewayConfiguration } from './gateway/types'
import type { Gateway } from './gateway/index'
import { Context, Middleware, MiddlewareDescriptor, MiddlewareParams } from './middleware/index'

export interface GlobalConfigs {
  context: Context
  middleware: Middleware[]
  Promise: PromiseConstructor | null
  fetch: typeof fetch | null
  gateway: typeof Gateway | null
  gatewayConfigs: GatewayConfiguration
  maxMiddlewareStackExecutionAllowed: number
}

export type ResourceTypeConstraint = {
  [resourceName: string]: {
    [methodName: string]: Omit<MethodDescriptorParams, 'host'> & { host?: string }
  }
}

export interface ManifestOptions<Resources extends ResourceTypeConstraint> {
  host: string
  allowResourceHostOverride?: boolean
  parameterEncoder?: ParameterEncoderFn
  bodyAttr?: string
  headersAttr?: string
  authAttr?: string
  timeoutAttr?: string
  hostAttr?: string
  clientId?: string
  gatewayConfigs?: Partial<GatewayConfiguration>
  resources?: Resources
  middleware?: Middleware[]
  /**
   * @deprecated - use `middleware` instead
   */
  middlewares?: Middleware[]
  ignoreGlobalMiddleware?: boolean
}

export type Method = { name: string; descriptor: MethodDescriptor }
type EachResourceCallbackFn = (name: string, methods: Method[]) => void
type EachMethodCallbackFn = (name: string) => Method
type CreateMiddlewareParams = Partial<Omit<MiddlewareParams, 'resourceName' | 'resourceMethod'>> &
  Pick<MiddlewareParams, 'resourceName' | 'resourceMethod'>
/**
 * @typedef Manifest
 * @param {Object} obj
 *   @param {Object} obj.gatewayConfigs - default: base values from mappersmith
 *   @param {Object} obj.ignoreGlobalMiddleware - default: false
 *   @param {Object} obj.resources - default: {}
 *   @param {Array}  obj.middleware or obj.middlewares - default: []
 * @param {Object} globalConfigs
 */
export class Manifest<Resources extends ResourceTypeConstraint> {
  public host: string
  public allowResourceHostOverride: boolean
  public parameterEncoder: ParameterEncoderFn
  public bodyAttr?: string
  public headersAttr?: string
  public authAttr?: string
  public timeoutAttr?: string
  public hostAttr?: string
  public clientId: string | null
  public gatewayConfigs: GatewayConfiguration
  public resources: Resources
  public context: Context
  public middleware: Middleware[]

  constructor(
    options: ManifestOptions<Resources>,
    { gatewayConfigs, middleware = [], context = {} }: GlobalConfigs
  ) {
    this.host = options.host
    this.allowResourceHostOverride = options.allowResourceHostOverride || false
    this.parameterEncoder = options.parameterEncoder || encodeURIComponent
    this.bodyAttr = options.bodyAttr
    this.headersAttr = options.headersAttr
    this.authAttr = options.authAttr
    this.timeoutAttr = options.timeoutAttr
    this.hostAttr = options.hostAttr
    this.clientId = options.clientId || null
    this.gatewayConfigs = assign({}, gatewayConfigs, options.gatewayConfigs)
    this.resources = options.resources || ({} as Resources)
    this.context = context

    // TODO: deprecate obj.middlewares in favor of obj.middleware
    const clientMiddleware = options.middleware || options.middlewares || []

    if (options.ignoreGlobalMiddleware) {
      this.middleware = clientMiddleware
    } else {
      this.middleware = [...clientMiddleware, ...middleware]
    }
  }

  public eachResource(callback: EachResourceCallbackFn) {
    Object.keys(this.resources).forEach((resourceName) => {
      const methods = this.eachMethod(resourceName, (methodName) => ({
        name: methodName,
        descriptor: this.createMethodDescriptor(resourceName, methodName),
      }))

      callback(resourceName, methods)
    })
  }

  private eachMethod(resourceName: string, callback: EachMethodCallbackFn) {
    return Object.keys(this.resources[resourceName]).map(callback)
  }

  public createMethodDescriptor(resourceName: string, methodName: string) {
    const definition = this.resources[resourceName][methodName]
    if (!definition || !['string', 'function'].includes(typeof definition.path)) {
      throw new Error(
        `[Mappersmith] path is undefined for resource "${resourceName}" method "${methodName}"`
      )
    }
    return new MethodDescriptor(
      assign(
        {
          host: this.host,
          allowResourceHostOverride: this.allowResourceHostOverride,
          parameterEncoder: this.parameterEncoder,
          bodyAttr: this.bodyAttr,
          headersAttr: this.headersAttr,
          authAttr: this.authAttr,
          timeoutAttr: this.timeoutAttr,
          hostAttr: this.hostAttr,
        },
        definition
      )
    )
  }

  /**
   * @param {Object} args
   *   @param {String|Null} args.clientId
   *   @param {String} args.resourceName
   *   @param {String} args.resourceMethod
   *   @param {Object} args.context
   *   @param {Boolean} args.mockRequest
   *
   * @return {Array<Object>}
   */
  public createMiddleware(args: CreateMiddlewareParams) {
    const createInstance = (middlewareFactory: Middleware) => {
      const defaultDescriptor: MiddlewareDescriptor = {
        __name: middlewareFactory.name || middlewareFactory.toString(),
        response(next) {
          return next()
        },
        /**
         * @since 2.27.0
         * Replaced the request method
         */
        prepareRequest(next) {
          return this.request ? next().then((req) => this.request?.(req)) : next()
        },
      }

      const middlewareParams = assign(args, {
        clientId: this.clientId,
        context: assign({}, this.context),
      })

      return assign(defaultDescriptor, middlewareFactory(middlewareParams))
    }

    const { resourceName: name, resourceMethod: method } = args
    const resourceMiddleware = this.createMethodDescriptor(name, method).middleware
    const middlewares = [...resourceMiddleware, ...this.middleware]

    return middlewares.map(createInstance)
  }
}

export default Manifest
