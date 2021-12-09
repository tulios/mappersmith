import { Manifest, ManifestOptions, GlobalConfigs, ResourceTypeConstraint } from './manifest';
import { Response } from './response';
import { Request } from './request';
import type { Gateway, GatewayConfiguration } from './gateway/types';
import type { Params } from './types';
export declare type AsyncFunction = (params?: Params) => Promise<Response>;
export declare type AsyncFunctions<HashType> = {
    [Key in keyof HashType]: AsyncFunction;
};
export declare type Client<ResourcesType> = {
    [ResourceKey in keyof ResourcesType]: AsyncFunctions<ResourcesType[ResourceKey]>;
};
declare type ResourceConstraint = {
    [key: string]: AsyncFunction;
};
interface GatewayConstructor {
    new (request: Request, gatewayConfigs: GatewayConfiguration): Gateway;
    readonly prototype: Gateway;
}
/**
 * @typedef ClientBuilder
 * @param {Object} manifestDefinition - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
export declare class ClientBuilder<Resources extends ResourceTypeConstraint> {
    Promise: PromiseConstructor;
    manifest: Manifest<Resources>;
    GatewayClassFactory: () => GatewayConstructor;
    maxMiddlewareStackExecutionAllowed: number;
    constructor(manifestDefinition: ManifestOptions<Resources>, GatewayClassFactory: () => GatewayConstructor, configs: GlobalConfigs);
    build<T extends ResourceConstraint>(): Client<T>;
    private buildResource;
    private invokeMiddlewares;
}
export default ClientBuilder;
