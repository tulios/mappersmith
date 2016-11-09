import Manifest from './manifest'
import MethodDescriptor from './method-descriptor'
import Request from './request'
import { assign } from './utils'

function ClientBuilder(manifest, GatewayClass) {
  this.manifest = new Manifest(manifest)
  this.GatewayClass = GatewayClass
  this.globalSuccessHandler = function() {}
  this.globalErrorHandler = function() {}
}

ClientBuilder.prototype = {
  build() {
    const client = {}

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
        return new this.GatewayClass(request).call()
      }
    }), {})
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
