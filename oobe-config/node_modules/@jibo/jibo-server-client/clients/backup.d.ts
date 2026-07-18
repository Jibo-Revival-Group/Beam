import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Backup extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Backup.Types.ClientConfiguration)
  config: Config & Backup.Types.ClientConfiguration;
  /**
   *  Get URL to upload backup binary to. 
   */
  new(params: Backup.Types.NewBackupRequest, callback?: (err: AWSError, data: Backup.Types.NewBackupResponse) => void): Request<Backup.Types.NewBackupResponse, AWSError>;
  /**
   *  Get URL to upload backup binary to. 
   */
  new(callback?: (err: AWSError, data: Backup.Types.NewBackupResponse) => void): Request<Backup.Types.NewBackupResponse, AWSError>;
  /**
   *  Get latest backup. 
   */
  list(params: Backup.Types.ListRequest, callback?: (err: AWSError, data: Backup.Types.ListResponse) => void): Request<Backup.Types.ListResponse, AWSError>;
  /**
   *  Get latest backup. 
   */
  list(callback?: (err: AWSError, data: Backup.Types.ListResponse) => void): Request<Backup.Types.ListResponse, AWSError>;
}
declare namespace Backup {
  export type Id = string;
  export interface NewBackupRequest {
    loopId: Id;
  }
  export interface NewBackupResponse {
    uploadUrl: undefined;
  }
  export interface ListRequest {
    loopId: Id;
  }
  export type ListResponse = BackupItem[];
  export interface BackupItem {
    modified?: undefined;
    etag?: undefined;
    size?: undefined;
    location?: SignedUrl;
  }
  export interface SignedUrl {
    expires?: undefined;
    url?: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2017-02-22"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Backup client.
   */
  export import Types = Backup;
}
export = Backup;
