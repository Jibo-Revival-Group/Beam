/**
 * Currently supported languages:
 * - American English: `en-US`
 * - Canadian English: `en-CA`
 */
export declare type LanguageCode = string;
export interface GeneralData {
    /** Account ID of the robot */
    accountID: string;
    /** My-Friendly-Robot-Name */
    robotID: string;
    /** Language code for the robot */
    lang: LanguageCode;
    /** Full-stack release version of the robot */
    release: string;
    /** Robot IP address */
    remoteAddress?: string;
}
/**
 * Keeps track of which skill we are in and what node within the skill
 * Also keeps the session data for that particular skill session and history
 */
export interface SkillData {
    /** Unique skill ID */
    id: string;
    /** Info for each session */
    session?: {
        /** UUID for current session of skill */
        id: string;
        /** Active node in skill */
        nodeID: number;
        /** A read/write session for skill data */
        data: any;
        /** History of transitions */
        trace: {
            nodeID: number;
            transition: string;
        }[];
    };
}
