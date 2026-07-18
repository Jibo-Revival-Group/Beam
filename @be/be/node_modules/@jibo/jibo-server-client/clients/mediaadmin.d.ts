import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class MediaAdmin extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: MediaAdmin.Types.ClientConfiguration)
  config: Config & MediaAdmin.Types.ClientConfiguration;
  /**
   *  Removes all media from loop. Requires admin or manufacturer credentials 
   */
  removeAllMediaFromLoop(params: MediaAdmin.Types.RemoveAllLoopMediaRequest, callback?: (err: AWSError, data: MediaAdmin.Types.MediaList) => void): Request<MediaAdmin.Types.MediaList, AWSError>;
  /**
   *  Removes all media from loop. Requires admin or manufacturer credentials 
   */
  removeAllMediaFromLoop(callback?: (err: AWSError, data: MediaAdmin.Types.MediaList) => void): Request<MediaAdmin.Types.MediaList, AWSError>;
}
declare namespace MediaAdmin {
  export type Id = string;
  export type AccountId = string;
  export type LoopId = string;
  export type Path = string;
  export type Reference = string;
  export type Type = "image"|"photo_booth"|"recording"|"thumb"|"thumb_robot"|"audio"|string;
  export type Encrypted = boolean;
  export type Timestamp = number;
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
    created: Timestamp;
  }
  export type MediaList = Media[];
  export interface RemoveAllLoopMediaRequest {
    loopId: LoopId;
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
   * Contains interfaces for use with the MediaAdmin client.
   */
  export import Types = MediaAdmin;
}
export = MediaAdmin;
