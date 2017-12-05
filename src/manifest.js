import MethodDescriptor from './method-descriptor'
import { assign } from './utils'

/**
 * @typedef Manifest
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {Object} obj.gatewayConfigs - default: base values from mappersmith
 *   @param {Object} obj.resources - default: {}
 *   @param {Array}  obj.middleware or obj.middlewares - default: []
 */
function Manifest (obj, defaultGatewayConfigs = null, defaultMiddleware = []) {
  this.host = obj.host
  this.clientId = obj.clientId || null
  this.gatewayConfigs = assign({}, defaultGatewayConfigs, obj.gatewayConfigs)
  this.resources = obj.resources || {}

  // TODO: deprecate obj.middlewares in favor of obj.middleware
  this.middleware = [...(obj.middleware || obj.middlewares || []), ...defaultMiddleware]
}

Manifest.prototype = {
  eachResource (callback) {
    Object.keys(this.resources).forEach((resourceName) => {
      const methods = this.eachMethod(resourceName, (methodName) => ({
        name: methodName,
        descriptor: this.createMethodDescriptor(resourceName, methodName)
      }))

      callback(resourceName, methods)
    })
  },

  eachMethod (resourceName, callback) {
    return Object
      .keys(this.resources[resourceName])
      .map(callback)
  },

  createMethodDescriptor (resourceName, methodName) {
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
  createMiddleware (args = {}) {
    const createInstance = (middlewareFactory) => assign({
      request: (request) => request,
      response: (next) => next()
    }, middlewareFactory(assign(args, { clientId: this.clientId })))

    return this.middleware.map(createInstance)
  }
}

export default Manifest
