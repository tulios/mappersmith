import { MethodDescriptor } from './method-descriptor';
import type { Primitive, RequestParams } from './types';
/**
 * @typedef Request
 * @param {MethodDescriptor} methodDescriptor
 * @param {RequestParams} requestParams, defaults to an empty object ({})
 */
export declare class Request {
    methodDescriptor: MethodDescriptor;
    requestParams: RequestParams;
    constructor(methodDescriptor: MethodDescriptor, requestParams?: RequestParams);
    private isParam;
    params(): RequestParams;
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
     * Example: '/some/path?param1=true'
     *
     * @throws {Error} if any dynamic segment is missing.
     * Example:
     *  Imagine the path '/some/{name}', the error will be similar to:
     *    '[Mappersmith] required parameter missing (name), "/some/{name}" cannot be resolved'
     */
    path(): string;
    /**
     * Returns the template path, without params, before interpolation.
     * If path is a function, returns the result of request.path()
     * Example: '/some/{param}/path'
     */
    pathTemplate(): string;
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
    headers(): import("./types").Hash;
    /**
     * Utility method to get a header value by name
     */
    header(name: string): Primitive;
    body(): object | Primitive | null | undefined;
    auth(): object | Primitive | null | undefined;
    timeout(): object | Primitive | null | undefined;
    /**
     * Enhances current request returning a new Request
     * @param {RequestParams} extras
     *   @param {Object} extras.auth - it will replace the current auth
     *   @param {String|Object} extras.body - it will replace the current body
     *   @param {Headers} extras.headers - it will be merged with current headers
     *   @param {String} extras.host - it will replace the current timeout
     *   @param {RequestParams} extras.params - it will be merged with current params
     *   @param {Number} extras.timeout - it will replace the current timeout
     */
    enhance(extras: RequestParams): Request;
    /**
     * Is the request expecting a binary response?
     */
    isBinary(): boolean;
}
export default Request;
