import Gateway from '../gateway'
import Response from '../response'
import { assign, parseResponseHeaders } from '../utils'

function XHR (request) {
  Gateway.apply(this, arguments)
}

XHR.prototype = Gateway.extends({
  get() {
    const xmlHttpRequest = new XMLHttpRequest()
    this.configureCallbacks(xmlHttpRequest)
    xmlHttpRequest.open('get', this.request.url(), true)
    this.setHeaders(xmlHttpRequest, {})
    xmlHttpRequest.send()
  },

  post() {
    this.performRequest('post')
  },

  put() {
    this.performRequest('put')
  },

  patch() {
    this.performRequest('patch')
  },

  delete() {
    this.performRequest('delete')
  },

  configureCallbacks(xmlHttpRequest) {
    xmlHttpRequest.addEventListener('load', () => {
      this.dispatchResponse(this.createResponse(xmlHttpRequest))
    })

    xmlHttpRequest.addEventListener('error', () => {
      this.dispatchClientError('Network error')
    })

    const xhrOptions = this.options().XHR
    if (xhrOptions.withCredentials) {
      xmlHttpRequest.withCredentials = true
    }

    if (xhrOptions.configure) {
      xhrOptions.configure(xmlHttpRequest)
    }
  },

  performRequest(method) {
    const requestMethod = this.shouldEmulateHTTP() ? 'post' : method
    const xmlHttpRequest = new XMLHttpRequest()
    this.configureCallbacks(xmlHttpRequest)
    xmlHttpRequest.open(requestMethod, this.request.url(), true);

    const customHeaders = {}
    const body = this.prepareBody(method, customHeaders)
    this.setHeaders(xmlHttpRequest, customHeaders)

    const args = []
    body && args.push(body)

    xmlHttpRequest.send.apply(xmlHttpRequest, args)
  },

  createResponse(xmlHttpRequest) {
    const status = xmlHttpRequest.status
    const data = xmlHttpRequest.responseText
    const responseHeaders = parseResponseHeaders(xmlHttpRequest.getAllResponseHeaders())
    return new Response(
      this.request,
      status,
      data,
      responseHeaders
    )
  },

  setHeaders(xmlHttpRequest, customHeaders) {
    const headers = assign(customHeaders, this.request.headers())
    Object
      .keys(headers)
      .forEach((headerName) => {
        xmlHttpRequest.setRequestHeader(headerName, headers[headerName])
      })
  }
})

export default XHR
