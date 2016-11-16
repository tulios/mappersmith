import MethodDescriptor from './method-descriptor'
import { assign } from './utils'

function Manifest(obj) {
  this.host = obj.host
  this.resources = obj.resources || {}
  this.middlewares = obj.middlewares || []
}

Manifest.prototype = {
  eachResource(callback) {
    Object.keys(this.resources).forEach((resourceName) => {
      const resource = this.resources[resourceName]
      const methods = this.eachMethod(resource, (name, definition) => ({
        name,
        descriptor: this.createMethodDescriptor(definition)
      }))

      callback(resourceName, methods)
    })
  },

  eachMethod(resource, callback) {
    return Object
      .keys(resource)
      .map((name) => callback(name, resource[name]))
  },

  createMethodDescriptor(definition) {
    return new MethodDescriptor(assign(
      { host: this.host },
      definition
    ))
  },

  createMiddlewares() {
    return this.middlewares.map((middleware) => middleware())
  }
}

export default Manifest
