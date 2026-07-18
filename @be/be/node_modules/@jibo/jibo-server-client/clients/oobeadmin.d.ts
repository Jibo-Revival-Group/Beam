import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class OOBEAdmin extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: OOBEAdmin.Types.ClientConfiguration)
  config: Config & OOBEAdmin.Types.ClientConfiguration;
  /**
   *  Generates temporary setup token to be used by service robot. 
   */
  getServiceToken(callback?: (err: AWSError, data: OOBEAdmin.Types.TokenContainer) => void): Request<OOBEAdmin.Types.TokenContainer, AWSError>;
}
declare namespace OOBEAdmin {
  export type Timestamp = number;
  export type AccessToken = string;
  export interface TokenContainer {
    token: AccessToken;
    expires?: Timestamp;
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
   * Contains interfaces for use with the OOBEAdmin client.
   */
  export import Types = OOBEAdmin;
}
export = OOBEAdmin;
