/// <reference types="jibo-command-protocol" />
import { SupportedBehaviors } from './behaviors';
export declare const CURRENT_VERSION = "1.0.0";
/**
 * Valid Action types supported in Cloud Skills.
 */
export declare enum ActionType {
    /** JCP action type */
    JCP = "JCP",
}
/**
 * Configuration for a JCP action request from cloud to robot
 */
export interface JCPActionConfig<V> {
    /** Version of the JCP protocol */
    version: V;
    /** JCP action protocol */
    jcp: SupportedBehaviors;
}
/**
 * An action request from cloud to robot
 */
export interface Action<T extends ActionType = ActionType, D = any> {
    /** Type of action to request */
    type: T;
    /** Parameter to requested action */
    config: D;
}
export declare type JCPAction = Action<ActionType.JCP, JCPActionConfig<JIBO.ProtocolVersions.v2>>;
export declare type SkillAction = JCPAction;
