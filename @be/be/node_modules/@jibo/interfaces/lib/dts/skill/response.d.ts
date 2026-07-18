import { BaseResponse } from '../service';
import { data } from '../jibo';
import * as action from './action';
import * as analytics from './analytics';
import * as nlu from '../nlu';
import * as asr from '../asr';
export declare enum ResponseType {
    SKILL_ACTION = "SKILL_ACTION",
    SKILL_REDIRECT = "SKILL_REDIRECT",
    ERROR = "ERROR",
}
export interface ActionData {
    action: action.Action;
    analytics?: analytics.AnalyticsData;
    final?: boolean;
    fireAndForget?: boolean;
}
export interface ErrorData {
    message: string;
}
export interface RedirectData {
    skillID: string;
    memo?: any;
    asr?: asr.ASRResult;
    nlu?: nlu.NLUResult;
}
export interface SkillContext {
    skill: data.SkillData;
}
export declare type SkillActionData = ActionData & SkillContext;
export declare type SkillRedirectData = RedirectData & SkillContext;
export declare type SkillErrorData = ErrorData & SkillContext;
export declare type SkillResponseData = SkillErrorData | SkillActionData;
export declare type BaseSkillResponse<T extends ResponseType, D> = BaseResponse<T, D>;
/** Valid skill response */
export declare type ActionResponse = BaseSkillResponse<ResponseType.SKILL_ACTION, SkillActionData>;
/** Valid skill response */
export declare type RedirectResponse = BaseSkillResponse<ResponseType.SKILL_REDIRECT, SkillRedirectData>;
/** Valid skill response */
export declare type ErrorResponse = BaseSkillResponse<ResponseType.ERROR, SkillErrorData>;
/** Union type of all skill responses */
export declare type SkillResponse = ActionResponse | RedirectResponse | ErrorResponse;
