import Gateway from '../gateway'
import Response from '../response'
import { assign, parseResponseHeaders, btoa } from '../utils'

const toBase64 = window.btoa || btoa

function XHR (request) {
  Gateway.apply(this, arguments)
}

XHR.prototype = Gateway.extends({
  get() {
    const xmlHttpRequest = this.createXHR()
    xmlHttpRequest.open('get', this.request.url(), true)
    this.setHeaders(xmlHttpRequest, {})
    this.configureTimeout(xmlHttpRequest)
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

  configureTimeout(xmlHttpRequest) {
    this.canceled = false
    this.timer = null

    const timeout = this.request.timeout()

    if (timeout) {
      xmlHttpRequest.timeout = timeout
      xmlHttpRequest.addEventListener('timeout', () => {
        this.canceled = true
        clearTimeout(this.timer)
        this.dispatchClientError(`Timeout (${timeout}ms)`)
      })

      // PhantomJS doesn't support timeout for XMLHttpRequest
      this.timer = setTimeout(() => {
        this.canceled = true
        this.dispatchClientError(`Timeout (${timeout}ms)`)
      }, timeout + 1)
    }
  },

  configureCallbacks(xmlHttpRequest) {
    xmlHttpRequest.addEventListener('load', () => {
      if (this.canceled) {
        return
      }

      clearTimeout(this.timer)
      this.dispatchResponse(this.createResponse(xmlHttpRequest))
    })

    xmlHttpRequest.addEventListener('error', () => {
      if (this.canceled) {
        return
      }

      clearTimeout(this.timer)
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
    const xmlHttpRequest = this.createXHR()
    xmlHttpRequest.open(requestMethod, this.request.url(), true);

    const customHeaders = {}
    const body = this.prepareBody(method, customHeaders)
    this.setHeaders(xmlHttpRequest, customHeaders)
    this.configureTimeout(xmlHttpRequest)

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
    const auth = this.request.auth()
    if (auth) {
      const username = auth.username || ''
      const password = auth.password || ''
      customHeaders['authorization'] = `Basic ${toBase64(`${username}:${password}`)}`
    }

    const headers = assign(customHeaders, this.request.headers())
    Object
      .keys(headers)
      .forEach((headerName) => {
        xmlHttpRequest.setRequestHeader(headerName, headers[headerName])
      })
  },

  createXHR() {
    const xmlHttpRequest = new XMLHttpRequest()
    this.configureCallbacks(xmlHttpRequest)
    return xmlHttpRequest
  }
})

export default XHR
