/// <reference types="node" />
import * as http from 'http';
export { default as HTTPService } from './HTTPService';
export { default as HTTPServiceDebug } from './HTTPServiceDebug';
export { default as HTTPWSService } from './HTTPWSService';
export { default as HTTPWSServiceDebug } from './HTTPWSServiceDebug';
export * from 'jibo-client-framework';
export { default as RemoteService, RejectionHandler } from './RemoteService';
export { ServiceErrors, ServiceError, ErrorStatus, ErrorType, ErrorValue } from './DataTypes';
export { default as ServiceRemoteObject } from './ServiceRemoteObject';
export { WebSocketWithUrl as WebSocket } from './HTTPWSService';
export declare type HandlerFunction = (req: http.IncomingMessage, res: JiboServerResponse, next: Function) => void;
export interface JiboServerRequest extends http.ServerRequest {
    params: any;
    query: any;
    body: any;
}
export interface JiboServerResponse extends http.ServerResponse {
}
export interface RegistrationRecord {
    name: string;
    host: string;
    port: number;
    path: string;
    ttl?: number;
    tls?: string;
}
export interface ServiceOptions {
    port: number;
    register?: boolean;
}
