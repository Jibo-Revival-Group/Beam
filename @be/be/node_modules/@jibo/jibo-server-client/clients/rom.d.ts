import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class ROM extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: ROM.Types.ClientConfiguration)
  config: Config & ROM.Types.ClientConfiguration;
  /**
   *  Create new certificate pair. To be called by loop owner. 
   */
  create(params: ROM.Types.CreateRequest, callback?: (err: AWSError, data: ROM.Types.CreateResponse) => void): Request<ROM.Types.CreateResponse, AWSError>;
  /**
   *  Create new certificate pair. To be called by loop owner. 
   */
  create(callback?: (err: AWSError, data: ROM.Types.CreateResponse) => void): Request<ROM.Types.CreateResponse, AWSError>;
  /**
   *  Retrieves client certificate. To be called by loop owner. 
   */
  setupClient(params: ROM.Types.ClientRequest, callback?: (err: AWSError, data: ROM.Types.ClientResponse) => void): Request<ROM.Types.ClientResponse, AWSError>;
  /**
   *  Retrieves client certificate. To be called by loop owner. 
   */
  setupClient(callback?: (err: AWSError, data: ROM.Types.ClientResponse) => void): Request<ROM.Types.ClientResponse, AWSError>;
  /**
   *  Retrieves server certificate. To be called by robot. 
   */
  setupServer(params: ROM.Types.Payload, callback?: (err: AWSError, data: ROM.Types.ServerResponse) => void): Request<ROM.Types.ServerResponse, AWSError>;
  /**
   *  Retrieves server certificate. To be called by robot. 
   */
  setupServer(callback?: (err: AWSError, data: ROM.Types.ServerResponse) => void): Request<ROM.Types.ServerResponse, AWSError>;
}
declare namespace ROM {
  export type FriendlyId = string;
  export type Cert = string;
  export type Private = string;
  export type Public = string;
  export type ClientFingerprint = string;
  export type ServerFingerprint = string;
  export type IpAddress = string;
  export type String = string;
  export type IpAddressInfo = {[key: string]: String};
  export type IpAddresses = IpAddressInfo[];
  export interface Payload {
    ipAddress: IpAddress;
    ipAddresses?: IpAddresses;
  }
  export type P12 = string;
  export type Timestamp = number;
  export interface CreateRequest {
    friendlyId: FriendlyId;
    aco?: undefined;
  }
  export interface CreateResponse {
    created: Timestamp;
  }
  export interface ClientRequest {
    friendlyId: FriendlyId;
  }
  export interface ClientResponse {
    cert: Cert;
    public: Public;
    private: Private;
    p12?: P12;
    fingerprint: ServerFingerprint;
    payload: Payload;
    created: Timestamp;
  }
  export interface ServerResponse {
    cert: Cert;
    public: Public;
    private: Private;
    fingerprint: ClientFingerprint;
    created: Timestamp;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2017-10-11"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the ROM client.
   */
  export import Types = ROM;
}
export = ROM;
