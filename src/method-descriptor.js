/**
 * @typedef MethodDescriptor
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {String} obj.path
 *   @param {String} obj.method
 *   @param {Object} obj.headers
 *   @param {Object} obj.params
 *   @param {String} obj.bodyAttr - body attribute name. Default: 'body'
 *   @param {String} obj.headersAttr - headers attribute name. Default: 'headers'
 */
export default function MethodDescriptor(obj) {
  this.host = obj.host
  this.path = obj.path
  this.method = obj.method || 'get'
  this.headers = obj.headers
  this.params = obj.params

  this.bodyAttr = obj.bodyAttr || 'body'
  this.headersAttr = obj.headersAttr || 'headers'
}
