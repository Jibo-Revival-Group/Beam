import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class AccountAdmin extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: AccountAdmin.Types.ClientConfiguration)
  config: Config & AccountAdmin.Types.ClientConfiguration;
  /**
   *  Manually activates specified account.    Can only be called by administrator  
   */
  activateById(params: AccountAdmin.Types.IdRequest, callback?: (err: AWSError, data: AccountAdmin.Types.Account) => void): Request<AccountAdmin.Types.Account, AWSError>;
  /**
   *  Manually activates specified account.    Can only be called by administrator  
   */
  activateById(callback?: (err: AWSError, data: AccountAdmin.Types.Account) => void): Request<AccountAdmin.Types.Account, AWSError>;
  /**
   *  Reset email of a user. Caller must verify an account belongs to a proper person.    Can only be called by administrator  
   */
  resetEmail(params: AccountAdmin.Types.ResetEmailRequest, callback?: (err: AWSError, data: AccountAdmin.Types.IdRequest) => void): Request<AccountAdmin.Types.IdRequest, AWSError>;
  /**
   *  Reset email of a user. Caller must verify an account belongs to a proper person.    Can only be called by administrator  
   */
  resetEmail(callback?: (err: AWSError, data: AccountAdmin.Types.IdRequest) => void): Request<AccountAdmin.Types.IdRequest, AWSError>;
}
declare namespace AccountAdmin {
  export type Id = string;
  export type Email = string;
  export type Timestamp = number;
  export interface IdRequest {
    id: Id;
  }
  export type Campaign = string;
  export interface ResetEmailRequest {
    id: Id;
    email: Email;
    campaign?: Campaign;
  }
  export type Gender = "male"|"female"|"other"|"they"|string;
  export type AccountRoles = undefined[];
  export interface Account {
    id: Id;
    email: Email;
    accessKeyId?: undefined;
    secretAccessKey?: undefined;
    lastName?: undefined;
    firstName?: undefined;
    gender?: Gender;
    birthday?: Timestamp;
    isActive?: undefined;
    roles?: AccountRoles;
    photoUrl?: undefined;
    facebookConnected?: undefined;
    termsAccepted?: Timestamp;
    phoneNumber?: undefined;
    messagingAllowed?: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2015-11-11"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the AccountAdmin client.
   */
  export import Types = AccountAdmin;
}
export = AccountAdmin;
