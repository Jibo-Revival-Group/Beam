import { PayloadObject, PayloadValue } from './payload';
export declare enum RuleField {
    SKILL_ID = "skillID",
    INTENT = "intent",
    PERSON_IDS = "personIDs",
    PAYLOAD = "payload",
}
export declare const ValidRuleFields: string[];
export declare type RuleValue = string | string[] | PayloadObject | PayloadValue;
export declare enum MatchMethod {
    /** For string fields */
    EXACT = "EXACT",
    /** For string fields */
    NOT = "NOT",
    /** For string fields */
    ONE_OF = "ONE_OF",
    /**
     * For array fields. </br>
     * Contains string
     */
    CONTAINS = "CONTAINS",
    /**
     * For array fields. </br>
     * Does not contain any of strings
     */
    NOT_CONTAIN = "NOT_CONTAIN",
    CONTAINS_ANY = "CONTAINS_ANY",
    CONTAINS_ALL = "CONTAINS_ALL",
}
export interface SimpleRule {
    field: RuleField;
    /** Allowed values */
    value: string | string[];
    match?: MatchMethod;
}
export interface PayloadRule {
    field: RuleField.PAYLOAD;
    value: PayloadObject;
    match?: MatchMethod;
}
export interface PayloadKeyRule {
    field: RuleField.PAYLOAD;
    key: string;
    value: PayloadValue;
    match?: MatchMethod;
}
export declare type IHQueryRule = SimpleRule | PayloadKeyRule | PayloadRule;
export interface IHQuery {
    robotID: string;
    /** For exact match by skillID */
    skillID?: string;
    /** For exact match by intent */
    intent?: string;
    /** For exact match by personID */
    personID?: string;
    /** Used to ignore events from current session */
    notSessionID?: string;
    /**
     * Milliseconds since the Epoch;
     * the start time of the period of interest. </br>
     * Defaults to full range of available data.
     */
    startTime?: number;
    /**
     * Milliseconds since the Epoch;
     * the emd time of the period of interest. </br>
     * Defaults to present.
     */
    endTime?: number;
    /** For advanced matches by skillID, intent, personID, payload */
    rules?: IHQueryRule[];
}
