/// <reference types="ws" />
/// <reference types="node" />
import HTTPService from './HTTPService';
import { ServiceOptions } from './index';
import http = require('http');
import WebSocket = require('ws');
export declare type WebSocketWithUrl = WebSocket & {
    url: string;
};
declare abstract class HTTPWSService extends HTTPService {
    wsServer: WebSocket.Server;
    connections: Array<WebSocket>;
    constructor(name: string, options: ServiceOptions, staticDir: string);
    init(callback: (err?) => void): void;
    onConnection(client: WebSocketWithUrl, request: http.IncomingMessage): void;
    protected onClose(client: WebSocket): void;
    protected abstract onMessage(command: any, client: WebSocketWithUrl): void;
    sendWsJson(client: WebSocket, json: Object | string): Promise<boolean>;
    /**
     * Broadcast a message to all connected WebSocket clients
     * @method HTTPWSService#broadcast
     * @param {any} message JSON message to broadcast
     */
    broadcast(message: any): void;
    private closeClient(client);
}
export default HTTPWSService;
