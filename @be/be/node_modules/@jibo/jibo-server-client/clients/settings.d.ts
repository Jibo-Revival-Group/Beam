import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Settings extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Settings.Types.ClientConfiguration)
  config: Config & Settings.Types.ClientConfiguration;
  /**
   *  Lists all settings with values. 
   */
  getSettings(params: Settings.Types.GetSettingsRequest, callback?: (err: AWSError, data: Settings.Types.GetSettingsResponse) => void): Request<Settings.Types.GetSettingsResponse, AWSError>;
  /**
   *  Lists all settings with values. 
   */
  getSettings(callback?: (err: AWSError, data: Settings.Types.GetSettingsResponse) => void): Request<Settings.Types.GetSettingsResponse, AWSError>;
  /**
   * 
   */
  getDataForSettings(params: Settings.Types.GetDataForSettingsRequest, callback?: (err: AWSError, data: Settings.Types.GetSettingsResponse) => void): Request<Settings.Types.GetSettingsResponse, AWSError>;
  /**
   * 
   */
  getDataForSettings(callback?: (err: AWSError, data: Settings.Types.GetSettingsResponse) => void): Request<Settings.Types.GetSettingsResponse, AWSError>;
  /**
   * 
   */
  updateSettings(params: Settings.Types.UpdateSettingsRequest, callback?: (err: AWSError, data: Settings.Types.UpdateSettingsResponse) => void): Request<Settings.Types.UpdateSettingsResponse, AWSError>;
  /**
   * 
   */
  updateSettings(callback?: (err: AWSError, data: Settings.Types.UpdateSettingsResponse) => void): Request<Settings.Types.UpdateSettingsResponse, AWSError>;
  /**
   * Removes values specified settings. At the moment available only for the Lasso service
   */
  deleteSettings(params: Settings.Types.DeleteSettingsRequest, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   * Removes values specified settings. At the moment available only for the Lasso service
   */
  deleteSettings(callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
}
declare namespace Settings {
  export interface GetSettingsRequest {
    loopId: undefined;
    transId: undefined;
    skills?: undefined;
    getView?: undefined;
  }
  export interface GetDataForSettingsRequest {
    loopId: undefined;
    transId: undefined;
    settings: undefined;
    skills?: undefined;
    getView?: undefined;
  }
  export type GetSettingsResponse = SkillSettings[];
  export interface SettingsView {
    skillId: undefined;
    view: undefined;
    data?: SkillSettingData;
  }
  export interface SkillSettings {
    skillId: undefined;
    view?: Object;
    data: SkillSettingData;
  }
  export type SkillSettingData = {[key: string]: SettingValue};
  export interface UpdateSettingsRequest {
    loopId: undefined;
    transId: undefined;
    data: UpdateSettingData;
  }
  export interface UpdateSettingsResponse {
    data: UpdateSettingData;
  }
  export type UpdateSettingData = {[key: string]: UpdateSettingValue};
  export type Object = {[key: string]: any};
  export type String = string;
  export type SettingValue = {[key: string]: any};
  export interface UpdateSettingValue {
    skillId: undefined;
    dataService: undefined;
    value: SettingValue;
  }
  export interface DeleteSettingsRequest {
    loopId: undefined;
    transId: undefined;
    data: DeleteSettingData;
  }
  export type DeleteSettingData = {[key: string]: DeleteSettingValue};
  export interface DeleteSettingValue {
    skillId: undefined;
    dataService: undefined;
    oauthParams?: OAuthParams;
  }
  export interface OAuthParams {
    serviceName: undefined;
    serviceAccountName: undefined;
    scopes: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2017-12-19"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Settings client.
   */
  export import Types = Settings;
}
export = Settings;
