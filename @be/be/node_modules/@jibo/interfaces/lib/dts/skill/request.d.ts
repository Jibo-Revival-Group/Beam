import { BaseMessage, BaseData } from '../service';
import { NLUResult } from '../nlu';
import { ASRResult } from '../asr';
import * as network from '../network';
import { SkillResponse } from './response';
export declare enum MessageType {
    LISTEN_LAUNCH = "LISTEN_LAUNCH",
    LISTEN_UPDATE = "LISTEN_UPDATE",
    PROACTIVE_LAUNCH = "PROACTIVE_LAUNCH",
}
export declare type SkillData<D> = BaseData & {
    result: D;
};
export interface LaunchData {
    memo?: {
        entry?: string;
    };
}
export interface ListenData {
    nlu: NLUResult;
    asr: ASRResult;
}
export declare type LaunchListenData = ListenData & LaunchData;
/** Valid skill request */
export declare type ListenLaunchRequest = BaseMessage<MessageType.LISTEN_LAUNCH, SkillData<LaunchListenData>>;
/** Valid skill request */
export declare type ListenUpdateRequest = BaseMessage<MessageType.LISTEN_UPDATE, SkillData<ListenData>>;
/** Valid skill request */
export declare type ProactiveLaunchRequest = BaseMessage<MessageType.PROACTIVE_LAUNCH, SkillData<LaunchData>>;
/** Union type of all valid requests */
export declare type SkillRequest = ListenLaunchRequest | ListenUpdateRequest | ProactiveLaunchRequest;
export declare enum SkillRequestError {
    SKILL_NOT_FOUND = "SKILL_NOT_FOUND",
    TIMEOUT = "TIMEOUT",
}
export interface SkillRequestOutput {
    skillID: string;
    response?: SkillResponse;
    error?: {
        code: SkillRequestError | network.ErrorCode;
        message: string;
    };
}
