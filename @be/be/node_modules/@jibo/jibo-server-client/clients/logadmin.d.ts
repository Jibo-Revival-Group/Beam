import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class LogAdmin extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: LogAdmin.Types.ClientConfiguration)
  config: Config & LogAdmin.Types.ClientConfiguration;
  /**
   *  Set verbosity level for robots. 
   */
  setLevel(params: LogAdmin.Types.SetLevelRequest, callback?: (err: AWSError, data: LogAdmin.Types.CommandResponse) => void): Request<LogAdmin.Types.CommandResponse, AWSError>;
  /**
   *  Set verbosity level for robots. 
   */
  setLevel(callback?: (err: AWSError, data: LogAdmin.Types.CommandResponse) => void): Request<LogAdmin.Types.CommandResponse, AWSError>;
}
declare namespace LogAdmin {
  export interface SetLevelRequest {
    friendlyIds: FriendlyIds;
    namespaces: Namespaces;
  }
  export type Namespaces = VerbosityLevel[];
  export interface VerbosityLevel {
    namespace?: undefined;
    level?: Level;
  }
  export type FriendlyId = string;
  export type FriendlyIds = FriendlyId[];
  export type Level = "error"|"warn"|"info"|"verbose"|"debug"|"silly"|string;
  export interface CommandResponse {
    result: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2015-03-09"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the LogAdmin client.
   */
  export import Types = LogAdmin;
}
export = LogAdmin;
