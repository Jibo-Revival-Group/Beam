export declare enum SettingsMatchRule {
    EXACT = "EXACT",
    NOT = "NOT",
}
export interface SettingsRule {
    skill: string;
    key: string;
    matchRule: SettingsMatchRule;
    value: any;
}
