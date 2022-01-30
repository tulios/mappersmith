export type Primitive = string | number | boolean

export interface Hash {
  [key: string]: Primitive
}

export interface Headers {
  readonly [key: string]: Primitive
}

interface Auth {
  readonly [key: string]: Primitive
}

export interface Params {
  readonly [key: string]: object | Primitive | undefined | null
}

export interface RequestParams {
  readonly auth?: Auth
  readonly body?: object | string
  readonly headers?: Headers
  readonly host?: string
  readonly params?: Params
  readonly timeout?: number
  [param: string]: object | Primitive | Primitive[] | undefined | null
}

export type ParameterEncoderFn = (arg: Primitive) => string
