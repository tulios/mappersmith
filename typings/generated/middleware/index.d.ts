import { Request } from '../request';
import { Response } from '../response';
export interface Authorization {
    readonly password: string;
    readonly username: string;
}
export declare type Context = object;
export declare type RequestGetter = () => Promise<Request>;
export declare type ResponseGetter = () => Promise<Response>;
export declare type AbortFn = (error: Error) => void;
export declare type RenewFn = () => Promise<object>;
export interface MiddlewareDescriptor {
    __name?: string;
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
    readonly clientId: string | null;
    readonly context: Context;
    readonly resourceMethod: string;
    readonly resourceName: string;
    readonly mockRequest?: boolean;
}
export declare type Middleware = (params: MiddlewareParams) => MiddlewareDescriptor;
