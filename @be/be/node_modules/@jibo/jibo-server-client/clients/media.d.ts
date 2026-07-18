import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Media extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Media.Types.ClientConfiguration)
  config: Config & Media.Types.ClientConfiguration;
  /**
   *  Creates new media. 
   */
  create(params: Media.Types.CreateRequest, callback?: (err: AWSError, data: Media.Types.Media) => void): Request<Media.Types.Media, AWSError>;
  /**
   *  Creates new media. 
   */
  create(callback?: (err: AWSError, data: Media.Types.Media) => void): Request<Media.Types.Media, AWSError>;
  /**
   *  Lists media. 
   */
  list(params: Media.Types.ListRequest, callback?: (err: AWSError, data: Media.Types.MediaList) => void): Request<Media.Types.MediaList, AWSError>;
  /**
   *  Lists media. 
   */
  list(callback?: (err: AWSError, data: Media.Types.MediaList) => void): Request<Media.Types.MediaList, AWSError>;
  /**
   *  Removes media. 
   */
  remove(params: Media.Types.PathsRequest, callback?: (err: AWSError, data: Media.Types.MediaList) => void): Request<Media.Types.MediaList, AWSError>;
  /**
   *  Removes media. 
   */
  remove(callback?: (err: AWSError, data: Media.Types.MediaList) => void): Request<Media.Types.MediaList, AWSError>;
  /**
   *  Gets media by paths. 
   */
  get(params: Media.Types.PathsRequest, callback?: (err: AWSError, data: Media.Types.MediaList) => void): Request<Media.Types.MediaList, AWSError>;
  /**
   *  Gets media by paths. 
   */
  get(callback?: (err: AWSError, data: Media.Types.MediaList) => void): Request<Media.Types.MediaList, AWSError>;
}
declare namespace Media {
  export type Id = string;
  export type AccountId = string;
  export type LoopId = string;
  export type LoopIds = LoopId[];
  export type Stream = Buffer|Uint8Array|Blob|string;
  export type Path = string;
  export type Paths = Path[];
  export type Reference = string;
  export type Type = "image"|"photo_booth"|"recording"|"thumb"|"thumb_robot"|"audio"|string;
  export type Encrypted = boolean;
  export type String = string;
  export type Metadata = {[key: string]: String};
  export interface CreateRequest {
    body?: Stream;
    loopId: LoopId;
    path?: Path;
    type?: Type;
    reference?: Reference;
    isEncrypted?: Encrypted;
    meta?: Metadata;
  }
  export type Timestamp = number;
  export interface ListRequest {
    loopIds: LoopIds;
    after?: Timestamp;
    before?: Timestamp;
  }
  export type Url = string;
  export interface Media {
    path: Path;
    type?: Type;
    reference?: Reference;
    accountId?: AccountId;
    loopId?: LoopId;
    url?: Url;
    isEncrypted?: Encrypted;
    isDeleted?: undefined;
    meta?: Metadata;
    created: Timestamp;
  }
  export type MediaList = Media[];
  export interface PathsRequest {
    paths: Paths;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-07-25"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Media client.
   */
  export import Types = Media;
}
export = Media;
