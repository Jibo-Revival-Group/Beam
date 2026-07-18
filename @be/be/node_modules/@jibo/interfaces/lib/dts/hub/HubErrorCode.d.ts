/**
 * Enumerates the types of error codes that the Hub can
 * emit on response messages of type ERROR.
 */
export declare enum HubErrorCode {
    /** Skill URL not found */
    SKILL_NOT_FOUND = "SKILL_NOT_FOUND",
    /** Timeout while waiting for skill response */
    TIMEOUT_SKILL = "TIMEOUT_SKILL",
    /** Timeout while waiting for parser response */
    TIMEOUT_PARSER = "TIMEOUT_PARSER",
    /** Timeout while waiting for ASR response */
    TIMEOUT_ASR = "TIMEOUT_ASR",
    /** Timeout while waiting for the context message from jetstream */
    TIMEOUT_CONTEXT = "TIMEOUT_CONTEXT",
    /** Timeout of complete transaction */
    TIMEOUT_TRANSACTION = "TIMEOUT_TRANSACTION",
    /** Error from ASR service */
    ASR = "ASR",
    /** Error from Parser service */
    PARSER = "PARSER",
    /** General error */
    GENERAL = "GENERAL",
}
