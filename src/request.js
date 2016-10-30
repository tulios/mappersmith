import { toQueryString, lowerCaseObjectKeys } from 'src/utils'

const REGEXP_DYNAMIC_SEGMENT = new RegExp('\{([^\}]+)\}')

export default class Request {
  constructor(methodDescriptor, requestParams, requestOpts) {
    this.methodDescriptor = methodDescriptor
    this.requestParams = requestParams || {}
    this.requestOpts = requestOpts || {}
  }

  params() {
    return Object.assign(
      {},
      this.methodDescriptor.params,
      this.requestParams
    )
  }

  host() {
    const configuredHost = (this.methodDescriptor.host || '').replace(/\/$/, '')
    return configuredHost || '/'
  }

  path() {
    let path = this.methodDescriptor.path
    const { headersAttr, bodyAttr } = this.methodDescriptor

    if (this.methodDescriptor.path[0] !== '/') {
      path = `/${this.methodDescriptor.path}`
    }

    const params = this.params()

    // doesn't include body and headers in the URL
    delete params[headersAttr]
    delete params[bodyAttr]

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
  }

  processor() {
    return this.methodDescriptor.processor
  }

  headers() {
    return lowerCaseObjectKeys(
      Object.assign(
        {},
        this.methodDescriptor.headers,
        this.requestParams[this.methodDescriptor.headersAttr]
      )
    )
  }
}
