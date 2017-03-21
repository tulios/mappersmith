import Gateway from '../gateway'
import Response from '../response'
import { assign } from '../utils'
import { configs } from '../mappersmith'

const fetch = configs.fetch

if (!fetch) {
  throw new Error(
    `[Mappersmith] global fetch does not exist, please assign "configs.fetch" to a valid implementation`
  )
}

/**
 * Gateway which uses the "fetch" implementation configured in "configs.fetch".
 * By default "configs.fetch" will receive the global fetch, this gateway doesn't
 * use browser specific code, with a proper "fetch" implementation it can also be
 * used with node.js
 */
function Fetch (request) {
  Gateway.apply(this, arguments)
}

Fetch.prototype = Gateway.extends({
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
    const customHeaders = {}
    const body = this.prepareBody(method, customHeaders)
    const headers = assign(customHeaders, this.request.headers())

    const requestMethod = this.shouldEmulateHTTP() ? 'post' : method
    const init = assign({ method: requestMethod, headers, body }, this.options())

    fetch(this.request.url(), init)
      .then((fetchResponse) => {
        return fetchResponse.text().then((data) => {
          this.dispatchResponse(this.createResponse(fetchResponse, data))
        })
      })
      .catch((error) => this.dispatchClientError(error.message))
  },

  createResponse(fetchResponse, data) {
    const status = fetchResponse.status
    const responseHeaders = {}
    fetchResponse.headers.forEach((value, key) => responseHeaders[key] = value)

    return new Response(
      this.request,
      status,
      data,
      responseHeaders
    )
  }
})

export default Fetch
