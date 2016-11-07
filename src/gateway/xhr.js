import Gateway from '../gateway'
import Response from '../response'
import { parseResponseHeaders, toQueryString } from '../utils'

const isContentTypeJSON = (xmlHttpRequest) => {
  return /application\/json/.test(xmlHttpRequest.getResponseHeader('Content-Type'))
}

function XHR (request) {
  Gateway.apply(this, arguments)
}

XHR.prototype = Gateway.extends({
  get() {
    const xmlHttpRequest = new XMLHttpRequest()
    this.configureCallbacks(xmlHttpRequest)
    xmlHttpRequest.open('get', this.request.url, true)
    this.setHeaders(xmlHttpRequest)
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
      try {
        const status = xmlHttpRequest.status
        const response = this.createResponse(xmlHttpRequest)

        if (status >= 200 && status < 400) {
          this.successCallback(response)

        } else {
          this.failCallback(response)
        }
      } catch (e) {
        this.failCallback(new Response(this.request, 400, e.message))
      }
    })

    xmlHttpRequest.addEventListener('error', () => {
      this.failCallback(new Response(this.request, 400, 'Network error'))
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
    let requestMethod = method
    const emulateHTTP = this.shouldEmulateHTTP()
    const xmlHttpRequest = new XMLHttpRequest()
    this.configureCallbacks(xmlHttpRequest)

    let body = this.request.body()

    if (emulateHTTP) {
      body = body || {}
      requestMethod = 'post'
      if (typeof body === 'object') {
        body._method = method
      }
    }

    xmlHttpRequest.open(requestMethod, this.request.url, true);

    if (emulateHTTP) {
      xmlHttpRequest.setRequestHeader('x-http-method-override', method)
    }

    this.setHeaders(xmlHttpRequest)
    this.ensureContentType(xmlHttpRequest)

    let args = [];
    if (body !== undefined) {
      args.push(toQueryString(body))
    }

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

  setHeaders(xmlHttpRequest) {
    const headers = this.request.headers()
    Object
      .keys(headers)
      .forEach((headerName) => {
        xmlHttpRequest.setRequestHeader(headerName, headers[headerName])
      })
  },

  ensureContentType(xmlHttpRequest) {
    const headers = this.request.headers()
    if (!headers['content-type']) {
      xmlHttpRequest.setRequestHeader(
        'content-type',
        'application/x-www-form-urlencoded;charset=utf-8'
      )
    }
  }
})

export default XHR
