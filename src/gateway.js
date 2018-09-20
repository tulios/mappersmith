import { performanceNow, assign, toQueryString, isPlainObject } from './utils'
import { configs as defaultConfigs } from './mappersmith'
import Response from './response'
import { isTimeoutError } from './gateway/timeout-error'

const REGEXP_EMULATE_HTTP = /^(delete|put|patch)/i

function Gateway (request, configs = {}) {
  this.request = request
  this.configs = configs
  this.successCallback = function () {}
  this.failCallback = function () {}
}

Gateway.extends = (methods) => assign({}, Gateway.prototype, methods)

Gateway.prototype = {
  options () {
    return this.configs
  },

  shouldEmulateHTTP () {
    return this.options().emulateHTTP &&
      REGEXP_EMULATE_HTTP.test(this.request.method())
  },

  call () {
    const timeStart = performanceNow()
    return new defaultConfigs.Promise((resolve, reject) => {
      this.successCallback = (response) => {
        response.timeElapsed = performanceNow() - timeStart
        resolve(response)
      }

      this.failCallback = (response) => {
        response.timeElapsed = performanceNow() - timeStart
        reject(response)
      }

      try {
        this[this.request.method()].apply(this, arguments)
      } catch (e) {
        this.dispatchClientError(e.message, e)
      }
    })
  },

  dispatchResponse (response) {
    response.success()
      ? this.successCallback(response)
      : this.failCallback(response)
  },

  dispatchClientError (message, error) {
    if (isTimeoutError(error) && this.options().enableHTTP408OnTimeouts) {
      this.failCallback(new Response(this.request, 408, message, {}, [error]))
    } else {
      this.failCallback(new Response(this.request, 400, message, {}, [error]))
    }
  },

  prepareBody (method, headers) {
    let body = this.request.body()

    if (this.shouldEmulateHTTP()) {
      body = body || {}
      isPlainObject(body) && (body._method = method)
      headers['x-http-method-override'] = method
    }

    const bodyString = toQueryString(body)

    if (bodyString) {
      // If it's not simple, let the browser (or the user) set it
      if (isPlainObject(body)) {
        headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8'
      }
    }

    return bodyString
  }
}

export default Gateway
