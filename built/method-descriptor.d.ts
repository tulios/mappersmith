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
    readonly resourceName: string;
    readonly resourceMethod: string;
    readonly clientId: string;
    readonly context: Context;
}
export declare type Middleware = (params: MiddlewareParams) => MiddlewareDescriptor;
/**
 * @typedef MethodDescriptor
 * @param {Object} obj
 *   @param {String} obj.host
 *   @param {boolean} obj.allowResourceHostOverride
 *   @param {String|Function} obj.path
 *   @param {String} obj.method
 *   @param {Object} obj.headers
 *   @param {Object} obj.params
 *   @param {Object} obj.queryParamAlias
 *   @param {String} obj.bodyAttr - body attribute name. Default: 'body'
 *   @param {String} obj.headersAttr - headers attribute name. Default: 'headers'
 *   @param {String} obj.authAttr - auth attribute name. Default: 'auth'
 *   @param {Number} obj.timeoutAttr - timeout attribute name. Default: 'timeout'
 *   @param {String} obj.hostAttr - host attribute name. Default: 'host'
 */
interface Args {
    host: string;
    allowResourceHostOverride: boolean;
    method: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    queryParamAlias: Record<string, string>;
    binary: boolean;
    bodyAttr: string;
    headersAttr: string;
    authAttr: string;
    timeoutAttr: string;
    hostAttr: string;
    path: string | ((args: Record<string, any>) => string);
    middleware: Array<Middleware>;
    middlewares: Array<Middleware>;
}
export default class MethodDescriptor {
    host: string;
    allowResourceHostOverride: boolean;
    binary: boolean;
    method: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    queryParamAlias: Record<string, string>;
    bodyAttr: string;
    headersAttr: string;
    authAttr: string;
    timeoutAttr: string;
    hostAttr: string;
    path: string | ((args: Record<string, any>) => string);
    middleware: Array<Middleware>;
    constructor(obj: Args);
}
export {};
