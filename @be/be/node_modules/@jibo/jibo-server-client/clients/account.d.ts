import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Account extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Account.Types.ClientConfiguration)
  config: Config & Account.Types.ClientConfiguration;
  /**
   *  Checks if email already exists in system. 
   */
  checkEmail(params: Account.Types.EmailRequest, callback?: (err: AWSError, data: Account.Types.CheckEmailResponse) => void): Request<Account.Types.CheckEmailResponse, AWSError>;
  /**
   *  Checks if email already exists in system. 
   */
  checkEmail(callback?: (err: AWSError, data: Account.Types.CheckEmailResponse) => void): Request<Account.Types.CheckEmailResponse, AWSError>;
  /**
   *  Creates new account. Doesn't require authentication. 
   */
  create(params: Account.Types.CreateRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Creates new account. Doesn't require authentication. 
   */
  create(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Logs account in and returns full account details with accessKeyId/secretAccessKey. Doesn't require authentication. 
   */
  login(params: Account.Types.LoginRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Logs account in and returns full account details with accessKeyId/secretAccessKey. Doesn't require authentication. 
   */
  login(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Searches for occurencies of query in firstName/lastName/email. 
   */
  search(params: Account.Types.SearchRequest, callback?: (err: AWSError, data: Account.Types.AccountList) => void): Request<Account.Types.AccountList, AWSError>;
  /**
   *  Searches for occurencies of query in firstName/lastName/email. 
   */
  search(callback?: (err: AWSError, data: Account.Types.AccountList) => void): Request<Account.Types.AccountList, AWSError>;
  /**
   *  Regenerates new pair of accessKeyId/secretAccessKey making previous values invalid. 
   */
  resetKeys(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Gets account details for multiple accounts. 
   */
  get(params: Account.Types.IdsRequestOptional, callback?: (err: AWSError, data: Account.Types.AccountList) => void): Request<Account.Types.AccountList, AWSError>;
  /**
   *  Gets account details for multiple accounts. 
   */
  get(callback?: (err: AWSError, data: Account.Types.AccountList) => void): Request<Account.Types.AccountList, AWSError>;
  /**
   *  Updates account. 
   */
  update(params: Account.Types.UpdateRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Updates account. 
   */
  update(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Removes account. 
   */
  remove(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Activates account by code provided in e-mail. Doesn't require authentication. 
   */
  activateByCode(params: Account.Types.ActivationRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Activates account by code provided in e-mail. Doesn't require authentication. 
   */
  activateByCode(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Resends activation code to account e-mail. Doesn't require authentication. 
   */
  resendActivationCode(params: Account.Types.EmailRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Resends activation code to account e-mail. Doesn't require authentication. 
   */
  resendActivationCode(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Changes account password. 
   */
  changePassword(params: Account.Types.ChangePasswordRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Changes account password. 
   */
  changePassword(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Changes account email. 
   */
  changeEmail(params: Account.Types.ChangeEmailRequest, callback?: (err: AWSError, data: Account.Types.IdStruct) => void): Request<Account.Types.IdStruct, AWSError>;
  /**
   *  Changes account email. 
   */
  changeEmail(callback?: (err: AWSError, data: Account.Types.IdStruct) => void): Request<Account.Types.IdStruct, AWSError>;
  /**
   *  Changes account email. 
   */
  confirmEmailReset(params: Account.Types.ConfirmEmailResetRequest, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   *  Changes account email. 
   */
  confirmEmailReset(callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   *  Sends password reset instructions to specified e-mail. Doesn't require authentication. 
   */
  sendPasswordReset(params: Account.Types.EmailRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Sends password reset instructions to specified e-mail. Doesn't require authentication. 
   */
  sendPasswordReset(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Sets user password if provided password reset code is correct. Doesn't require authentication. 
   */
  passwordResetByCode(params: Account.Types.PasswordResetRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Sets user password if provided password reset code is correct. Doesn't require authentication. 
   */
  passwordResetByCode(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Adds or updates account photo. 
   */
  updatePhoto(params: Account.Types.UpdatePhotoRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Adds or updates account photo. 
   */
  updatePhoto(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Removes account photo. 
   */
  removePhoto(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Sends verification code via SMS. 
   */
  sendPhoneVerificationCode(params: Account.Types.PhoneNumberRequest, callback?: (err: AWSError, data: Account.Types.IdStruct) => void): Request<Account.Types.IdStruct, AWSError>;
  /**
   *  Sends verification code via SMS. 
   */
  sendPhoneVerificationCode(callback?: (err: AWSError, data: Account.Types.IdStruct) => void): Request<Account.Types.IdStruct, AWSError>;
  /**
   *  Makes phone number verified if provided correct code. 
   */
  verifyPhoneByCode(params: Account.Types.PhoneVerificationRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Makes phone number verified if provided correct code. 
   */
  verifyPhoneByCode(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Generates temporary access token. 
   */
  createAccessToken(params: Account.Types.TokenRequest, callback?: (err: AWSError, data: Account.Types.TokenContainer) => void): Request<Account.Types.TokenContainer, AWSError>;
  /**
   *  Generates temporary access token. 
   */
  createAccessToken(callback?: (err: AWSError, data: Account.Types.TokenContainer) => void): Request<Account.Types.TokenContainer, AWSError>;
  /**
   *  Generates temporary access token. 
   */
  createHubToken(params: Account.Types.TokenRequest, callback?: (err: AWSError, data: Account.Types.TokenContainer) => void): Request<Account.Types.TokenContainer, AWSError>;
  /**
   *  Generates temporary access token. 
   */
  createHubToken(callback?: (err: AWSError, data: Account.Types.TokenContainer) => void): Request<Account.Types.TokenContainer, AWSError>;
  /**
   *  Retrieves account credentials by temporary access token. 
   */
  getAccountByAccessToken(params: Account.Types.TokenContainer, callback?: (err: AWSError, data: Account.Types.TokenResponse) => void): Request<Account.Types.TokenResponse, AWSError>;
  /**
   *  Retrieves account credentials by temporary access token. 
   */
  getAccountByAccessToken(callback?: (err: AWSError, data: Account.Types.TokenResponse) => void): Request<Account.Types.TokenResponse, AWSError>;
  /**
   *  Prepares an url to perform Facebook login. Intended for web client. 
   */
  facebookPrepareLogin(callback?: (err: AWSError, data: Account.Types.FacebookPrepareLoginResponse) => void): Request<Account.Types.FacebookPrepareLoginResponse, AWSError>;
  /**
   *  Connects account to Facebook (exchanges temporary token to permanent one and ties it to account). Intended for web client. 
   */
  facebookConnect(params: Account.Types.FacebookConnectRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Connects account to Facebook (exchanges temporary token to permanent one and ties it to account). Intended for web client. 
   */
  facebookConnect(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Saved permanent Facebook token in account. Intended for mobile client. 
   */
  facebookMobileConnect(params: Account.Types.FacebookMobileConnectRequest, callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Saved permanent Facebook token in account. Intended for mobile client. 
   */
  facebookMobileConnect(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
  /**
   *  Accepts terms and conditions that are currently applicable. 
   */
  acceptTerms(callback?: (err: AWSError, data: Account.Types.Account) => void): Request<Account.Types.Account, AWSError>;
}
declare namespace Account {
  export type Id = string;
  export type IdList = Id[];
  export type Email = string;
  export type Campaign = string;
  export interface PhoneNumberRequest {
    phoneNumber: undefined;
  }
  export type Password = string;
  export type Query = string;
  export type Code = string;
  export type AccessToken = string;
  export type TokenPayload = string;
  export interface TokenRequest {
    payload?: TokenPayload;
  }
  export interface TokenContainer {
    token: AccessToken;
    expires?: Timestamp;
  }
  export interface TokenResponse {
    id?: Id;
    accessKeyId: undefined;
    secretAccessKey: undefined;
    email?: Email;
    friendlyId?: undefined;
    payload?: TokenPayload;
  }
  export type Timestamp = number;
  export interface EmailRequest {
    email: Email;
    campaign?: Campaign;
  }
  export interface IdStruct {
    id: Id;
  }
  export interface IdsRequestOptional {
    ids?: IdList;
  }
  export interface ActivationRequest {
    code: undefined;
  }
  export interface SearchRequest {
    query: Query;
  }
  export type Type = "ios"|"android"|string;
  export type Gender = "male"|"female"|"other"|"they"|string;
  export interface LoginRequest {
    email: Email;
    password: Password;
  }
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
  export interface CheckEmailResponse {
    exists: undefined;
  }
  export type AccountList = Account[];
  export type InvitationCode = string;
  export interface CreateRequest {
    email: Email;
    password: Password;
    invitationCode?: InvitationCode;
    firstName?: undefined;
    lastName?: undefined;
    gender?: Gender;
    birthday?: undefined;
    campaign?: Campaign;
    messagingAllowed?: undefined;
    roles?: AccountRoles;
    termsAccepted?: Timestamp;
  }
  export type EmailOptional = string;
  export interface UpdateRequest {
    email?: EmailOptional;
    password?: Password;
    firstName?: undefined;
    lastName?: undefined;
    gender?: Gender;
    birthday?: undefined;
    messagingAllowed?: undefined;
  }
  export interface ChangePasswordRequest {
    oldPassword: Password;
    newPassword: Password;
  }
  export interface ConfirmEmailResetRequest {
    code: Code;
  }
  export interface ChangeEmailRequest {
    password: Password;
    email: Email;
    campaign?: Campaign;
  }
  export interface PasswordResetRequest {
    code: Code;
    password: Password;
  }
  export interface PhoneVerificationRequest {
    code: undefined;
  }
  export type Stream = Buffer|Uint8Array|Blob|string;
  export interface UpdatePhotoRequest {
    body?: Stream;
  }
  export interface FacebookPrepareLoginResponse {
    url: undefined;
    client_id?: undefined;
    scope?: undefined;
    response_type?: undefined;
    state?: AccessToken;
    redirect_uri?: undefined;
  }
  export interface FacebookConnectRequest {
    state: AccessToken;
    token: undefined;
  }
  export interface FacebookMobileConnectRequest {
    token: undefined;
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
   * Contains interfaces for use with the Account client.
   */
  export import Types = Account;
}
export = Account;
