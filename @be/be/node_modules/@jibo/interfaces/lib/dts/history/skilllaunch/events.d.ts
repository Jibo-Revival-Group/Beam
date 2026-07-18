import { PayloadObject } from './payload';
export declare enum EventType {
    SKILL_LAUNCH = "SKILL_LAUNCH",
}
export interface BaseEventData {
    /** Milliseconds since the Epoch */
    timestamp?: number;
    /** UUID of the current session */
    sessionID: string;
    robotID: string;
    skillID: string;
}
export interface SkillLaunchData extends BaseEventData {
    intent?: string;
    personIDs?: string[];
}
export interface SkillPayloadData extends BaseEventData {
    payload: PayloadObject;
}
export interface SkillLaunchRecord extends SkillLaunchData {
    id: string;
    payload?: PayloadObject;
}
