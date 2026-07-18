/// <reference types="node" />
import { EventEmitter } from 'events';
import ClientRemoteObject from './ClientRemoteObject';
export declare type CallbackHandler = (data: any) => void;
export declare type RejectionHandler = (err) => void;
export default class RemoteClient extends EventEmitter {
    private static _messageId;
    instances: Map<number, ClientRemoteObject>;
    protected _callbackHandlers: Map<number, CallbackHandler>;
    protected _rejectionHandlers: Map<number, RejectionHandler>;
    protected _stackTraces: Map<number, string>;
    private _isInitialized;
    private _client;
    private _messageMap;
    private port;
    private _messageQueue;
    private _messageQueueTask;
    constructor(token: string);
    init(port?: number): Promise<void>;
    sendMessage<T>(instanceId: number, methodName: string, args?: any[], sendAndForget?: boolean): Promise<T>;
    destroy(): void;
    /**
     * @param messageId The message handle
     * @returns Promise that resolves to the return value
     */
    private waitForReply<T>(messageId);
    private onMessage(messageBase);
    private processMessageQueue();
    private onEvent(message);
    private onRequest(message);
    private onReply(message);
    private onError(message);
    private getMessageId();
}
