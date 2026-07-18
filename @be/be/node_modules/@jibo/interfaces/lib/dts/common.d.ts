import { SkillID } from './skill/config';
/** Interface for matching to global commands */
export interface GlobalMatchResponseData {
    /** Unique ID of the skill */
    skillID: SkillID;
    /** `true` if skill is on robot */
    onRobot?: boolean;
    /** `true` if this is skill launch */
    launch?: boolean;
    /** `true` if it is proactive launch */
    isProactive?: boolean;
    /** `true` if after this skill exits surprises should be skipped */
    skipSurprises?: boolean;
}
