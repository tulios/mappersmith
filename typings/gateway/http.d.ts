/// <reference types="node" />
import * as http from 'http';
import { Gateway, Method } from '../gateway';
import type { HTTPGatewayConfiguration, HTTPRequestParams } from './types';
import Response from '../response';
declare type Chunk = any;
export declare class HTTP extends Gateway {
    private canceled;
    get(): void;
    head(): void;
    post(): void;
    put(): void;
    patch(): void;
    delete(): void;
    performRequest(method: Method): void;
    onResponse(httpResponse: http.IncomingMessage, httpOptions: Partial<HTTPGatewayConfiguration>, requestParams: HTTPRequestParams): void;
    onError(e: Error): void;
    createResponse(httpResponse: http.IncomingMessage, rawData: Chunk): Response<import("../response").ParsedJSON>;
}
export default HTTP;
