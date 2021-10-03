/**
 * @typedef MethodDescriptor
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {boolean} obj.allowResourceHostOverride
 *   @param {String|Function} obj.path
 *   @param {String} obj.method
 *   @param {Object} obj.headers
 *   @param {Object} obj.params
 *   @param {Object} obj.queryParamAlias
 *   @param {String} obj.bodyAttr - body attribute name. Default: 'body'
 *   @param {String} obj.headersAttr - headers attribute name. Default: 'headers'
 *   @param {String} obj.authAttr - auth attribute name. Default: 'auth'
 *   @param {Number} obj.timeoutAttr - timeout attribute name. Default: 'timeout'
 *   @param {String} obj.hostAttr - host attribute name. Default: 'host'
 */
export default function MethodDescriptor (obj) {
  this.host = obj.host
  this.allowResourceHostOverride = obj.allowResourceHostOverride || false
  this.path = obj.path
  this.method = obj.method || 'get'
  this.headers = obj.headers
  this.params = obj.params
  this.queryParamAlias = obj.queryParamAlias || {}
  this.binary = obj.binary || false

  this.bodyAttr = obj.bodyAttr || 'body'
  this.headersAttr = obj.headersAttr || 'headers'
  this.authAttr = obj.authAttr || 'auth'
  this.timeoutAttr = obj.timeoutAttr || 'timeout'
  this.hostAttr = obj.hostAttr || 'host'

  const resourceMiddleware = obj.middleware || obj.middlewares || []
  this.middleware = resourceMiddleware
}
