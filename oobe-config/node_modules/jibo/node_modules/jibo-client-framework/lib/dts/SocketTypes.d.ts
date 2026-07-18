export interface MessageBase {
    type: 'reply' | 'instantiate' | 'request' | 'event' | 'error';
}
export interface Request extends MessageBase {
    messageId: number;
    instanceId: number;
    methodName: string;
    args: any[];
    sendAndForget: boolean;
}
export interface Reply extends MessageBase {
    messageId: number;
    value: any;
}
export interface EventMessage extends MessageBase {
    instanceId: number;
    methodName: string;
    args: any[];
}
export interface MessageError extends MessageBase {
    message: string;
    messageId: number;
}
