import { BaseMessage, BaseResponse } from '../service';
import * as common from '../common';
import { RequestType, ResponseType } from '../hub/MessageType';
import { ContextMessage } from '../hub/request';
import { ContextRule } from './context';
import { SettingsRule } from './settings';
import { IHRule, IHQueryDefinitions } from './history';
export declare enum TriggerSource {
    NEW_ARRIVAL = "NEW_ARRIVAL",
    SURPRISE = "SURPRISE",
}
export interface RequestBaseData<T extends TriggerSource, D> {
    triggerSource: T;
    triggerData: D;
}
export declare type NewArrivalRequestData = RequestBaseData<TriggerSource.NEW_ARRIVAL, {
    /** Looper ID of person who just arrived */
    looperID?: string;
}>;
export declare type SurpriseRequestData = RequestBaseData<TriggerSource.SURPRISE, {
    /** Looper ID of the person who requested the skill previous to surprise */
    looperID?: string;
}>;
export declare type ProactiveRequestData = NewArrivalRequestData | SurpriseRequestData;
export interface ProactiveResponseData {
    match?: common.GlobalMatchResponseData;
}
/** Actual Proactivity requests for endpoint `/Proactivity` */
export declare type ProactiveTriggerRequest = BaseMessage<RequestType.TRIGGER, ProactiveRequestData>;
/** Actual Proactivity requests for endpoint `/Proactivity` */
export declare type ProactiveRequest = ProactiveTriggerRequest | ContextMessage;
/** Actual Proactivity responses for endpoint `/Proactivity` */
export declare type ProactiveResponse = BaseResponse<ResponseType.PROACTIVE, ProactiveResponseData>;
export interface ProactiveRegistration {
    memo?: any;
    /**
     * Topical tags - array of strings (or perhaps of enum values)
     */
    topics: string[];
    /**
     * Filters on the context
     */
    contextRules: ContextRule[];
    /**
     * Rnteraction history constraints:
     * a set of rules with IH query and condition.
     * Each IH constraint rule is an IH query (itself a set of rules) and a condition
     */
    IHRules?: IHRule[];
    /**
     * Filters on Settings
     */
    settingsRules?: SettingsRule[];
}
export interface EligibleProactiveRegistration extends ProactiveRegistration {
    skillID: string;
    personIDs: string[];
}
export interface ProactiveSkillConfig {
    skillID: string;
    proactives: ProactiveRegistration[];
    IHQueries?: IHQueryDefinitions;
}
