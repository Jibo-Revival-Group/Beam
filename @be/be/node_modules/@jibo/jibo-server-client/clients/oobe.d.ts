import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class OOBE extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: OOBE.Types.ClientConfiguration)
  config: Config & OOBE.Types.ClientConfiguration;
  /**
   *  Generates temporary setup token to be used by robot. 
   */
  prepareRobot(params: OOBE.Types.PrepareRobotRequest, callback?: (err: AWSError, data: OOBE.Types.TokenContainer) => void): Request<OOBE.Types.TokenContainer, AWSError>;
  /**
   *  Generates temporary setup token to be used by robot. 
   */
  prepareRobot(callback?: (err: AWSError, data: OOBE.Types.TokenContainer) => void): Request<OOBE.Types.TokenContainer, AWSError>;
  /**
   *  Retrieves status of robot setup. 
   */
  getStatus(params: OOBE.Types.TokenContainer, callback?: (err: AWSError, data: OOBE.Types.StatusContainer) => void): Request<OOBE.Types.StatusContainer, AWSError>;
  /**
   *  Retrieves status of robot setup. 
   */
  getStatus(callback?: (err: AWSError, data: OOBE.Types.StatusContainer) => void): Request<OOBE.Types.StatusContainer, AWSError>;
  /**
   *  Setups robot and retrieves credentials setup token. 
   */
  setupRobot(params: OOBE.Types.SetupRobotRequest, callback?: (err: AWSError, data: OOBE.Types.RobotCredentials) => void): Request<OOBE.Types.RobotCredentials, AWSError>;
  /**
   *  Setups robot and retrieves credentials setup token. 
   */
  setupRobot(callback?: (err: AWSError, data: OOBE.Types.RobotCredentials) => void): Request<OOBE.Types.RobotCredentials, AWSError>;
  /**
   *  Reconnects robot to network. 
   */
  reconnectRobot(params: OOBE.Types.ReconnectRobotRequest, callback?: (err: AWSError, data: OOBE.Types.CommandResponse) => void): Request<OOBE.Types.CommandResponse, AWSError>;
  /**
   *  Reconnects robot to network. 
   */
  reconnectRobot(callback?: (err: AWSError, data: OOBE.Types.CommandResponse) => void): Request<OOBE.Types.CommandResponse, AWSError>;
}
declare namespace OOBE {
  export type RobotId = string;
  export type LoopId = string;
  export interface SetupRobotRequest {
    token: AccessToken;
    id: RobotId;
  }
  export interface PrepareRobotRequest {
    loopId?: LoopId;
  }
  export interface ReconnectRobotRequest {
    token: AccessToken;
    id?: RobotId;
  }
  export interface RobotCredentials {
    accessKeyId: undefined;
    secretAccessKey: undefined;
    serviceMode?: undefined;
  }
  export type Timestamp = number;
  export type AccessToken = string;
  export interface TokenContainer {
    token: AccessToken;
    expires?: Timestamp;
  }
  export type Complete = boolean;
  export interface StatusContainer {
    complete: Complete;
  }
  export interface CommandResponse {
    result: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-10-26"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the OOBE client.
   */
  export import Types = OOBE;
}
export = OOBE;
