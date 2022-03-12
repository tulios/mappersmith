import { Request } from '../request'
import { RequestParams } from '../types'
import { MethodDescriptor } from '../method-descriptor'

export interface RequestFactoryArgs extends RequestParams {
  method?: string
  path?: string
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
  ...rest
}: RequestFactoryArgs = {}) => {
  const methodDescriptor = new MethodDescriptor({ method, host, path })
  return new Request(methodDescriptor, {
    auth,
    body,
    headers,
    params,
    timeout,
    ...rest,
  })
}
