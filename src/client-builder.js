import Manifest from './manifest'
import Request from './request'
import { assign } from './utils'

/**
 * @typedef ClientBuilder
 * @param {Object} manifest - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
function ClientBuilder (manifest, GatewayClassFactory, configs) {
  if (!manifest) {
    throw new Error(
      `[Mappersmith] invalid manifest (${manifest})`
    )
  }

  if (!GatewayClassFactory || !GatewayClassFactory()) {
    throw new Error(
      '[Mappersmith] gateway class not configured (configs.gateway)'
    )
  }

  this.Promise = configs.Promise
  this.manifest = new Manifest(manifest, configs)
  this.GatewayClassFactory = GatewayClassFactory
  this.maxMiddlewareStackExecutionAllowed = configs.maxMiddlewareStackExecutionAllowed
}

ClientBuilder.prototype = {
  build () {
    const client = { _manifest: this.manifest }

    this.manifest.eachResource((name, methods) => {
      client[name] = this.buildResource(name, methods)
    })

    return client
  },

  buildResource (resourceName, methods) {
    return methods.reduce((resource, method) => assign(resource, {
      [method.name]: (requestParams) => {
        const request = new Request(method.descriptor, requestParams)
        return this.invokeMiddlewares(resourceName, method.name, request)
      }
    }), {})
  },

  invokeMiddlewares (resourceName, resourceMethod, initialRequest) {
    const middleware = this.manifest.createMiddleware({ resourceName, resourceMethod })
    const GatewayClass = this.GatewayClassFactory()
    const gatewayConfigs = this.manifest.gatewayConfigs
    let requestPhaseExecutionFailed = false

    const chainRequestPhase = (requestPromise, middleware) => {
      return requestPromise
        .then(request => middleware.request(request))
        .catch(e => {
          if (requestPhaseExecutionFailed) {
            throw e
          }

          requestPhaseExecutionFailed = true
          const error = new Error(`[Mappersmith] middleware "${middleware.__name}" failed in the request phase: ${e.message}`)
          error.stack = e.stack
          throw error
        })
        .then(request => {
          if (request instanceof Request) {
            return request
          }

          requestPhaseExecutionFailed = true
          const typeValue = typeof request
          const prettyType = (typeValue === 'object' || typeValue === 'function')
            ? request.name || typeValue
            : typeValue

          throw new Error(`[Mappersmith] middleware "${middleware.__name}" should return "Request" but returned "${prettyType}"`)
        })
        .then(request => this.Promise.resolve(request))
    }

    let executions = 0

    const executeMiddlewareStack = () => middleware
      .reduce(
        chainRequestPhase,
        this.Promise.resolve(initialRequest)
      )
      .then(finalRequest => {
        executions++

        if (executions > this.maxMiddlewareStackExecutionAllowed) {
          throw new Error(
            `[Mappersmith] infinite loop detected (middleware stack invoked ${executions} times). Check the use of "renew" in one of the middleware.`
          )
        }

        const chainResponsePhase = (next, middleware) => () => middleware.response(next, executeMiddlewareStack)
        const callGateway = () => new GatewayClass(finalRequest, gatewayConfigs).call()
        const execute = middleware.reduce(chainResponsePhase, callGateway)
        return execute()
      })

    return new this.Promise((resolve, reject) => {
      executeMiddlewareStack()
        .then(response => resolve(response))
        .catch(reject)
    })
  }
}

export default ClientBuilder
