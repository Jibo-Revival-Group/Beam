import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Update extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Update.Types.ClientConfiguration)
  config: Config & Update.Types.ClientConfiguration;
  /**
   *  Lists all updates. 
   */
  listUpdates(params: Update.Types.ListRequest, callback?: (err: AWSError, data: Update.Types.UpdateList) => void): Request<Update.Types.UpdateList, AWSError>;
  /**
   *  Lists all updates. 
   */
  listUpdates(callback?: (err: AWSError, data: Update.Types.UpdateList) => void): Request<Update.Types.UpdateList, AWSError>;
  /**
   *  Lists updates from specified version. 
   */
  listUpdatesFrom(params: Update.Types.FromRequest, callback?: (err: AWSError, data: Update.Types.UpdateList) => void): Request<Update.Types.UpdateList, AWSError>;
  /**
   *  Lists updates from specified version. 
   */
  listUpdatesFrom(callback?: (err: AWSError, data: Update.Types.UpdateList) => void): Request<Update.Types.UpdateList, AWSError>;
  /**
   *  Gets optimal update from specified version. 
   */
  getUpdateFrom(params: Update.Types.FromRequest, callback?: (err: AWSError, data: Update.Types.Update) => void): Request<Update.Types.Update, AWSError>;
  /**
   *  Gets optimal update from specified version. 
   */
  getUpdateFrom(callback?: (err: AWSError, data: Update.Types.Update) => void): Request<Update.Types.Update, AWSError>;
  /**
   *  Creates new update.    Can only be called by administrator  
   */
  createUpdate(params: Update.Types.UpdateRequest, callback?: (err: AWSError, data: Update.Types.Update) => void): Request<Update.Types.Update, AWSError>;
  /**
   *  Creates new update.    Can only be called by administrator  
   */
  createUpdate(callback?: (err: AWSError, data: Update.Types.Update) => void): Request<Update.Types.Update, AWSError>;
  /**
   *  Removes update.    Can only be called by creator (administrator)  
   */
  removeUpdate(params: Update.Types.Id, callback?: (err: AWSError, data: Update.Types.Update) => void): Request<Update.Types.Update, AWSError>;
  /**
   *  Removes update.    Can only be called by creator (administrator)  
   */
  removeUpdate(callback?: (err: AWSError, data: Update.Types.Update) => void): Request<Update.Types.Update, AWSError>;
}
declare namespace Update {
  export type Stream = Buffer|Uint8Array|Blob|string;
  export interface Id {
    id: undefined;
  }
  export type Subsystem = string;
  export type Filter = string;
  export type String = string;
  export type Dependencies = {[key: string]: String};
  export type AccountId = string;
  export type Timestamp = number;
  export interface FromRequest {
    fromVersion: undefined;
    subsystem?: Subsystem;
    filter?: Filter;
  }
  export interface ListRequest {
    subsystem?: Subsystem;
    filter?: Filter;
  }
  export interface UpdateRequest {
    fromVersion: undefined;
    toVersion: undefined;
    changes: undefined;
    body?: Stream;
    subsystem?: Subsystem;
    filter?: Filter;
    dependencies?: Dependencies;
  }
  export interface Update {
    _id: undefined;
    created: Timestamp;
    accountId: AccountId;
    fromVersion: undefined;
    toVersion: undefined;
    changes: undefined;
    url: undefined;
    shaHash: undefined;
    length?: undefined;
    subsystem: Subsystem;
    filter?: Filter;
    dependencies?: Dependencies;
  }
  export type UpdateList = Update[];
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
   * Contains interfaces for use with the Update client.
   */
  export import Types = Update;
}
export = Update;
