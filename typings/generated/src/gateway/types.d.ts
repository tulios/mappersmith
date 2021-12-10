import { Response } from '../response';
export interface HTTPRequestParams {
    [key: string]: any;
}
export interface HTTPGatewayConfiguration {
    configure?: ((requestParams: HTTPRequestParams) => HTTPRequestParams) | null;
    onRequestWillStart?: ((requestParams: HTTPRequestParams) => void) | null;
    onRequestSocketAssigned?: ((requestParams: HTTPRequestParams) => void) | null;
    onSocketLookup?: ((requestParams: HTTPRequestParams) => void) | null;
    onSocketConnect?: ((requestParams: HTTPRequestParams) => void) | null;
    onSocketSecureConnect?: ((requestParams: HTTPRequestParams) => void) | null;
    onResponseReadable?: ((requestParams: HTTPRequestParams) => void) | null;
    onResponseEnd?: ((requestParams: HTTPRequestParams) => void) | null;
    useSocketConnectionTimeout?: boolean;
}
export interface Gateway {
    call(): Promise<Response>;
    dispatchClientError(message: string, error: Error): void;
    dispatchResponse(response: Response): void;
    extends(methods: {
        [fn: string]: Function;
    }): void;
    options(): object;
    prepareBody(method: string, headers: Headers): string;
    shouldEmulateHTTP(): boolean;
}
export interface NetworkGateway {
    delete?(): void;
    get(): void;
    head(): void;
    patch(): void;
    post(): void;
    put(): void;
}
export interface XhrGateway extends Gateway, NetworkGateway {
    readonly withCredentials: boolean;
    configure?: ((xmlHttpRequest: XMLHttpRequest) => void) | null;
    configureBinary(xmlHttpRequest: XMLHttpRequest): void;
    configureCallbacks(xmlHttpRequest: XMLHttpRequest): void;
    configureTimeout(xmlHttpRequest: XMLHttpRequest): void;
    createResponse(xmlHttpRequest: XMLHttpRequest): void;
    createXHR(): XMLHttpRequest;
    performRequest(method: string): void;
    setHeaders(xmlHttpRequest: XMLHttpRequest, headers: Headers): void;
}
export interface GatewayConfiguration {
    Fetch: object;
    HTTP: HTTPGatewayConfiguration;
    Mock?: object;
    XHR: Partial<XhrGateway>;
    enableHTTP408OnTimeouts?: boolean;
    emulateHTTP?: boolean;
}
