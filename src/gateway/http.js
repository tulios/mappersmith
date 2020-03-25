import url from 'url'
import http from 'http'
import https from 'https'

import { assign } from '../utils'
import Gateway from '../gateway'
import Response from '../response'
import { createTimeoutError } from './timeout-error'

function HTTP (request) {
  Gateway.apply(this, arguments)
}

HTTP.prototype = Gateway.extends({
  get () {
    this.performRequest('get')
  },

  head () {
    this.performRequest('head')
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

  performRequest (method) {
    const headers = {}
    // eslint-disable-next-line node/no-deprecated-api
    const defaults = url.parse(this.request.url())
    const requestMethod = this.shouldEmulateHTTP() ? 'post' : method
    const body = this.prepareBody(method, headers)
    const timeout = this.request.timeout()

    this.canceled = false

    if (body && typeof body.length === 'number') {
      headers['content-length'] = Buffer.byteLength(body)
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

    const httpOptions = this.options().HTTP

    if (httpOptions.useSocketConnectionTimeout) {
      requestParams['timeout'] = timeout
    }

    if (httpOptions.configure) {
      assign(requestParams, httpOptions.configure(requestParams))
    }

    if (httpOptions.onRequestWillStart) {
      httpOptions.onRequestWillStart(requestParams)
    }

    const httpRequest = handler
      .request(requestParams, (httpResponse) => this.onResponse(httpResponse, httpOptions, requestParams))

    httpRequest.on('socket', socket => {
      if (httpOptions.onRequestSocketAssigned) {
        httpOptions.onRequestSocketAssigned(requestParams)
      }

      socket.on('lookup', () => {
        if (httpOptions.onSocketLookup) {
          httpOptions.onSocketLookup(requestParams)
        }
      })
      socket.on('connect', () => {
        if (httpOptions.onSocketConnect) {
          httpOptions.onSocketConnect(requestParams)
        }
      })
      socket.on('secureConnect', () => {
        if (httpOptions.onSocketSecureConnect) {
          httpOptions.onSocketSecureConnect(requestParams)
        }
      })
    })

    httpRequest.on('error', (e) => this.onError(e))
    body && httpRequest.write(body)

    if (timeout) {
      if (!httpOptions.useSocketConnectionTimeout) {
        httpRequest.setTimeout(timeout)
      }

      httpRequest.on('timeout', () => {
        this.canceled = true
        httpRequest.abort()
        const error = createTimeoutError(`Timeout (${timeout}ms)`)
        this.dispatchClientError(error.message, error)
      })
    }

    httpRequest.end()
  },

  onResponse (httpResponse, httpOptions, requestParams) {
    const rawData = []

    if (!this.request.isBinary()) {
      httpResponse.setEncoding('utf8')
    }

    httpResponse.once('readable', () => {
      if (httpOptions.onResponseReadable) {
        httpOptions.onResponseReadable(requestParams)
      }
    })

    httpResponse
      .on('data', (chunk) => rawData.push(chunk))
      .on('end', () => {
        if (this.canceled) {
          return
        }

        this.dispatchResponse(this.createResponse(httpResponse, rawData))
      })

    httpResponse.on('end', () => {
      if (httpOptions.onResponseEnd) {
        httpOptions.onResponseEnd(requestParams)
      }
    })
  },

  onError (e) {
    if (this.canceled) {
      return
    }

    this.dispatchClientError(e.message, e)
  },

  createResponse (httpResponse, rawData) {
    return new Response(
      this.request,
      httpResponse.statusCode,
      this.request.isBinary() ? Buffer.concat(rawData) : rawData.join(''),
      httpResponse.headers
    )
  }
})

export default HTTP
