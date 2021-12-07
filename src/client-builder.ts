import { Manifest, ManifestOptions, GlobalConfigs, Method } from './manifest'
import { Response } from './response'
import { Request } from './request'
import { assign } from './utils'
import type { MiddlewareDescriptor, RequestGetter, ResponseGetter } from './middleware'
import type { Gateway, GatewayConfiguration } from './gateway/types'
import type { RequestParams } from './types'

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

  // FIXME: Type
  public build() {
    const client: { [clientName: string]: unknown } = { _manifest: this.manifest }

    this.manifest.eachResource((name, methods) => {
      client[name] = this.buildResource(name, methods)
    })

    return client
  }

  // FIXME: Type
  private buildResource(resourceName: string, methods: Method[]) {
    return methods.reduce(
      (resource, method) =>
        assign(resource, {
          [method.name]: (requestParams: RequestParams) => {
            const request = new Request(method.descriptor, requestParams)
            return this.invokeMiddlewares(resourceName, method.name, request)
          },
        }),
      {}
    )
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
