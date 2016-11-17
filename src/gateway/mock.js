import Gateway from '../gateway'
import Response from '../response'
import { assign, parseResponseHeaders } from '../utils'
import { lookupResponse } from '../test'

function Mock (request) {
  Gateway.apply(this, arguments)
}

Mock.prototype = Gateway.extends({
  get() {
    this.callMock()
  },

  post() {
    this.callMock()
  },

  put() {
    this.callMock()
  },

  patch() {
    this.callMock()
  },

  delete() {
    this.callMock()
  },

  callMock(httpMethod) {
    this.dispatchResponse(lookupResponse(this.request))
  }
})

export default Mock
