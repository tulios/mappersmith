import { performanceNow } from 'src/utils'
import { configs } from 'src/index'
import Response from 'src/response'

export default class Gateway {
  /**
   * @param {Request} request
   */
  constructor(request) {
    this.request = request
    this.successCallback = function(response) {}
    this.failCallback = function(response) {}
  }

  options() {
    return configs.gatewayConfigs
  }

  shouldEmulateHTTP() {
    return this.options().emulateHTTP &&
      /^(delete|put|patch)/i.test(this.request.method())
  }

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
