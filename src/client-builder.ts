import { Manifest, ManifestOptions, GlobalConfigs, Method } from './manifest'
import { Response } from './response'
import { Request } from './request'
import type { MiddlewareDescriptor, RequestGetter, ResponseGetter } from './middleware'
import type { Gateway, GatewayConfiguration } from './gateway/types'
import type { Params } from './types'

type AsyncFunction = (params?: Params) => Promise<Response>

type AsyncFunctions<HashType> = {
  [Key in keyof HashType]: AsyncFunction
}

type Client<ResourcesType> = {
  [ResourceKey in keyof ResourcesType]: AsyncFunctions<ResourcesType[ResourceKey]>
}

type ResourceConstraint = {
  [key: string]: AsyncFunction
}

interface RequestPhaseFailureContext {
  middleware: string | null
  returnedInvalidRequest: boolean
  abortExecution: boolean
}

interface GatewayConstructor {
  new (request: Request, gatewayConfigs: GatewayConfiguration): Gateway
  readonly prototype: Gateway
}

/**
 * @typedef ClientBuilder
 * @param {Object} manifestDefinition - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
export class ClientBuilder {
  public Promise: PromiseConstructor
  public manifest: Manifest
  public GatewayClassFactory: () => GatewayConstructor
  public maxMiddlewareStackExecutionAllowed: number

  constructor(
    manifestDefinition: ManifestOptions,
    GatewayClassFactory: () => GatewayConstructor,
    configs: GlobalConfigs
  ) {
    if (!manifestDefinition) {
      throw new Error(`[Mappersmith] invalid manifest (${manifestDefinition})`)
    }

    if (!GatewayClassFactory || !GatewayClassFactory()) {
      throw new Error('[Mappersmith] gateway class not configured (configs.gateway)')
    }

    if (!configs.Promise) {
      throw new Error('[Mappersmith] Promise not configured (configs.Promise)')
    }

    this.Promise = configs.Promise
    this.manifest = new Manifest(manifestDefinition, configs)
    this.GatewayClassFactory = GatewayClassFactory
    this.maxMiddlewareStackExecutionAllowed = configs.maxMiddlewareStackExecutionAllowed
  }

  public build<T extends ResourceConstraint>() {
    const client: Client<T> = { _manifest: this.manifest } as never

    this.manifest.eachResource((resourceName: keyof T, methods) => {
      client[resourceName] = this.buildResource<T>(resourceName, methods)
    })

    return client
  }

  private buildResource<T, K extends keyof T = keyof T>(resourceName: K, methods: Method[]) {
    type Resource = AsyncFunctions<T[K]>
    const initialResourceValue: Partial<Resource> = {}

    const resource = methods.reduce((resource, method) => {
      const resourceMethod = (requestParams: Params) => {
        const request = new Request(method.descriptor, requestParams)
        // `resourceName` can be `PropertyKey`, making this `string | number | Symbol`, therefore the string conversion
        // to stop type bleeding.
        return this.invokeMiddlewares(String(resourceName), method.name, request)
      }
      return {
        ...resource,
        [method.name]: resourceMethod,
      }
    }, initialResourceValue)

    // @hint: This type assert is needed as the compiler cannot be made to understand that the reduce produce a
    // non-partial result on a partial input. This is due to a shortcoming of the type signature for Array<T>.reduce().
    // @link: https://github.com/microsoft/TypeScript/blob/v3.7.2/lib/lib.es5.d.ts#L1186
    return resource as Resource
  }

  private invokeMiddlewares(resourceName: string, resourceMethod: string, initialRequest: Request) {
    const middleware = this.manifest.createMiddleware({ resourceName, resourceMethod })
    const GatewayClass = this.GatewayClassFactory()
    const gatewayConfigs = this.manifest.gatewayConfigs
    const requestPhaseFailureContext: RequestPhaseFailureContext = {
      middleware: null,
      returnedInvalidRequest: false,
      abortExecution: false,
    }

    const getInitialRequest = () => this.Promise.resolve(initialRequest)
    const chainRequestPhase = (next: RequestGetter, middleware: MiddlewareDescriptor) => () => {
      const abort = (error: Error) => {
        requestPhaseFailureContext.abortExecution = true
        throw error
      }

      return this.Promise.resolve()
        .then(() => middleware.prepareRequest(next, abort))
        .then((request: unknown) => {
          if (request instanceof Request) {
            return request
          }

          // FIXME: Here be dragons: prepareRequest is typed as Promise<Response | void>
          // but this code clearly expects it can be something else... anything.
          // Hence manual cast to `unknown` above.
          requestPhaseFailureContext.returnedInvalidRequest = true
          const typeValue = typeof request
          const prettyType =
            typeValue === 'object' || typeValue === 'function'
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (request as any).name || typeValue
              : typeValue

          throw new Error(
            `[Mappersmith] middleware "${middleware.__name}" should return "Request" but returned "${prettyType}"`
          )
        })
        .catch((e) => {
          requestPhaseFailureContext.middleware = middleware.__name || null
          throw e
        })
    }

    const prepareRequest = middleware.reduce(chainRequestPhase, getInitialRequest)
    let executions = 0

    const executeMiddlewareStack = () =>
      prepareRequest()
        .catch((e) => {
          const { returnedInvalidRequest, abortExecution, middleware } = requestPhaseFailureContext
          if (returnedInvalidRequest || abortExecution) {
            throw e
          }

          const error = new Error(
            `[Mappersmith] middleware "${middleware}" failed in the request phase: ${e.message}`
          )
          error.stack = e.stack
          throw error
        })
        .then((finalRequest) => {
          executions++

          if (executions > this.maxMiddlewareStackExecutionAllowed) {
            throw new Error(
              `[Mappersmith] infinite loop detected (middleware stack invoked ${executions} times). Check the use of "renew" in one of the middleware.`
            )
          }

          const renew = executeMiddlewareStack
          const chainResponsePhase =
            (previousValue: ResponseGetter, currentValue: MiddlewareDescriptor) => () => {
              // Deliberately putting this on two separate lines - to get typescript to not return "any"
              const nextValue = currentValue.response(previousValue, renew)
              return nextValue
            }
          const callGateway = () => new GatewayClass(finalRequest, gatewayConfigs).call()
          const execute = middleware.reduce(chainResponsePhase, callGateway)
          return execute()
        })

    return new this.Promise<Response>((resolve, reject) => {
      executeMiddlewareStack()
        .then((response) => resolve(response))
        .catch(reject)
    })
  }
}

export default ClientBuilder
