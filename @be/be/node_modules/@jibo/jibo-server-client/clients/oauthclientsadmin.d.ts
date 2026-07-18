import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class OauthClientsAdmin extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: OauthClientsAdmin.Types.ClientConfiguration)
  config: Config & OauthClientsAdmin.Types.ClientConfiguration;
  /**
   *  Get full list of OAuth clients. 
   */
  listClients(callback?: (err: AWSError, data: OauthClientsAdmin.Types.ClientsList) => void): Request<OauthClientsAdmin.Types.ClientsList, AWSError>;
  /**
   *  Create new OAuth client. 
   */
  create(params: OauthClientsAdmin.Types.CreateRequest, callback?: (err: AWSError, data: OauthClientsAdmin.Types.Client) => void): Request<OauthClientsAdmin.Types.Client, AWSError>;
  /**
   *  Create new OAuth client. 
   */
  create(callback?: (err: AWSError, data: OauthClientsAdmin.Types.Client) => void): Request<OauthClientsAdmin.Types.Client, AWSError>;
  /**
   *  Update OAuth client by id. 
   */
  update(params: OauthClientsAdmin.Types.UpdateRequest, callback?: (err: AWSError, data: OauthClientsAdmin.Types.Client) => void): Request<OauthClientsAdmin.Types.Client, AWSError>;
  /**
   *  Update OAuth client by id. 
   */
  update(callback?: (err: AWSError, data: OauthClientsAdmin.Types.Client) => void): Request<OauthClientsAdmin.Types.Client, AWSError>;
  /**
   *  Remove OAuth client by id. 
   */
  remove(params: OauthClientsAdmin.Types.RemoveRequest, callback?: (err: AWSError, data: OauthClientsAdmin.Types.Client) => void): Request<OauthClientsAdmin.Types.Client, AWSError>;
  /**
   *  Remove OAuth client by id. 
   */
  remove(callback?: (err: AWSError, data: OauthClientsAdmin.Types.Client) => void): Request<OauthClientsAdmin.Types.Client, AWSError>;
}
declare namespace OauthClientsAdmin {
  export type Id = string;
  export type ClientId = string;
  export type Command = string;
  export type Stream = string;
  export type Secret = string;
  export type UpdatedBy = string;
  export type Timestamp = number;
  export type PKCE = boolean;
  export type Refresh = boolean;
  export type RedirectUri = string;
  export interface Client {
    id: Id;
    aco?: ACO;
    clientId: ClientId;
    pkce?: PKCE;
    redirectUri?: RedirectUri;
    refresh?: Refresh;
    secret?: Secret;
    created?: Timestamp;
    updated?: Timestamp;
    updatedBy?: UpdatedBy;
  }
  export type ClientsList = Client[];
  export type Version = string;
  export type SourceId = string;
  export type RemoteConfig = {[key: string]: any};
  export type KeepAliveTimeout = number;
  export type RecoveryTimeout = number;
  export interface ACO {
    version?: Version;
    sourceId?: SourceId;
    commandSet?: CommandSet;
    streamSet?: StreamSet;
    keepAliveTimeout?: KeepAliveTimeout;
    recoveryTimeout?: RecoveryTimeout;
    remoteConfig?: RemoteConfig;
  }
  export type CommandSet = Command[];
  export type StreamSet = Stream[];
  export interface CreateRequest {
    aco?: ACO;
    clientId: ClientId;
    pkce?: PKCE;
    redirectUri: RedirectUri;
    refresh?: Refresh;
    secret?: Secret;
    updatedBy: UpdatedBy;
  }
  export interface UpdateRequest {
    id: Id;
    aco?: ACO;
    clientId?: ClientId;
    pkce?: PKCE;
    redirectUri?: RedirectUri;
    refresh?: Refresh;
    secret?: Secret;
    updatedBy: UpdatedBy;
  }
  export interface RemoveRequest {
    id: Id;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2017-11-08"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the OauthClientsAdmin client.
   */
  export import Types = OauthClientsAdmin;
}
export = OauthClientsAdmin;
