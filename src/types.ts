export type Primitive = string | number | boolean

export interface Headers {
  readonly [key: string]: Primitive
}

interface Auth {
  readonly [key: string]: Primitive
}

export interface Params {
  readonly [key: string]: Primitive
}

export interface RequestParams {
  readonly auth?: Auth
  readonly body?: object | string
  readonly headers?: Headers
  readonly host?: string
  readonly params?: Params
  readonly timeout?: number
  [param: string]: object | Primitive | undefined
}