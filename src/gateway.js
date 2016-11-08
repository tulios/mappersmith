import { performanceNow, assign } from './utils'
import { configs } from './index'
import Response from './response'

function Gateway(request) {
  this.request = request
  this.successCallback = function() {}
  this.failCallback = function() {}
}

Gateway.extends = function(methods) {
  return assign({}, Gateway.prototype, methods)
}

Gateway.prototype = {
  options() {
    return configs.gatewayConfigs
  },

  shouldEmulateHTTP() {
    return this.options().emulateHTTP &&
      /^(delete|put|patch)/i.test(this.request.method())
  },

  call() {
    const timeStart = performanceNow()
    return new configs.Promise((resolve, reject) => {
      this.successCallback = (response) => {
        response.timeElapsed = performanceNow() - timeStart
        resolve(response)
      }

      this.failCallback = (response) => {
        response.timeElapsed = performanceNow() - timeStart
        reject(response)
      }

      this[this.request.method()].apply(this, arguments)
    })
  }
}

export default Gateway
