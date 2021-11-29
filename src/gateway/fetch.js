import Gateway from '../gateway'
import Response from '../response'
import { configs } from '../mappersmith'
// Fetch can be used in nodejs, so it should always use the btoa util
import { assign, btoa } from '../utils'
import { createTimeoutError } from './timeout-error'

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
function Fetch() {
  Gateway.apply(this, arguments)
}

Fetch.prototype = Gateway.extends({
  get() {
    this.performRequest('get')
  },

  head() {
    this.performRequest('head')
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
    const auth = this.request.auth()

    if (auth) {
      const username = auth.username || ''
      const password = auth.password || ''
      customHeaders['authorization'] = `Basic ${btoa(`${username}:${password}`)}`
    }

    const headers = assign(customHeaders, this.request.headers())
    const requestMethod = this.shouldEmulateHTTP() ? 'post' : method
    const init = assign({ method: requestMethod, headers, body }, this.options().Fetch)
    const timeout = this.request.timeout()

    let timer = null
    let canceled = false

    if (timeout) {
      timer = setTimeout(() => {
        canceled = true
        const error = createTimeoutError(`Timeout (${timeout}ms)`)
        this.dispatchClientError(error.message, error)
      }, timeout)
    }

    fetch(this.request.url(), init)
      .then((fetchResponse) => {
        if (canceled) {
          return
        }

        clearTimeout(timer)

        let responseData
        if (this.request.isBinary()) {
          if (typeof fetchResponse.buffer === 'function') {
            responseData = fetchResponse.buffer()
          } else {
            responseData = fetchResponse.arrayBuffer()
          }
        } else {
          responseData = fetchResponse.text()
        }

        responseData.then((data) => {
          this.dispatchResponse(this.createResponse(fetchResponse, data))
        })
      })
      .catch((error) => {
        if (canceled) {
          return
        }

        clearTimeout(timer)
        this.dispatchClientError(error.message, error)
      })
  },

  createResponse(fetchResponse, data) {
    const status = fetchResponse.status
    const responseHeaders = {}
    fetchResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return new Response(this.request, status, data, responseHeaders)
  },
})

export default Fetch
