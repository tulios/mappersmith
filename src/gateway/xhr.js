import Gateway from '../gateway'
import Response from '../response'
import { assign, parseResponseHeaders, btoa } from '../utils'
import TimeoutError from './timeout-error'

const toBase64 = window.btoa || btoa

function XHR (request) {
  Gateway.apply(this, arguments)
}

XHR.prototype = Gateway.extends({
  get () {
    const xmlHttpRequest = this.createXHR()
    xmlHttpRequest.open('GET', this.request.url(), true)
    this.setHeaders(xmlHttpRequest, {})
    this.configureTimeout(xmlHttpRequest)
    this.configureBinary(xmlHttpRequest)
    xmlHttpRequest.send()
  },

  head () {
    const xmlHttpRequest = this.createXHR()
    xmlHttpRequest.open('HEAD', this.request.url(), true)
    this.setHeaders(xmlHttpRequest, {})
    this.configureTimeout(xmlHttpRequest)
    this.configureBinary(xmlHttpRequest)
    xmlHttpRequest.send()
  },

  post () {
    this.performRequest('post')
  },

  put () {
    this.performRequest('put')
  },

  patch () {
    this.performRequest('patch')
  },

  delete () {
    this.performRequest('delete')
  },

  configureBinary (xmlHttpRequest) {
    if (this.request.isBinary()) {
      xmlHttpRequest.responseType = 'blob'
    }
  },

  configureTimeout (xmlHttpRequest) {
    this.canceled = false
    this.timer = null

    const timeout = this.request.timeout()

    if (timeout) {
      xmlHttpRequest.timeout = timeout
      xmlHttpRequest.addEventListener('timeout', () => {
        this.canceled = true
        clearTimeout(this.timer)
        const error = new TimeoutError(`Timeout (${timeout}ms)`)
        this.dispatchClientError(error.message, error)
      })

      // PhantomJS doesn't support timeout for XMLHttpRequest
      this.timer = setTimeout(() => {
        this.canceled = true
        const error = new TimeoutError(`Timeout (${timeout}ms)`)
        this.dispatchClientError(error.message, error)
      }, timeout + 1)
    }
  },

  configureCallbacks (xmlHttpRequest) {
    xmlHttpRequest.addEventListener('load', () => {
      if (this.canceled) {
        return
      }

      clearTimeout(this.timer)
      this.dispatchResponse(this.createResponse(xmlHttpRequest))
    })

    xmlHttpRequest.addEventListener('error', (e) => {
      if (this.canceled) {
        return
      }

      clearTimeout(this.timer)
      const guessedErrorCause = e
          ? e.message || e.name
          : xmlHttpRequest.responseText

      const errorMessage = 'Network error'
      const enhancedMessage = guessedErrorCause ? `: ${guessedErrorCause}` : ''
      const error = new Error(`${errorMessage}${enhancedMessage}`)
      this.dispatchClientError(errorMessage, error)
    })

    const xhrOptions = this.options().XHR
    if (xhrOptions.withCredentials) {
      xmlHttpRequest.withCredentials = true
    }

    if (xhrOptions.configure) {
      xhrOptions.configure(xmlHttpRequest)
    }
  },

  performRequest (method) {
    const requestMethod = this.shouldEmulateHTTP() ? 'post' : method
    const xmlHttpRequest = this.createXHR()
    xmlHttpRequest.open(requestMethod.toUpperCase(), this.request.url(), true)

    const customHeaders = {}
    const body = this.prepareBody(method, customHeaders)
    this.setHeaders(xmlHttpRequest, customHeaders)
    this.configureTimeout(xmlHttpRequest)
    this.configureBinary(xmlHttpRequest)

    const args = []
    body && args.push(body)

    xmlHttpRequest.send.apply(xmlHttpRequest, args)
  },

  createResponse (xmlHttpRequest) {
    const status = xmlHttpRequest.status
    const data = this.request.isBinary() ? xmlHttpRequest.response : xmlHttpRequest.responseText
    const responseHeaders = parseResponseHeaders(xmlHttpRequest.getAllResponseHeaders())
    return new Response(
      this.request,
      status,
      data,
      responseHeaders
    )
  },

  setHeaders (xmlHttpRequest, customHeaders) {
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

  createXHR () {
    const xmlHttpRequest = new XMLHttpRequest() // eslint-disable-line no-undef
    this.configureCallbacks(xmlHttpRequest)
    return xmlHttpRequest
  }
})

export default XHR
