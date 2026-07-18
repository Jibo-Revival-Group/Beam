import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Notification extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Notification.Types.ClientConfiguration)
  config: Config & Notification.Types.ClientConfiguration;
  /**
   *  Creates New Robot Token used to establish WebSocket connection
   */
  newRobotToken(params: Notification.Types.RobotTokenRequest, callback?: (err: AWSError, data: Notification.Types.Token) => void): Request<Notification.Types.Token, AWSError>;
  /**
   *  Creates New Robot Token used to establish WebSocket connection
   */
  newRobotToken(callback?: (err: AWSError, data: Notification.Types.Token) => void): Request<Notification.Types.Token, AWSError>;
  /**
   *  Gets connected status for specified account.
   */
  getStatus(params: Notification.Types.GetStatusRequest, callback?: (err: AWSError, data: Notification.Types.GetStatusResponse) => void): Request<Notification.Types.GetStatusResponse, AWSError>;
  /**
   *  Gets connected status for specified account.
   */
  getStatus(callback?: (err: AWSError, data: Notification.Types.GetStatusResponse) => void): Request<Notification.Types.GetStatusResponse, AWSError>;
}
declare namespace Notification {
  export interface Id {
    id: undefined;
  }
  export type DeviceId = string;
  export interface RobotTokenRequest {
    deviceId?: DeviceId;
  }
  export interface Token {
    token: undefined;
  }
  export interface GetStatusRequest {
    accountId: undefined;
  }
  export interface GetStatusResponse {
    connected: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2015-05-05"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Notification client.
   */
  export import Types = Notification;
}
export = Notification;
