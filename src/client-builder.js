import Manifest from './manifest'
import MethodDescriptor from './method-descriptor'
import Request from './request'
import { assign } from './utils'

/**
 * @typedef ClientBuilder
 * @param {Object} manifest - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
function ClientBuilder(manifest, GatewayClassFactory) {
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

  this.manifest = new Manifest(manifest)
  this.GatewayClassFactory = GatewayClassFactory
}

ClientBuilder.prototype = {
  build() {
    const client = { _manifest: this.manifest }

    this.manifest.eachResource((name, methods) => {
      client[name] = this.buildResource(methods)
    })

    return client
  },

  buildResource(methods) {
    return methods.reduce((resource, method) => assign(resource, {
      [method.name]: (requestParams) => {
        const request = new Request(method.descriptor, requestParams)
        return this.invokeMiddlewares(request)
      }
    }), {})
  },

  invokeMiddlewares(initialRequest) {
    const middlewares = this.manifest.createMiddlewares()
    const finalRequest = middlewares
      .reduce((request, middleware) => middleware.request(request), initialRequest)

    const GatewayClass = this.GatewayClassFactory()
    const callGateway = () => new GatewayClass(finalRequest).call()

    const execute = middlewares
      .reduce(
        (next, middleware) => () => middleware.response(next),
        callGateway
      )

    return execute()
  }
}

export default ClientBuilder
