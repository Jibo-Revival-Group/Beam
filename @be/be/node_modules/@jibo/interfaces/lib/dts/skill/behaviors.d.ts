/// <reference types="jibo-command-protocol" />
/**
 * Supported JCP Behaviors (i.e. the behaviors that can be passed from Cloud Skills and consumed
 * on robot in Nimbus).
 */
export declare type SupportedBehaviors = JIBO.v2.pegasus.behaviors.SLIM | JIBO.v2.pegasus.behaviors.Sequence | JIBO.v2.pegasus.behaviors.Parallel | JIBO.v2.pegasus.behaviors.SetPresentPerson | JIBO.v2.pegasus.behaviors.ImpactEmotion;
/**
 * Supplemental behavior lists that are wrapped around main Skill actions.
 */
export interface SupplementalBehaviors {
    /** List of behaviors that are consumed in parallel with the main Skill action */
    parallel: SupportedBehaviors[];
    /** List of behaviors that are consumed in sequence with the main Skill action */
    sequence: SupportedBehaviors[];
}
/**
 * Supplemental behavior types.
 */
export declare enum SupplementalBehaviorType {
    /** Supplemental behavior that is consumed in parallel with the main action */
    Parallel = "Parallel",
    /** Supplemental behavior that is consumed in sequence with the main action */
    Sequence = "Sequence",
}
