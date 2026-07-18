import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class UpdateAdmin extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: UpdateAdmin.Types.ClientConfiguration)
  config: Config & UpdateAdmin.Types.ClientConfiguration;
  /**
   *  Lists all available unique filters for updates. 
   */
  listUniqueFilters(callback?: (err: AWSError, data: UpdateAdmin.Types.UniqueFilterList) => void): Request<UpdateAdmin.Types.UniqueFilterList, AWSError>;
  /**
   *  Creates mapping of serial to target. 
   */
  setTarget(params: UpdateAdmin.Types.SerialTarget, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   *  Creates mapping of serial to target. 
   */
  setTarget(callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   *  Lists mappings of serials to targets. 
   */
  listTargets(callback?: (err: AWSError, data: UpdateAdmin.Types.SerialTargetList) => void): Request<UpdateAdmin.Types.SerialTargetList, AWSError>;
}
declare namespace UpdateAdmin {
  export type Filter = string;
  export type UniqueFilterList = Filter[];
  export type Serial = string;
  export type Target = string;
  export type SerialTargetList = SerialTarget[];
  export interface SerialTarget {
    serial: Serial;
    target?: Target;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-03-01"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the UpdateAdmin client.
   */
  export import Types = UpdateAdmin;
}
export = UpdateAdmin;
