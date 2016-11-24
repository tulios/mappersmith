import { toQueryString, lowerCaseObjectKeys, assign } from './utils'

const REGEXP_DYNAMIC_SEGMENT = new RegExp('\{([^\}]+)\}')

function Request(methodDescriptor, requestParams) {
  this.methodDescriptor = methodDescriptor
  this.requestParams = requestParams || {}
}

Request.prototype = {
  params() {
    const params = assign(
      {},
      this.methodDescriptor.params,
      this.requestParams
    )

    const isParam = (key) => (
      key !== this.methodDescriptor.headersAttr &&
        key !== this.methodDescriptor.bodyAttr
    )

    return Object
      .keys(params)
      .reduce((obj, key) => {
        if (isParam(key)) {
          obj[key] = params[key]
        }
        return obj
      }, {})
  },

  method() {
    return this.methodDescriptor.method.toLowerCase()
  },

  host() {
    return (this.methodDescriptor.host || '').replace(/\/$/, '')
  },

  path() {
    let path = this.methodDescriptor.path
    const { headersAttr, bodyAttr } = this.methodDescriptor

    if (this.methodDescriptor.path[0] !== '/') {
      path = `/${this.methodDescriptor.path}`
    }

    const params = this.params()
    Object.keys(params).forEach((key) => {
      const value = params[key]
      const pattern = '\{' + key + '\}'

      if (new RegExp(pattern).test(path)) {
        path = path.replace('\{' + key + '\}', value)
        delete params[key]
      }
    })

    const missingDynamicSegmentMatch = path.match(REGEXP_DYNAMIC_SEGMENT)
    if (missingDynamicSegmentMatch) {
      throw new Error(
        `[Mappersmith] required parameter missing (${missingDynamicSegmentMatch[1]}), "${path}" cannot be resolved`
      )
    }

    const queryString = toQueryString(params)
    if (queryString.length !== 0) {
      path += `?${queryString}`
    }

    return path
  },

  url() {
    return `${this.host()}${this.path()}`
  },

  headers() {
    return lowerCaseObjectKeys(
      assign(
        {},
        this.methodDescriptor.headers,
        this.requestParams[this.methodDescriptor.headersAttr]
      )
    )
  },

  body() {
    return this.requestParams[this.methodDescriptor.bodyAttr]
  },

  /**
   * Enhances current request returning a new Request
   * @param {Object} extras
   *   @param {Object} extras.params - it will be merged with current params
   *   @param {Object} extras.headers - it will be merged with current headers
   *   @param {String|Object} extras.body - it will replace the current body
   */
  enhance(extras) {
    const headerKey = this.methodDescriptor.headersAttr
    const bodyKey = this.methodDescriptor.bodyAttr
    const requestParams = assign({}, this.requestParams, extras.params)
    requestParams[headerKey] = assign({}, this.requestParams[headerKey], extras.headers)
    requestParams[bodyKey] = extras.body

    return new Request(this.methodDescriptor, requestParams)
  }
}

export default Request
