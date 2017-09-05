import { performanceNow, assign, toQueryString, isPlainObject } from './utils'
import { configs as defaultConfigs } from './mappersmith'
import Response from './response'

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
      /^(delete|put|patch)/i.test(this.request.method())
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
        this.dispatchClientError(e.message)
      }
    })
  },

  dispatchResponse (response) {
    response.success()
      ? this.successCallback(response)
      : this.failCallback(response)
  },

  dispatchClientError (message) {
    this.failCallback(new Response(this.request, 400, message))
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
