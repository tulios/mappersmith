export default class MethodDescriptor {
  /*
   * Accepts:
   *    @String host
   *    @String path
   *    @String method
   *    @Object params
   *    @Function processor
   *    @String bodyAttr - Body attribute name. Default: 'body'
   *    @String headersAttr - Headers attribute name. Default: 'headers'
  **/
  constructor(obj) {
    this.host = obj.host
    this.path = obj.path
    this.method = obj.method
    this.params = obj.params
    this.processor = obj.processor
    this.bodyAttr = obj.bodyAttr || 'body'
    this.headersAttr = obj.headersAttr || 'headers'
  }
}
