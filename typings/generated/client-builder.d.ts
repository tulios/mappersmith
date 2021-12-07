import { Manifest, ManifestOptions, GlobalConfigs } from './manifest';
import { Request } from './request';
import type { Gateway, GatewayConfiguration } from './gateway/types';
interface GatewayConstructor {
    new (request: Request, gatewayConfigs: GatewayConfiguration): Gateway;
    readonly prototype: Gateway;
}
/**
 * @typedef ClientBuilder
 * @param {Object} manifestDefinition - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
export declare class ClientBuilder {
    Promise: PromiseConstructor;
    manifest: Manifest;
    GatewayClassFactory: () => GatewayConstructor;
    maxMiddlewareStackExecutionAllowed: number;
    constructor(manifestDefinition: ManifestOptions, GatewayClassFactory: () => GatewayConstructor, configs: GlobalConfigs);
    build(): {
        [clientName: string]: unknown;
    };
    private buildResource;
    private invokeMiddlewares;
}
export default ClientBuilder;
