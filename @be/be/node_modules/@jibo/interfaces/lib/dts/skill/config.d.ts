import { IntentName } from '../nlu';
export declare type SkillID = string;
import { ProactiveRegistration, IHQueryDefinitions } from '../proactive';
/**
 * Needs to be provided through environment
 */
export interface BaseServiceConfig {
    /** @example `http://localhost:8080` */
    baseURL?: string;
}
/**
 * Needs to be provided through environment
 */
export interface SkillServiceConfig extends BaseServiceConfig {
    /** Path to the manifest file to use */
    configPath: string;
}
/**
 * Needs to be provided in skill manifest
 */
export interface ManifestSkillConfig {
    /** Name of skill */
    id: SkillID;
    intents: {
        name: IntentName;
        entities?: EntityConfig[];
        memo?: any;
    }[];
    proactives?: ProactiveRegistration[];
    IHQueries?: IHQueryDefinitions;
    onRobot?: boolean;
    basePath?: string;
    settings?: ManifestSettings;
}
/**
 * Is built from both environment configuration and manifest data
 */
export interface SkillConfig extends ManifestSkillConfig {
    URL: string;
}
export declare type ExpectedEntityValue = string | number | boolean;
export interface EntityConfig {
    name: string;
    value: ExpectedEntityValue;
    matchRule: 'EXACT' | 'NOT';
}
/** This format is stored in manifest files */
export interface ManifestSettings {
    view: ManifestSettingView;
}
/** Will be utilized by Settings service */
export interface ManifestSettingsAndData extends ManifestSettings {
    skillId: string;
    /**
     * Dictionary. Key:
     * - `dataKey`: `string`
     * - `value`: `object`
     */
    data: ManifestSettingsData;
}
export interface ManifestSettingsData {
    [key: string]: object;
}
export interface ManifestSettingView {
    type: string;
    index: number;
    title?: string;
    subtitle?: string;
    icon?: string;
    valueDefinition?: ManifestSettingValueDefinition;
    childViews?: ManifestSettingView[];
}
export interface ManifestSettingValueDefinition {
    target: SettingValueTarget;
    key: string;
    type: string;
    required: boolean;
}
export declare enum SettingValueTarget {
    loop = 0,
    person = 1,
    lasso = 2,
}
