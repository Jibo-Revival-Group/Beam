/// <reference types="ws" />
import RemoteService from './RemoteService';
import WebSocket = require('ws');
export declare type CallbackHandler = (data: any) => void;
export interface Options {
    instanceId?: number;
    base: RemoteService;
    owner?: WebSocket;
}
declare abstract class ServiceRemoteObject {
    static singeltonId: number;
    private static _messageId;
    private static GLOBAL_COUNTER;
    base: RemoteService;
    owner: WebSocket;
    name: string;
    callee: WebSocket;
    protected _callbackHandlers: Map<number, CallbackHandler>;
    isDestroyed: boolean;
    private _instanceId;
    constructor(options: Options);
    readonly instanceId: number;
    /**
     * Emits an event to the client object
     * @param  {string}        event   Event name
     * @param  {any[]}         ...args
     * @return {Promise<void>}
     */
    emit(event: string, ...args: any[]): void;
    /**
     * Send a message to the client version of this object. Returns the result
     * of the RPC.
     * @param {string} methodName
     * @param {any[]} args
     */
    sendMessage<T>(methodName: string, args: any[], sendAndForget?: boolean): Promise<T>;
    /**
     * Called when client that owns this object disconnects
     */
    abstract destroy(): any;
    /**
     * Removes this remote object from the remote service cache
     */
    protected remove(): void;
    /**
     * When called with a specific messageId, this function will return
     * a Promise that resolves when a
     * @param messageId The message handle
     * @returns Promise that resolves to the return value
     */
    private waitForReply<T>(messageId);
    private getMessageId();
    private _sendMessage(ws, eventMessage);
}
export default ServiceRemoteObject;
