/// <reference types="ws" />
import WebSocket = require('ws');
import { CacheManager } from 'jibo-cai-utils';
import ServiceRemoteObject from './ServiceRemoteObject';
import HTTPWSService from './HTTPWSService';
import { ServiceOptions } from './index';
export declare type CallbackHandler = (data: any) => void;
export declare type RejectionHandler = (err) => void;
export declare class RemoteObjectCache extends CacheManager<ServiceRemoteObject, number, WebSocket> {
}
declare abstract class RemoteService extends HTTPWSService {
    /** Maps a callback handle to a callback */
    callbackHandlers: Map<number, CallbackHandler>;
    rejectionHandlers: Map<number, RejectionHandler>;
    cache: RemoteObjectCache;
    protected lazyInitCheck: RejectionHandler;
    /** Maps incoming message type to a specific message type handler */
    private _messageMap;
    /**
     * @param  {string}         name      Name of the service in the registry
     * @param  {ServiceOptions} options
     * @param  {string}         staticDir Path to a static wenpage directory
     */
    constructor(name: string, options: ServiceOptions, staticDir: string);
    /**
     * When a client requests a remote instance be created the server
     * wants to associate that instance with the owner for cleanup
     * purposes. Called from the constructor of ServiceRemoteObject if
     * it's instantiated with an owner.
     * @param  {WebSocket}           owner    The client that owns the instance.
     * @param  {ServiceRemoteObject} instance The remote object instance
     */
    addInstance(owner: WebSocket, instance: ServiceRemoteObject): void;
    /**
     * When a websocket disconnects destory all instances that are associated
     * with this connection.
     * @param {WebSocket} client The client that disconnected.
     */
    protected onClose(client: WebSocket): void;
    /**
     * Called when a websocket message is received
     * @param  {any}       command [description]
     * @param  {WebSocket} ws      [description]
     */
    protected onMessage(command: any, ws: WebSocket): void;
    /**
     * Called when the client sends a message reply. Finds the appropriate
     * callback handle and calls it with the results/
     * @param  {WebSocket} ws      Client that responded
     * @param  {Reply}     message The results
     */
    private onReply(ws, message);
    /**
     * Called when the client sends an error. This happens when a remote
     * call threw an error or had an unhandled promise rejection.
     * @param  {WebSocket}      ws      Client that responded
     * @param  {MessageError}       message The results
     */
    private onError(ws, message);
    /**
     * Called when the client makes an RPC request on an instance
     * @param  {WebSocket} ws      The client making the request
     * @param  {Request}   message Contains the instance id, method and args
     */
    private onRequest(ws, message);
    private doOnRequest(ws, message);
}
export default RemoteService;
