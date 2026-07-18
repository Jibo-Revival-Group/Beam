import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class RobotAdmin extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: RobotAdmin.Types.ClientConfiguration)
  config: Config & RobotAdmin.Types.ClientConfiguration;
  /**
   *  Creates new robot.    Can only be called by manufacturing account  
   */
  createRobot(params: RobotAdmin.Types.CreateRequest, callback?: (err: AWSError, data: RobotAdmin.Types.CommandResponse) => void): Request<RobotAdmin.Types.CommandResponse, AWSError>;
  /**
   *  Creates new robot.    Can only be called by manufacturing account  
   */
  createRobot(callback?: (err: AWSError, data: RobotAdmin.Types.CommandResponse) => void): Request<RobotAdmin.Types.CommandResponse, AWSError>;
  /**
   *  Creates new robots.    Can only be called by manufacturing account  
   */
  createRobotBatch(params: RobotAdmin.Types.CreateRequests, callback?: (err: AWSError, data: RobotAdmin.Types.CommandResponse) => void): Request<RobotAdmin.Types.CommandResponse, AWSError>;
  /**
   *  Creates new robots.    Can only be called by manufacturing account  
   */
  createRobotBatch(callback?: (err: AWSError, data: RobotAdmin.Types.CommandResponse) => void): Request<RobotAdmin.Types.CommandResponse, AWSError>;
  /**
   *  Calibrates robot.    Can only be called by manufacturing account  
   */
  calibrateRobot(params: RobotAdmin.Types.CalibrateRequest, callback?: (err: AWSError, data: RobotAdmin.Types.CommandResponse) => void): Request<RobotAdmin.Types.CommandResponse, AWSError>;
  /**
   *  Calibrates robot.    Can only be called by manufacturing account  
   */
  calibrateRobot(callback?: (err: AWSError, data: RobotAdmin.Types.CommandResponse) => void): Request<RobotAdmin.Types.CommandResponse, AWSError>;
}
declare namespace RobotAdmin {
  export type Id = string;
  export type SerialNumber = string;
  export type Payload = {[key: string]: any};
  export type CalibrationPayload = {[key: string]: any};
  export interface IdRequest {
    id: Id;
    serialNumber?: SerialNumber;
  }
  export interface CommandResponse {
    result: undefined;
  }
  export interface CreateRequest {
    id: Id;
    payload: Payload;
  }
  export type CreateRequests = CreateRequest[];
  export interface CalibrateRequest {
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
   * Contains interfaces for use with the RobotAdmin client.
   */
  export import Types = RobotAdmin;
}
export = RobotAdmin;
