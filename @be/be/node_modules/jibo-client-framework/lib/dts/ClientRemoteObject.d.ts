/// <reference types="node" />
import RemoteClient from './RemoteClient';
import { EventEmitter } from 'events';
declare class ClientRemoteObject extends EventEmitter {
    protected client: RemoteClient;
    protected options: {
        instanceId: number;
    };
    protected instanceId: number;
    constructor(client: RemoteClient, options: {
        instanceId: number;
    });
    sendMessage<T>(methodName: string, args?: any[], sendAndForget?: boolean): Promise<T>;
    destroy(): void;
}
export default ClientRemoteObject;
