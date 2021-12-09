import type { Headers, RequestParams, ParameterEncoderFn, Params } from './types';
import type { Middleware } from './middleware';
export interface MethodDescriptorParams {
    allowResourceHostOverride?: boolean;
    parameterEncoder?: ParameterEncoderFn;
    authAttr?: string;
    binary?: boolean;
    bodyAttr?: string;
    headers?: Headers;
    headersAttr?: string;
    host: string;
    hostAttr?: string;
    method?: string;
    middleware?: Array<Middleware>;
    middlewares?: Array<Middleware>;
    params?: Params;
    path: string | ((args: RequestParams) => string);
    queryParamAlias?: Record<string, string>;
    timeoutAttr?: string;
}
/**
 * @typedef MethodDescriptor
 * @param {MethodDescriptorParams} params
 *   @param {boolean} params.allowResourceHostOverride
 *   @param {Function} params.parameterEncoder
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
 *   @param {RequestParams} params.params
 *   @param {String|Function} params.path
 *   @param {Object} params.queryParamAlias
 *   @param {Number} params.timeoutAttr - timeout attribute name. Default: 'timeout'
 */
export declare class MethodDescriptor {
    readonly allowResourceHostOverride: boolean;
    readonly parameterEncoder: ParameterEncoderFn;
    readonly authAttr: string;
    readonly binary: boolean;
    readonly bodyAttr: string;
    readonly headers?: Headers;
    readonly headersAttr: string;
    readonly host: string;
    readonly hostAttr: string;
    readonly method: string;
    readonly middleware: Middleware[];
    readonly params?: RequestParams;
    readonly path: string | ((args: RequestParams) => string);
    readonly queryParamAlias: Record<string, string>;
    readonly timeoutAttr: string;
    constructor(params: MethodDescriptorParams);
}
export default MethodDescriptor;
