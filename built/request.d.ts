import MethodDescriptor from './method-descriptor';
export interface Headers {
    readonly [header: string]: string;
}
export interface Authorization {
    readonly username: string;
    readonly password: string;
}
export interface Parameters {
    readonly auth?: Authorization;
    readonly timeout?: number;
    [param: string]: object | string | number | boolean | undefined;
}
export interface RequestParams {
    readonly params?: Parameters;
    readonly headers?: Headers;
    readonly body?: Record<string, string> | string;
    readonly auth?: Record<string, string>;
    readonly timeout?: number;
    readonly host?: string;
    [param: string]: object | string | number | boolean | undefined;
}
/**
 * @typedef Request
 * @param {MethodDescriptor} methodDescriptor
 * @param {RequestParams} requestParams, defaults to an empty object ({})
 */
export declare class Request {
    methodDescriptor: MethodDescriptor;
    requestParams: RequestParams;
    constructor(methodDescriptor: MethodDescriptor, requestParams?: RequestParams);
    params(): Record<string, string>;
    /**
     * Returns the HTTP method in lowercase
     */
    method(): string;
    /**
     * Returns host name without trailing slash
     * Example: 'http://example.org'
     */
    host(): string;
    /**
     * Returns path with parameters and leading slash.
     * Example: /some/path?param1=true
     *
     * @throws {Error} if any dynamic segment is missing.
     * Example:
     * Imagine the path '/some/{name}', the error will be similar to:
     * '[Mappersmith] required parameter missing (name), "/some/{name}" cannot be resolved'
     */
    path(): string;
    /**
     * Returns the template path, without params, before interpolation.
     * If path is a function, returns the result of request.path()
     * Example: '/some/{param}/path'
     */
    pathTemplate(): string | ((args: Record<string, any>) => string);
    /**
     * Returns the full URL
     * Example: http://example.org/some/path?param1=true
     *
     */
    url(): string;
    /**
     * Returns an object with the headers. Header names are converted to
     * lowercase
     */
    headers(): Record<string, unknown>;
    /**
     * Utility method to get a header value by name
     */
    header(name: string): unknown;
    body(): string | number | boolean | object | undefined;
    auth(): string | number | boolean | object | undefined;
    timeout(): string | number | boolean | object | undefined;
    /**
     * Enhances current request returning a new Request
     * @param {Object} extras
     *   @param {Object} extras.params - it will be merged with current params
     *   @param {Object} extras.headers - it will be merged with current headers
     *   @param {String|Object} extras.body - it will replace the current body
     *   @param {Object} extras.auth - it will replace the current auth
     *   @param {Number} extras.timeout - it will replace the current timeout
     *   @param {String} extras.host - it will replace the current timeout
     */
    enhance(extras: RequestParams): Request;
    /**
     * Is the request expecting a binary response?
     */
    isBinary(): boolean;
}
export default Request;
