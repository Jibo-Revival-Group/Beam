/// <reference types="node" />
import { EventEmitter } from 'events';
export declare type ErrCallback = (err?: Error) => void;
export default class NotificationsDispatcher extends EventEmitter {
    static readonly instance: NotificationsDispatcher;
    private _notificationsSocket;
    private _statusSocket;
    private _lastStatus;
    init(callback: ErrCallback): void;
    private _processNotification;
    private _processStatus;
    private _setupSockets(url);
}
