/**
 * @param {Object} obj
 * @param {String}   obj.host
 * @param {String}   obj.path
 * @param {String}   obj.method
 * @param {Object}   obj.headers
 * @param {Object}   obj.params
 * @param {Function} obj.processor - function with two arguments, {Response} and responseData
 *                                   ex: (response, responseData) => ({ data: responseData })
 * @param {String}   obj.bodyAttr - Body attribute name. Default: 'body'
 * @param {String}   obj.headersAttr - Headers attribute name. Default: 'headers'
 */
export default function MethodDescriptor(obj) {
  this.host = obj.host
  this.path = obj.path
  this.method = obj.method || 'get'
  this.headers = obj.headers
  this.params = obj.params
  this.processor = obj.processor

  this.bodyAttr = obj.bodyAttr || 'body'
  this.headersAttr = obj.headersAttr || 'headers'
}
