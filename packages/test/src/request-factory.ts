import type { RequestContext, RequestParams } from '@mappersmith/core'
import { Request, MethodDescriptor } from '@mappersmith/core'

export interface RequestFactoryArgs extends RequestParams {
  method?: string
  path?: string
  context?: RequestContext
}

/**
 * Create a request to use in tests
 * @returns Request
 */
export const requestFactory = ({
  method = 'GET',
  host = 'http://example.org',
  path = '/path',
  auth,
  body,
  headers,
  params,
  timeout,
  context,
  ...rest
}: RequestFactoryArgs = {}) => {
  const methodDescriptor = new MethodDescriptor({ method, host, path })
  return new Request(
    methodDescriptor,
    {
      auth,
      body,
      headers,
      params,
      timeout,
      ...rest,
    },
    context
  )
}
