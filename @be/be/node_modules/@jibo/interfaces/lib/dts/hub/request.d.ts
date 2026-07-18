import { BaseMessage, BaseData } from '../service';
import { ExternalAgentRequest, NLUResult } from '../nlu';
import { ASRConfig } from '../asr';
import { LanguageData } from '../language';
import { RequestType } from './MessageType';
export import MessageType = RequestType;
export declare enum ListenMessageMode {
    CLIENT_ASR = "CLIENT_ASR",
    CLIENT_NLU = "CLIENT_NLU",
}
export declare type ListenMessageData = LanguageData & {
    /** Whether this listen was started by hotphrase "Hey Jibo" */
    hotphrase: boolean;
    /** The NLU rules to use for the default agent */
    rules: string[];
    /** Special modes where the client provides either ASR or NLU in separate message */
    mode?: ListenMessageMode;
    /** The configuration of ASR. If `FAKE` then a `FakeASRMessage` will be expected */
    asr?: ASRConfig;
    /** DialogFlow agents to use in addition to the default */
    agents?: {
        [name: string]: ExternalAgentRequest;
    };
};
export interface ClientASRData {
    text: string;
}
export declare type ContextData = BaseData;
export interface CommandDataInput {
    command: string;
    result: any;
}
export declare type CommandData = LanguageData & BaseData & {
    input: CommandDataInput;
};
export declare type ListenMessage = BaseMessage<MessageType.LISTEN, ListenMessageData>;
export declare type ContextMessage = BaseMessage<MessageType.CONTEXT, ContextData>;
export declare type ClientASRMessage = BaseMessage<MessageType.CLIENT_ASR, ClientASRData>;
export declare type ClientNLUMessage = BaseMessage<MessageType.CLIENT_NLU, NLUResult>;
export declare type CommandMessage = BaseMessage<MessageType.CMD_RESULT, CommandData>;
