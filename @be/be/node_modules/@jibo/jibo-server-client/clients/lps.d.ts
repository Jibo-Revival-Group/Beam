import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Lps extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Lps.Types.ClientConfiguration)
  config: Config & Lps.Types.ClientConfiguration;
  /**
   *  Uploads a batch of log events to server. 
   */
  newCredentials(params: Lps.Types.NewCredentialsRequest, callback?: (err: AWSError, data: Lps.Types.NewCredentialsResponse) => void): Request<Lps.Types.NewCredentialsResponse, AWSError>;
  /**
   *  Uploads a batch of log events to server. 
   */
  newCredentials(callback?: (err: AWSError, data: Lps.Types.NewCredentialsResponse) => void): Request<Lps.Types.NewCredentialsResponse, AWSError>;
}
declare namespace Lps {
  export interface NewCredentialsRequest {
  }
  export interface NewCredentialsResponse {
    credentials: StsCredentials;
    region: undefined;
    bucketPath: undefined;
    bucketName: undefined;
  }
  export interface StsCredentials {
    AccessKeyId: undefined;
    Expiration: undefined;
    SecretAccessKey: undefined;
    SessionToken: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2017-12-01"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Lps client.
   */
  export import Types = Lps;
}
export = Lps;
