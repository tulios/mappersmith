import url from 'url'
import http from 'http'
import https from 'https'

import { toQueryString, assign } from '../utils'
import Gateway from '../gateway'
import Response from '../response'

function HTTP(request) {
  Gateway.apply(this, arguments)
}

HTTP.prototype = Gateway.extends({
  get() {
    this.performRequest('get')
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

  performRequest(method) {
    const headers = {}
    const defaults = url.parse(this.request.url())
    const requestMethod = this.shouldEmulateHTTP() ? 'post' : method
    const body = this.prepareBody(method, headers)

    if (body && typeof body.length === 'number') {
      headers['content-length'] = body.length
    }

    const handler = (defaults.protocol === 'https:') ? https : http

    const requestParams = assign(defaults, {
      method: requestMethod,
      headers: assign(headers, this.request.headers())
    })

    const auth = this.request.auth()
    if (auth) {
      const username = auth.username || ''
      const password = auth.password || ''
      requestParams['auth'] = `${username}:${password}`
    }

    const httpRequest = handler
      .request(requestParams, (httpResponse) => this.onResponse(httpResponse))

    httpRequest.on('error', (e) => this.onError(e))
    body && httpRequest.write(body)
    httpRequest.end()
  },

  onResponse(httpResponse) {
    const rawData = []
    httpResponse.setEncoding('utf8')
    httpResponse
      .on('data', (chunk) => rawData.push(chunk))
      .on('end', () => {
        this.dispatchResponse(this.createResponse(httpResponse, rawData))
      })
  },

  onError(e) {
    this.dispatchClientError(e.message)
  },

  createResponse(httpResponse, rawData) {
    return new Response(
      this.request,
      httpResponse.statusCode,
      rawData.join(''),
      httpResponse.headers
    )
  }
})

export default HTTP
