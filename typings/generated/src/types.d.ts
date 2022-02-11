export declare type Primitive = string | number | boolean;
export interface Hash {
    [key: string]: Primitive;
}
export interface Headers {
    readonly [key: string]: Primitive;
}
export interface Auth {
    username?: string;
    password?: string;
    readonly [key: string]: Primitive | undefined;
}
export interface Params {
    readonly [key: string]: object | Primitive | undefined | null;
}
export interface NestedParam {
    [param: string]: Primitive | undefined | null | NestedParam | NestedParamArray;
}
export interface NestedParamArray extends Array<Primitive | NestedParam | NestedParamArray> {
}
export interface RequestParams {
    readonly auth?: Auth;
    readonly body?: object | string;
    readonly headers?: Headers;
    readonly host?: string;
    readonly params?: Params;
    readonly timeout?: number;
    [param: string]: object | Primitive | undefined | null | NestedParam | NestedParamArray;
}
export declare type ParameterEncoderFn = (arg: Primitive) => string;
