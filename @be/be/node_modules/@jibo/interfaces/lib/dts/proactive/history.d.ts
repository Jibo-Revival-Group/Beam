import { IHQueryRule } from '../history/skilllaunch/query';
import { TimePeriod } from '../time';
/**
 * Type of query to make to History Service
 * LastEvent returns full event data, Count returns just an integer
 */
export declare enum IHQueryType {
    LastEvent = "LastEvent",
    Count = "Count",
}
/**
 * Special values which can be be used
 * in startTimeOffset and endTimeOffset of the query
 */
export declare enum IHTimeOffset {
    SinceWaking = "SinceWaking",
}
/**
 * Transformation method which can be used
 * to extract some value from history service response
 */
export declare enum IHTransformMethod {
    TimeSince = "TimeSince",
}
/**
 * Match method which can be used in IHRule
 */
export declare enum IHMatchMethod {
    EXACT = "EXACT",
    NOT = "NOT",
    GREATER_THAN = "GREATER_THAN",
    LESS_THAN = "LESS_THAN",
}
export declare type IHQueryID = string;
/**
 * Rule which defines how proactive registration
 * needs to check Interaction History
 */
export interface IHRule {
    query: IHQueryID | IHQueryDefinition;
    transform?: IHTransformMethod;
    checkProperty?: string;
    matchRule: IHMatchMethod;
    value: TimePeriod | number | string | null;
}
/**
 * Definition of a query to history service
 * This definition + some data from context are used to build query to history service
 */
export interface IHQueryDefinition {
    type: IHQueryType;
    queryRules: IHQueryRule[];
    personIDs?: 'PresentPeople';
    startTimeOffset?: TimePeriod | IHTimeOffset;
    endTimeOffset?: TimePeriod | IHTimeOffset;
}
/**
 * Map of query names and query definitions
 */
export interface IHQueryDefinitions {
    [key: string]: IHQueryDefinition;
}
