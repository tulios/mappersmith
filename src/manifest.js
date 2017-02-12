import MethodDescriptor from './method-descriptor'
import { assign } from './utils'

/**
 * @typedef Manifest
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {String} obj.resources - default: {}
 *   @param {String} obj.middlewares - default: []
 */
function Manifest(obj) {
  this.host = obj.host
  this.resources = obj.resources || {}
  this.middlewares = obj.middlewares || []
}

Manifest.prototype = {
  eachResource(callback) {
    Object.keys(this.resources).forEach((resourceName) => {
      const methods = this.eachMethod(resourceName, (methodName) => ({
        name: methodName,
        descriptor: this.createMethodDescriptor(resourceName, methodName)
      }))

      callback(resourceName, methods)
    })
  },

  eachMethod(resourceName, callback) {
    return Object
      .keys(this.resources[resourceName])
      .map((name) => callback(name))
  },

  createMethodDescriptor(resourceName, methodName) {
    const definition = this.resources[resourceName][methodName]

    if (!definition || !definition.path) {
      throw new Error(
        `[Mappersmith] path is undefined for resource "${resourceName}" method "${methodName}"`
      )
    }

    return new MethodDescriptor(assign(
      { host: this.host },
      definition
    ))
  },

  createMiddlewares() {
    const createInstance = (middlewareFactory) => assign({
      request: (request) => request,
      response: (next) => next()
    }, middlewareFactory())

    return this.middlewares
      .map((middleware) => createInstance(middleware))
  }
}

export default Manifest
