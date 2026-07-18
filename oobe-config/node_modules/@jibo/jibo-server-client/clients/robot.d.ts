import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Robot extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Robot.Types.ClientConfiguration)
  config: Config & Robot.Types.ClientConfiguration;
  /**
   *  Gets friendly deviceIds for later robots creation. 
   */
  getFriendlyIds(params: Robot.Types.FriendlyIdsRequest, callback?: (err: AWSError, data: Robot.Types.IdPairs) => void): Request<Robot.Types.IdPairs, AWSError>;
  /**
   *  Gets friendly deviceIds for later robots creation. 
   */
  getFriendlyIds(callback?: (err: AWSError, data: Robot.Types.IdPairs) => void): Request<Robot.Types.IdPairs, AWSError>;
  /**
   *  Removes robot. 
   */
  removeRobot(params: Robot.Types.IdRequest, callback?: (err: AWSError, data: Robot.Types.CommandResponse) => void): Request<Robot.Types.CommandResponse, AWSError>;
  /**
   *  Removes robot. 
   */
  removeRobot(callback?: (err: AWSError, data: Robot.Types.CommandResponse) => void): Request<Robot.Types.CommandResponse, AWSError>;
  /**
   *  Updates robot. Can also be called by robot owner. Proposed account-defined properties are: connectedAt, timeZone. 
   */
  updateRobot(params: Robot.Types.UpdateRequest, callback?: (err: AWSError, data: Robot.Types.CommandResponse) => void): Request<Robot.Types.CommandResponse, AWSError>;
  /**
   *  Updates robot. Can also be called by robot owner. Proposed account-defined properties are: connectedAt, timeZone. 
   */
  updateRobot(callback?: (err: AWSError, data: Robot.Types.CommandResponse) => void): Request<Robot.Types.CommandResponse, AWSError>;
  /**
   *  Gets robot entity. If provided with serial number, it will validate it. 
   */
  getRobot(params: Robot.Types.IdRequest, callback?: (err: AWSError, data: Robot.Types.Robot) => void): Request<Robot.Types.Robot, AWSError>;
  /**
   *  Gets robot entity. If provided with serial number, it will validate it. 
   */
  getRobot(callback?: (err: AWSError, data: Robot.Types.Robot) => void): Request<Robot.Types.Robot, AWSError>;
  /**
   *  Get list of robot historical events.  If provided with serial number, it will validate it. 
   */
  getRobotHistory(params: Robot.Types.IdRequest, callback?: (err: AWSError, data: Robot.Types.Events) => void): Request<Robot.Types.Events, AWSError>;
  /**
   *  Get list of robot historical events.  If provided with serial number, it will validate it. 
   */
  getRobotHistory(callback?: (err: AWSError, data: Robot.Types.Events) => void): Request<Robot.Types.Events, AWSError>;
  /**
   *  Gets calibration data for robot by its id. 
   */
  getCalibrationData(params: Robot.Types.IdRequest, callback?: (err: AWSError, data: Robot.Types.CalibrationResponse) => void): Request<Robot.Types.CalibrationResponse, AWSError>;
  /**
   *  Gets calibration data for robot by its id. 
   */
  getCalibrationData(callback?: (err: AWSError, data: Robot.Types.CalibrationResponse) => void): Request<Robot.Types.CalibrationResponse, AWSError>;
}
declare namespace Robot {
  export type Id = string;
  export type SerialNumber = string;
  export interface IdPair {
    id: Id;
  }
  export type IdPairs = IdPair[];
  export type Name = string;
  export type Payload = {[key: string]: any};
  export type CalibrationPayload = {[key: string]: any};
  export interface IdRequest {
    id: Id;
    serialNumber?: SerialNumber;
  }
  export type Timestamp = number;
  export interface CommandResponse {
    result: undefined;
  }
  export interface UpdateRequest {
    id: Id;
    payload: Payload;
  }
  export interface Robot {
    id: Id;
    payload: Payload;
    calibrationPayload?: CalibrationPayload;
    updated?: Timestamp;
    created?: Timestamp;
  }
  export interface Event {
    id: Id;
    name: Name;
    payload: Payload;
    created?: Timestamp;
  }
  export type Events = Event[];
  export type Count = number;
  export interface FriendlyIdsRequest {
    count: Count;
  }
  export interface CalibrationResponse {
    id: Id;
    calibrationPayload: CalibrationPayload;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-02-25"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Robot client.
   */
  export import Types = Robot;
}
export = Robot;
