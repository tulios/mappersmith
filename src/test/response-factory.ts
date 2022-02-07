import { Response } from '../response'
import { requestFactory } from './request-factory'
import type { Headers } from '../types'

interface ResponseFactoryArgs {
  method?: string
  host?: string
  path?: string
  status?: number
  data?: string | Record<string, unknown>
  headers?: Headers
  errors?: Array<Error | string>
}

/**
 * Create a response to use in tests
 * @returns Response
 */
export const responseFactory = ({
  method = 'GET',
  host = 'http://example.org',
  path = '/path',
  status = 200,
  data = {},
  headers = {},
  errors = [],
}: ResponseFactoryArgs = {}) => {
  const request = requestFactory({ method, host, path })

  let responseData
  let contentType
  if (typeof data === 'string') {
    contentType = 'text/plain'
    responseData = data
  } else {
    contentType = 'application/json'
    responseData = JSON.stringify(data)
  }

  return new Response(
    request,
    status,
    responseData,
    { 'content-type': contentType, ...headers },
    errors
  )
}
