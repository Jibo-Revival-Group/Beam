/// <reference types="node" />
/// <reference types="ws" />
import { EventEmitter } from "events";
import WebSocket = require('ws');
/**
 * HTTP WebSocket Client
 * @class HTTPWSClient
 * @extends EventEmitter
 * @param {String} host
 */
export default class HTTPWSClient extends EventEmitter {
    host: string;
    /**
     * The socket connection.
     * @name HTTPWSClient#socket
     * @type {WebSocket}
     */
    socket: WebSocket;
    private _isReconnecting;
    constructor(host: string);
    /**
     * Send data.
     * @method HTTPWSClient#send
     * @param {String|Object} json Either pre-serialzed or raw data object
     * @returns {Promise<boolean>} Whether the send succeeded
     */
    send(json: string | Object): Promise<boolean>;
    private _connect;
    /**
     * Called when there is an error to try reconnect
     */
    private _onStartReconnect;
    private _onError;
    private _onClose;
    private _onMessage;
    private _onOpen;
    private _sendMessage(payload, resolve);
}
