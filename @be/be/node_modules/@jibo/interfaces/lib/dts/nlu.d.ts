import { BaseMessage, BaseResponse } from './service';
export declare type IntentName = string;
export declare type EntityName = string;
export declare type EntityValue = number | number[] | boolean | boolean[] | string | string[] | EntityObject;
export interface EntityObject {
    [key: string]: EntityValue;
}
export interface Entities {
    [key: string]: EntityValue;
}
/** Request format */
export interface ExternalAgentRequest {
    /** Client access token for agent. */
    accessToken: string;
    /** Rules to activate for this agent. */
    rules: string[];
}
/** Request format */
export interface LooperBasicInfo {
    id: string;
    firstName: string;
    lastName: string;
}
/** Request format */
export interface NLURequestData {
    /** String to perform NLU on */
    text: string;
    /** Rules for default agent */
    rules: string[];
    loop?: {
        users: LooperBasicInfo[];
    };
    external?: {
        /** Other API.ai agents to use */
        [name: string]: ExternalAgentRequest;
    };
}
/** Response format */
export interface AgentResult {
    /** Listen rules to activate */
    rules: string[];
    /** Intent */
    intent: IntentName;
    /** Entities found for this intent */
    entities: Entities;
}
/** Response format */
export interface ExternalAgentResult extends AgentResult {
    error?: string;
}
/** Response format */
export interface NLUResult extends AgentResult {
    external?: {
        [name: string]: ExternalAgentResult;
    };
}
/** Actual NLU requests for endpoint `/nlu` */
export declare type NLURequest = BaseMessage<'NLU', NLURequestData>;
/** Actual NLU responses for endpoint `/nlu` */
export declare type NLUResponse = BaseResponse<'NLU', NLUResult>;
