import { Request } from '../request';
import { RequestParams } from '../types';
interface RequestFactoryArgs extends RequestParams {
    method?: string;
    path?: string;
}
/**
 * Create a request to use in tests
 * @returns Request
 */
export declare const requestFactory: ({ method, host, path, auth, body, headers, params, timeout, ...rest }?: RequestFactoryArgs) => Request;
export {};
