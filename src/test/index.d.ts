import { Client } from '../client-builder'
import { Request } from '../request'
import { Headers, Params } from '../types'
import { Response, ParsedJSON } from '../response'

export interface MockAssert {
  calls(): Request[]
  callsCount(): number
  mostRecentCall(): Request | null
}

export type StatusHandler = (request: Request, mock: MockAssert) => void

export type ResponseHandler = (request: Request, mock: MockAssert) => void

export interface MockClient<ResourcesType, ResourceName extends keyof ResourcesType> {
  resource<ResourceName extends keyof ResourcesType>(
    name: ResourceName
  ): MockClient<ResourcesType, ResourceName>
  method(name: keyof ResourcesType[ResourceName]): this
  with(args: Partial<Params>): this
  status(responder: StatusHandler | number): this
  headers(responseHeaders: Headers): this
  response(responder: ResponseHandler | object | string): this
  assertObject(): MockAssert
  assertObjectAsync(): Promise<MockAssert>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lookupResponseAsync(req: any): Promise<any>
export function clear(): void
export function install(): void
export function uninstall(): void
export function mockClient<
  ResourcesType,
  ResourceName extends keyof ResourcesType = keyof ResourcesType
>(client: Client<ResourcesType>): MockClient<ResourcesType, ResourceName>

export type MockRequestUrlFunction = (requestUrl: string, params: object) => string
export type MockRequestBody = string | object
export type MockRequestBodyFunction = (requestBody: MockRequestBody) => MockRequestBody
export type MockRequestHeaders = Headers
export type MockRequestHeadersFunction = (requestHeaders: MockRequestHeaders) => MockRequestHeaders

export type TestMatchPredicate = (value: string) => boolean

export interface TestMatchFunctions {
  stringMatching(value: RegExp): TestMatchPredicate
  stringContaining(value: string): TestMatchPredicate
  uuid4(): TestMatchPredicate
  anything(): TestMatchPredicate
}

export interface MockRequestArgs {
  method: string
  url: string | MockRequestUrlFunction | TestMatchPredicate
  body?: MockRequestBody | MockRequestBodyFunction
  headers?: MockRequestHeaders | MockRequestHeadersFunction
  response?: {
    status?: number
    body?: MockRequestBody
    headers?: Headers
  }
}

export function mockRequest(args: MockRequestArgs): MockAssert

export interface ResponseFactoryArgs<T> {
  method?: string
  host?: string
  path?: string
  status?: number
  data?: T | string
  headers?: Record<string, string | number | boolean>
  errors?: Array<Error | string>
}
export function responseFactory<T extends ParsedJSON>(args?: ResponseFactoryArgs<T>): Response<T>

type Primitive = string | number | boolean

interface Auth {
  readonly [key: string]: Primitive
}

export interface RequestFactoryArgs {
  // MethodDescriptorParams
  method?: string
  host?: string
  path?: string
  // RequestParams
  auth?: Auth
  body?: object | string
  headers?: Headers
  params?: Params
  timeout?: number
  [param: string]: object | Primitive | undefined | null
}
export function requestFactory(args?: RequestFactoryArgs): Request

export const m: TestMatchFunctions
