import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class IFTTT extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: IFTTT.Types.ClientConfiguration)
  config: Config & IFTTT.Types.ClientConfiguration;
  /**
   *  Create IFTTT trigger. To be called by robot. 
   */
  trigger(params: IFTTT.Types.TriggerRequest, callback?: (err: AWSError, data: IFTTT.Types.CommandResponse) => void): Request<IFTTT.Types.CommandResponse, AWSError>;
  /**
   *  Create IFTTT trigger. To be called by robot. 
   */
  trigger(callback?: (err: AWSError, data: IFTTT.Types.CommandResponse) => void): Request<IFTTT.Types.CommandResponse, AWSError>;
  /**
   *  Lists IFTTT triggers. To be called by owner. 
   */
  listTriggers(params: IFTTT.Types.ListTriggersRequest, callback?: (err: AWSError, data: IFTTT.Types.Triggers) => void): Request<IFTTT.Types.Triggers, AWSError>;
  /**
   *  Lists IFTTT triggers. To be called by owner. 
   */
  listTriggers(callback?: (err: AWSError, data: IFTTT.Types.Triggers) => void): Request<IFTTT.Types.Triggers, AWSError>;
  /**
   *  Lists IFTTT photo triggers. To be called by owner. 
   */
  listMedia(params: IFTTT.Types.ListMediaRequest, callback?: (err: AWSError, data: IFTTT.Types.MediaTriggers) => void): Request<IFTTT.Types.MediaTriggers, AWSError>;
  /**
   *  Lists IFTTT photo triggers. To be called by owner. 
   */
  listMedia(callback?: (err: AWSError, data: IFTTT.Types.MediaTriggers) => void): Request<IFTTT.Types.MediaTriggers, AWSError>;
  /**
   *  Marks IFTTT identity as deleted. 
   */
  deleteIdentity(params: IFTTT.Types.DeleteIdentityRequest, callback?: (err: AWSError, data: IFTTT.Types.CommandResponse) => void): Request<IFTTT.Types.CommandResponse, AWSError>;
  /**
   *  Marks IFTTT identity as deleted. 
   */
  deleteIdentity(callback?: (err: AWSError, data: IFTTT.Types.CommandResponse) => void): Request<IFTTT.Types.CommandResponse, AWSError>;
  /**
   *  Create IFTTT action. To be called by owner. 
   */
  action(params: IFTTT.Types.ActionRequest, callback?: (err: AWSError, data: IFTTT.Types.Actions) => void): Request<IFTTT.Types.Actions, AWSError>;
  /**
   *  Create IFTTT action. To be called by owner. 
   */
  action(callback?: (err: AWSError, data: IFTTT.Types.Actions) => void): Request<IFTTT.Types.Actions, AWSError>;
  /**
   *  Lists IFTTT actions. To be called by robot. 
   */
  listActions(params: IFTTT.Types.ListActionsRequest, callback?: (err: AWSError, data: IFTTT.Types.Actions) => void): Request<IFTTT.Types.Actions, AWSError>;
  /**
   *  Lists IFTTT actions. To be called by robot. 
   */
  listActions(callback?: (err: AWSError, data: IFTTT.Types.Actions) => void): Request<IFTTT.Types.Actions, AWSError>;
  /**
   *  Get basic user information. 
   */
  userInfo(callback?: (err: AWSError, data: IFTTT.Types.UserInfoResponse) => void): Request<IFTTT.Types.UserInfoResponse, AWSError>;
}
declare namespace IFTTT {
  export type Id = string;
  export type LoopId = string;
  export type Text = string;
  export type Identity = string;
  export type Limit = number;
  export interface TriggerRequest {
    text: Text;
  }
  export interface ListTriggersRequest {
    text?: Text;
    identity?: Identity;
    limit?: Limit;
  }
  export interface ListMediaRequest {
    identity?: Identity;
    limit?: Limit;
  }
  export interface DeleteIdentityRequest {
    identity: Identity;
  }
  export type Timestamp = number;
  export interface Trigger {
    id: Id;
    identity: Identity;
    text: Text;
    created: Timestamp;
  }
  export type Triggers = Trigger[];
  export type Url = string;
  export interface MediaTrigger {
    id: Id;
    identity: Identity;
    encryptedUrl?: Url;
    decryptedUrl: Url;
    created: Timestamp;
  }
  export type MediaTriggers = MediaTrigger[];
  export type Fields = {[key: string]: undefined};
  export interface ActionRequest {
    fields?: Fields;
  }
  export interface ListActionsRequest {
    limit?: Limit;
  }
  export interface Action {
    id: Id;
    loopId: LoopId;
    fields?: Fields;
    created: Timestamp;
  }
  export type Actions = Action[];
  export interface CommandResponse {
    result: undefined;
  }
  export type UserId = string;
  export type UserName = string;
  export interface UserInfoResponse {
    id: UserId;
    name: UserName;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2017-02-07"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the IFTTT client.
   */
  export import Types = IFTTT;
}
export = IFTTT;
