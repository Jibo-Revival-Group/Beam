/**
 * Analytics events mapping for internal, automatically created events.
 * @hidden
 */
export declare const EVENTS: {
    SKILL_ENTRY: string;
    SKILL_OFFER: string;
};
/**
 * Skill-namespaced Cloud Skill Analytics payload.
 */
export interface AnalyticsData {
    /** Key/value pairs of Cloud Skill name to a list of Analytics entries.  */
    [skill: string]: AnalyticsEntry[];
}
/**
 * Individual Analytics entry interface.
 */
export interface AnalyticsEntry {
    /** Name of the analytics event. */
    event: string;
    /** Properties payload to provide with the event. */
    properties: any;
}
/**
 * Skill Entry Analytics Data Properties
 */
export interface SkillEntryAnalyticsData {
    /** What intent was the skill initially launched with */
    initial_intent: string;
    /** Domain the skill was launched into (e.g. timer/alarm in clock) */
    domain: string;
    /** Was this skill launched via 'hey jibo' */
    was_hey_jibo_launch: boolean;
    /** Was this skill launched by the user or proactively */
    user_initiated: boolean;
    /** What skill was Jibo in before this skill */
    last_skill: string;
}
/**
 * Skill Opt-In Offer Analytics Data Properties
 */
export interface SkillOfferAnalyticsData {
    /** What the user said in response to the Opt-In offer */
    user_response: string;
    /** Whether the user responded by voice (speech) or touch */
    modality: string;
}
