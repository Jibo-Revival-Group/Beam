import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Push extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Push.Types.ClientConfiguration)
  config: Config & Push.Types.ClientConfiguration;
  /**
   *  Adds device to account. 
   */
  createDevice(params: Push.Types.Device, callback?: (err: AWSError, data: Push.Types.Devices) => void): Request<Push.Types.Devices, AWSError>;
  /**
   *  Adds device to account. 
   */
  createDevice(callback?: (err: AWSError, data: Push.Types.Devices) => void): Request<Push.Types.Devices, AWSError>;
  /**
   *  Removes device from account. 
   */
  removeDevice(params: Push.Types.RemoveDeviceRequest, callback?: (err: AWSError, data: Push.Types.Devices) => void): Request<Push.Types.Devices, AWSError>;
  /**
   *  Removes device from account. 
   */
  removeDevice(callback?: (err: AWSError, data: Push.Types.Devices) => void): Request<Push.Types.Devices, AWSError>;
}
declare namespace Push {
  export type AccountId = string;
  export type Name = string;
  export interface RemoveDeviceRequest {
    name: Name;
  }
  export type DeviceType = "ios"|"android"|string;
  export interface Device {
    name: Name;
    pushToken: undefined;
    type: DeviceType;
  }
  export type Devices = Device[];
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-07-29"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Push client.
   */
  export import Types = Push;
}
export = Push;
