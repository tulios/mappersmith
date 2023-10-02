// Bad idea to import from node-fetch as it we would need this as a dependency since i
// will get exported in the types file. We might fool TS here, but not the final bundle.
import type { RequestInit, Response as FetchResponse } from 'node-fetch'
import type fetch from 'node-fetch'

/**
 * Hello from NODE
 */
export type Fetch = typeof fetch

export { RequestInit, FetchResponse }
export type Method = 'get' | 'head' | 'post' | 'put' | 'patch' | 'delete'

export interface HTTPRequestParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface HTTPGatewayConfiguration {
  configure?: ((requestParams: HTTPRequestParams) => HTTPRequestParams) | null
  onRequestWillStart?: ((requestParams: HTTPRequestParams) => void) | null
  onRequestSocketAssigned?: ((requestParams: HTTPRequestParams) => void) | null
  onSocketLookup?: ((requestParams: HTTPRequestParams) => void) | null
  onSocketConnect?: ((requestParams: HTTPRequestParams) => void) | null
  onSocketSecureConnect?: ((requestParams: HTTPRequestParams) => void) | null
  onResponseReadable?: ((requestParams: HTTPRequestParams) => void) | null
  onResponseEnd?: ((requestParams: HTTPRequestParams) => void) | null
  useSocketConnectionTimeout?: boolean
}

interface XHRGatewayConfiguration {
  withCredentials?: boolean
  configure?: ((xmlHttpRequest: XMLHttpRequest) => void) | null
}

type FetchGatewayConfiguration = Partial<RequestInit>

export interface GatewayConfiguration {
  Fetch: FetchGatewayConfiguration
  HTTP: HTTPGatewayConfiguration
  Mock?: Record<string, unknown>
  XHR: XHRGatewayConfiguration
  enableHTTP408OnTimeouts: boolean
  emulateHTTP: boolean
}
