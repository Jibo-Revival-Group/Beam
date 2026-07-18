export declare enum ContextField {
    FOCUSED_PERSON = "FOCUSED_PERSON",
    NUM_PEOPLE_PRESENT = "NUM_PEOPLE_PRESENT",
    NUM_IDENTIFIED_PEOPLE_PRESENT = "NUM_IDENTIFIED_PEOPLE_PRESENT",
    PERSON_IDS = "PERSON_IDS",
    PART_OF_DAY = "PART_OF_DAY",
    DAY_OF_WEEK = "DAY_OF_WEEK",
    TRIGGER_SOURCE = "TRIGGER_SOURCE",
}
export declare enum ContextMatchRule {
    EXACT = "EXACT",
    NOT = "NOT",
    CONTAINS_ALL = "CONTAINS_ALL",
    CONTAINS_ANY = "CONTAINS_ANY",
    NOT_CONTAIN = "NOT_CONTAIN",
    GREATER_THAN = "GREATER_THAN",
    LESS_THAN = "LESS_THAN",
    CONTAINED_IN = "CONTAINED_IN",
}
export interface ContextRule {
    field: string;
    /**
     * `Contain` match rules only apply to collection data types (arrays and objects).
     * Comparison rules (`GREATER_THAN`, `LESS_THAN`, etc) only apply to comparable
     * data types (numbers, mostly)
     */
    matchRule: ContextMatchRule;
    value: any;
}
