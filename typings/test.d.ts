declare module 'mappersmith/test' {
  import { Client, Parameters, Request, Headers } from 'mappersmith'

  export interface MockAssert {
    calls(): Request[]
    callsCount(): number
    mostRecentCall(): Request | null
  }

  export type StatusHandler = (request: Request, mock: MockAssert) => void

  export type ResponseHandler = (request: Request, mock: MockAssert) => void

  export interface MockClient<ResourcesType> {
    resource(name: keyof ResourcesType): MockClient<ResourcesType>
    method(name: keyof ResourcesType[keyof ResourcesType]): MockClient<ResourcesType>
    with(args: Partial<Parameters>): MockClient<ResourcesType>
    status(responder: StatusHandler | number): MockClient<ResourcesType>
    response(responder: ResponseHandler | object | string): MockClient<ResourcesType>
    assertObject(): MockAssert
    assertObjectAsync(): Promise<MockAssert>
  }

  export function install(): void
  export function uninstall(): void
  export function mockClient<ResourcesType>(client: Client<ResourcesType>): MockClient<ResourcesType>

  export type MockRequestUrlFunction = (requestUrl: string, params: object) => string
  export type MockRequestBody = string | object
  export type MockRequestBodyFunction = (requestBody: MockRequestBody) => MockRequestBody
  export interface MockRequestArgs {
    method: string
    url: string | MockRequestUrlFunction
    body?: MockRequestBody | MockRequestBodyFunction
    response?: {
      status?: number
      body?: MockRequestBody
      headers?: Headers
    }
  }

  export function mockRequest(args: MockRequestArgs): MockAssert
}
