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

export interface NestedParam {
  // We need the NestedParamArray here for circularity
  // eslint-disable-next-line no-use-before-define
  [param: string]: Primitive | undefined | null | NestedParam | NestedParamArray
}

// Eslint will try to fix this to a type, but we need it as an interface for the recursability
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NestedParamArray extends Array<Primitive | NestedParam | NestedParamArray> {}

export interface RequestParams {
  readonly auth?: Auth
  readonly body?: object | string
  readonly headers?: Headers
  readonly host?: string
  readonly params?: Params
  readonly timeout?: number
  [param: string]: object | Primitive | undefined | null | NestedParam | NestedParamArray
}

export type ParameterEncoderFn = (arg: Primitive) => string
