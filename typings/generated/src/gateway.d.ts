import { Request } from './request';
import { Response } from './response';
import { GatewayConfiguration } from './gateway/types';
import { Primitive } from './types';
export declare type Method = 'get' | 'head' | 'post' | 'put' | 'patch' | 'delete';
export declare class Gateway {
    request: Request;
    configs: GatewayConfiguration;
    successCallback: (res: Response) => void;
    failCallback: (res: Response) => void;
    constructor(request: Request, configs: GatewayConfiguration);
    get(): void;
    head(): void;
    post(): void;
    put(): void;
    patch(): void;
    delete(): void;
    options(): GatewayConfiguration;
    shouldEmulateHTTP(): boolean;
    call(): Promise<any>;
    dispatchResponse(response: Response): void;
    dispatchClientError(message: string, error: Error): void;
    prepareBody(method: string, headers: Record<string, Primitive>): Primitive | null | undefined;
}
export default Gateway;
