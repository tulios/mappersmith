declare module 'mappersmith/test' {
  import { Client, Parameters, Request, Headers } from 'mappersmith'

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
    with(args: Partial<Parameters>): this
    status(responder: StatusHandler | number): this
    headers(responseHeaders: Headers): this
    response(responder: ResponseHandler | object | string): this
    assertObject(): MockAssert
    assertObjectAsync(): Promise<MockAssert>
  }

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
  export type MockRequestHeadersFunction = (
    requestHeaders: MockRequestHeaders
  ) => MockRequestHeaders

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

  export const m: TestMatchFunctions
}
