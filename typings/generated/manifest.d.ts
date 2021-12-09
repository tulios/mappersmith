import { MethodDescriptor, MethodDescriptorParams } from './method-descriptor';
import type { GatewayConfiguration, ParameterEncoderFn } from './types';
import { Context, Middleware, MiddlewareDescriptor, MiddlewareParams } from './middleware';
interface GlobalConfigs {
    gatewayConfigs?: GatewayConfiguration;
    middleware?: Middleware[];
    context?: Context;
}
interface Resources {
    [resourceName: string]: {
        [methodName: string]: Omit<MethodDescriptorParams, 'host'> & {
            host?: string;
        };
    };
}
interface ManifestOptions {
    host: string;
    allowResourceHostOverride?: boolean;
    parameterEncoder?: ParameterEncoderFn;
    bodyAttr?: string;
    headersAttr?: string;
    authAttr?: string;
    timeoutAttr?: string;
    hostAttr?: string;
    clientId?: string;
    gatewayConfigs?: GatewayConfiguration;
    resources?: Resources;
    middleware?: Middleware[];
    /**
     * @deprecated - use `middleware` instead
     */
    middlewares?: Middleware[];
    ignoreGlobalMiddleware?: boolean;
}
declare type Method = {
    name: string;
    descriptor: MethodDescriptor;
};
declare type EachResourceCallbackFn = (name: string, methods: Method[]) => string;
declare type CreateMiddlewareParams = Partial<Omit<MiddlewareParams, 'resourceName' | 'resourceMethod'>> & Pick<MiddlewareParams, 'resourceName' | 'resourceMethod'>;
/**
 * @typedef Manifest
 * @param {Object} obj
 *   @param {Object} obj.gatewayConfigs - default: base values from mappersmith
 *   @param {Object} obj.ignoreGlobalMiddleware - default: false
 *   @param {Object} obj.resources - default: {}
 *   @param {Array}  obj.middleware or obj.middlewares - default: []
 * @param {Object} globalConfigs
 */
export declare class Manifest {
    host: string;
    allowResourceHostOverride: boolean;
    parameterEncoder: ParameterEncoderFn;
    bodyAttr?: string;
    headersAttr?: string;
    authAttr?: string;
    timeoutAttr?: string;
    hostAttr?: string;
    clientId: string | null;
    gatewayConfigs: GatewayConfiguration;
    resources: Resources;
    context: Context;
    middleware: Middleware[];
    constructor(options: ManifestOptions, { gatewayConfigs, middleware, context }: GlobalConfigs);
    eachResource(callback: EachResourceCallbackFn): void;
    private eachMethod;
    createMethodDescriptor(resourceName: string, methodName: string): MethodDescriptor;
    /**
     * @param {Object} args
     *   @param {String|Null} args.clientId
     *   @param {String} args.resourceName
     *   @param {String} args.resourceMethod
     *   @param {Object} args.context
     *   @param {Boolean} args.mockRequest
     *
     * @return {Array<Object>}
     */
    createMiddleware(args: CreateMiddlewareParams): MiddlewareDescriptor[];
}
export default Manifest;
