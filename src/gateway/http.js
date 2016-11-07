import Gateway from '../gateway'

function HTTP(request) {
  Gateway.apply(this, arguments)
}

HTTP.prototype = Gateway.extends({
  get() {
    throw new Error('Not implemented')
  },

  post() {
    throw new Error('Not implemented')
  },

  put() {
    throw new Error('Not implemented')
  },

  patch() {
    throw new Error('Not implemented')
  },

  delete() {
    throw new Error('Not implemented')
  }
})

export default HTTP
