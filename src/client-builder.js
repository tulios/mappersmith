import Manifest from './manifest'
import MethodDescriptor from './method-descriptor'
import Request from './request'
import { assign } from './utils'

function ClientBuilder(manifest, GatewayClass) {
  if (!GatewayClass) {
    throw new Error(
      '[Mappersmith] gateway class not configured (configs.gateway)'
    )
  }

  this.manifest = new Manifest(manifest)
  this.GatewayClass = GatewayClass
  this.globalSuccessHandler = function() {}
  this.globalErrorHandler = function() {}
}

ClientBuilder.prototype = {
  build() {
    const client = { _manifest: this.manifest }

    this.manifest.eachResource((name, methods) => {
      client[name] = this.buildResource(methods)
    })

    this.addGlobalHandlers(client)

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

    const callGateway = () => new this.GatewayClass(finalRequest).call()

    const execute = middlewares
      .reduce(
        (next, middleware) => () => middleware.response(next),
        callGateway
      )

    return execute()
  },

  addGlobalHandlers(client) {
    client.onSuccess = (handler) => {
      this.globalSuccessHandler = handler
      return client
    }

    client.onError = (handler) => {
      this.globalErrorHandler = handler
      return client
    }
  }
}

export default ClientBuilder
