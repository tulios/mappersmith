import { Response } from '../response';
import type { Headers } from '../types';
interface ResponseFactoryArgs {
    method?: string;
    host?: string;
    path?: string;
    status?: number;
    data?: string | Record<string, unknown>;
    headers?: Headers;
    errors?: Array<Error | string>;
}
/**
 * Create a response to use in tests
 * @returns Response
 */
export declare const responseFactory: ({ method, host, path, status, data, headers, errors, }?: ResponseFactoryArgs) => Response<import("../response").ParsedJSON>;
export {};
