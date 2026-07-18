/// <reference types="ws" />
/// <reference types="node" />
import HTTPWSService, { WebSocketWithUrl } from './HTTPWSService';
import { ServiceOptions } from './index';
import Router = require("router");
import WebSocket = require('ws');
import http = require('http');
declare class HTTPSWSServiceDebug extends HTTPWSService {
    constructor(options: ServiceOptions, rootDir: string);
    protected onMessage(command: any, client: WebSocketWithUrl): void;
    protected onClose(client: WebSocket): void;
    onConnection(client: WebSocketWithUrl, request: http.IncomingMessage): void;
    routes(url: Router): void;
}
export default HTTPSWSServiceDebug;
