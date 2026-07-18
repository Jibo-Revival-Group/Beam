import * as service from '../service';
import * as nlu from '../nlu';
import * as asr from '../asr';
import * as skill from '../skill';
import * as proactive from '../proactive';
import * as common from '../common';
import { ResponseType } from './MessageType';
import { HubErrorCode } from './HubErrorCode';
export import MessageType = ResponseType;
export { HubErrorCode };
export declare type Response<T extends ResponseType, D> = service.BaseResponse<T, D>;
export declare type SoSResponse = Response<MessageType.SOS, void>;
export declare type EoSResponse = Response<MessageType.EOS, void>;
export declare type ASRResponse = Response<MessageType.ASR, asr.ASRResult>;
export declare type NLUResponse = Response<MessageType.NLU, nlu.NLUResult>;
export interface ListenResponseData {
    asr: asr.ASRResult;
    nlu: nlu.NLUResult;
    match?: common.GlobalMatchResponseData;
}
export interface SkillRedirectData {
    match: common.GlobalMatchResponseData;
    memo?: any;
    asr?: asr.ASRResult;
    nlu?: nlu.NLUResult;
}
/**
 * A general state that the result of a listening turn represents.
 */
export declare enum ListenResultState {
    /**
     * No input was received - user did not say anything before we stopped listening.
     */
    noInput = "noInput",
    /**
     * User said something, but it didn't match anything that we were listening for.
     */
    noMatch = "noMatch",
    /**
     * User said something that matched what we were listening for. `nlu` can be expected to
     * exist and have valid data.
     */
    match = "match",
}
/**
 * Class for wrapping ListenResponseData for less access depth and safer usage within skill code.
 */
export declare class ListenResult {
    asr: asr.ASRResult;
    nlu: nlu.NLUResult;
    match?: common.GlobalMatchResponseData;
    /**
     * Safe shorthand for the main ASR result.
     */
    readonly text: string;
    /**
     * Safe shorthand for the main NLU result, if any.
     */
    readonly intent: string;
    /**
     * Safe shorthand for supplimentary NLU results, if any.
     */
    readonly entities: nlu.Entities;
    /**
     * Shorthand for what type of result this response represents.
     */
    readonly state: ListenResultState;
    constructor(asr: asr.ASRResult, nlu?: nlu.NLUResult, match?: common.GlobalMatchResponseData);
    toJSON(): ListenResponseData;
}
export interface HubErrorData {
    message: string;
    code?: HubErrorCode;
}
export declare type ListenResponse = Response<MessageType.LISTEN, ListenResponseData>;
export declare type SkillRedirectResponse = Response<MessageType.SKILL_REDIRECT, SkillRedirectData>;
export declare type SkillActionResponse = Response<MessageType.SKILL_ACTION, skill.response.SkillActionData>;
export declare type ErrorResponse = Response<MessageType.ERROR, HubErrorData>;
export declare type HubResponse = SoSResponse | EoSResponse | ASRResponse | NLUResponse | ListenResponse | SkillRedirectResponse | proactive.ProactiveResponse | ErrorResponse | skill.response.SkillResponse;
