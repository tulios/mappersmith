import Manifest from './manifest'
import Request from './request'
import { assign } from './utils'

/**
 * @typedef ClientBuilder
 * @param {Object} manifest - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
function ClientBuilder(manifest, GatewayClassFactory, configs) {
  if (!manifest) {
    throw new Error(`[Mappersmith] invalid manifest (${manifest})`)
  }

  if (!GatewayClassFactory || !GatewayClassFactory()) {
    throw new Error('[Mappersmith] gateway class not configured (configs.gateway)')
  }

  this.Promise = configs.Promise
  this.manifest = new Manifest(manifest, configs)
  this.GatewayClassFactory = GatewayClassFactory
  this.maxMiddlewareStackExecutionAllowed = configs.maxMiddlewareStackExecutionAllowed
}

ClientBuilder.prototype = {
  build() {
    const client = { _manifest: this.manifest }

    this.manifest.eachResource((name, methods) => {
      client[name] = this.buildResource(name, methods)
    })

    return client
  },

  buildResource(resourceName, methods) {
    return methods.reduce(
      (resource, method) =>
        assign(resource, {
          [method.name]: (requestParams) => {
            const request = new Request(method.descriptor, requestParams)
            return this.invokeMiddlewares(resourceName, method.name, request)
          },
        }),
      {}
    )
  },

  invokeMiddlewares(resourceName, resourceMethod, initialRequest) {
    const middleware = this.manifest.createMiddleware({ resourceName, resourceMethod })
    const GatewayClass = this.GatewayClassFactory()
    const gatewayConfigs = this.manifest.gatewayConfigs
    const requestPhaseFailureContext = {
      middleware: null,
      returnedInvalidRequest: false,
      abortExecution: false,
    }

    const getInitialRequest = () => this.Promise.resolve(initialRequest)
    const chainRequestPhase = (next, middleware) => () => {
      const abort = (error) => {
        requestPhaseFailureContext.abortExecution = true
        throw error
      }

      return this.Promise.resolve()
        .then(() => middleware.prepareRequest(next, abort))
        .then((request) => {
          if (request instanceof Request) {
            return request
          }

          requestPhaseFailureContext.returnedInvalidRequest = true
          const typeValue = typeof request
          const prettyType =
            typeValue === 'object' || typeValue === 'function'
              ? request.name || typeValue
              : typeValue

          throw new Error(
            `[Mappersmith] middleware "${middleware.__name}" should return "Request" but returned "${prettyType}"`
          )
        })
        .catch((e) => {
          requestPhaseFailureContext.middleware = middleware.__name
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
          const chainResponsePhase = (next, middleware) => () => middleware.response(next, renew)
          const callGateway = () => new GatewayClass(finalRequest, gatewayConfigs).call()
          const execute = middleware.reduce(chainResponsePhase, callGateway)
          return execute()
        })

    return new this.Promise((resolve, reject) => {
      executeMiddlewareStack()
        .then((response) => resolve(response))
        .catch(reject)
    })
  },
}

export default ClientBuilder
