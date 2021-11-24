export interface Headers {
    readonly [header: string]: string;
}
export interface Authorization {
    readonly password: string;
    readonly username: string;
}
export interface Parameters {
    readonly auth?: Authorization;
    readonly timeout?: number;
    [param: string]: object | string | number | boolean | undefined;
}
export declare type Context = object;
export declare type RequestGetter = () => Promise<Request>;
export declare type ResponseGetter = () => Promise<Response>;
export declare type AbortFn = (error: Error) => void;
export declare type RenewFn = () => Promise<object>;
export interface MiddlewareDescriptor {
    /**
     * @deprecated: Please use prepareRequest instead
     */
    request?(request: Request): Promise<Request> | Request;
    /**
     * @since 2.27.0
     * Replaced the request method
     */
    prepareRequest?(next: RequestGetter, abort: AbortFn): Promise<Request | void>;
    response?(next: ResponseGetter, renew: RenewFn): Promise<Response | object>;
}
export interface MiddlewareParams {
    readonly clientId: string;
    readonly context: Context;
    readonly resourceMethod: string;
    readonly resourceName: string;
}
export declare type Middleware = (params: MiddlewareParams) => MiddlewareDescriptor;
interface MethodDescriptorParams {
    allowResourceHostOverride: boolean;
    authAttr: string;
    binary: boolean;
    bodyAttr: string;
    headers: Headers;
    headersAttr: string;
    host: string;
    hostAttr: string;
    method: string;
    middleware: Array<Middleware>;
    middlewares: Array<Middleware>;
    params: Parameters;
    path: string | ((args: Record<string, any>) => string);
    queryParamAlias: Record<string, string>;
    timeoutAttr: string;
}
/**
 * @typedef MethodDescriptor
 * @param {MethodDescriptorParams} params
 *   @param {boolean} params.allowResourceHostOverride
 *   @param {String} params.authAttr - auth attribute name. Default: 'auth'
 *   @param {boolean} params.binary
 *   @param {String} params.bodyAttr - body attribute name. Default: 'body'
 *   @param {Headers} params.headers
 *   @param {String} params.headersAttr - headers attribute name. Default: 'headers'
 *   @param {String} params.host
 *   @param {String} params.hostAttr - host attribute name. Default: 'host'
 *   @param {String} params.method
 *   @param {Middleware[]} params.middleware
 *   @param {Middleware[]} params.middlewares - alias for middleware
 *   @param {Parameters} params.params
 *   @param {String|Function} params.path
 *   @param {Object} params.queryParamAlias
 *   @param {Number} params.timeoutAttr - timeout attribute name. Default: 'timeout'
 */
export default class MethodDescriptor {
    allowResourceHostOverride: boolean;
    authAttr: string;
    binary: boolean;
    bodyAttr: string;
    headers: Headers;
    headersAttr: string;
    host: string;
    hostAttr: string;
    method: string;
    middleware: Middleware[];
    params: Parameters;
    path: string | ((args: Parameters) => string);
    queryParamAlias: Record<string, string>;
    timeoutAttr: string;
    constructor(params: MethodDescriptorParams);
}
export {};
