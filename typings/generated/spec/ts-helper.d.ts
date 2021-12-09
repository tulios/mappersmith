/**
 * Migrate stuff from helper.js into this file
 */
import { Middleware } from '../src/middleware';
import { GatewayConfiguration } from '../src/gateway/types';
export declare const getManifest: (middleware?: Middleware[], gatewayConfigs?: Partial<GatewayConfiguration> | undefined, clientId?: string | undefined) => {
    clientId: string | undefined;
    host: string;
    gatewayConfigs: Partial<GatewayConfiguration> | undefined;
    gateway: string;
    middleware: Middleware[];
    resources: {
        User: {
            all: {
                path: string;
            };
            byId: {
                path: string;
            };
        };
        Blog: {
            post: {
                method: string;
                path: string;
            };
            addComment: {
                method: string;
                path: string;
            };
        };
    };
};
export declare const getManifestWithResourceConf: (middleware?: never[], gatewayConfigs?: undefined, clientId?: undefined) => {
    clientId: undefined;
    host: string;
    bodyAttr: string;
    gatewayConfigs: undefined;
    middleware: never[];
    resources: {
        User: {
            all: {
                path: string;
            };
            byId: {
                path: string;
            };
        };
        Blog: {
            post: {
                method: string;
                path: string;
            };
            addComment: {
                method: string;
                path: string;
            };
        };
    };
};
