import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Key extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Key.Types.ClientConfiguration)
  config: Config & Key.Types.ClientConfiguration;
  /**
   *  Gets request (possibly with encrypted symmetrical key). 
   */
  getRequest(params: Key.Types.GetRequest, callback?: (err: AWSError, data: Key.Types.Request) => void): Request<Key.Types.Request, AWSError>;
  /**
   *  Gets request (possibly with encrypted symmetrical key). 
   */
  getRequest(callback?: (err: AWSError, data: Key.Types.Request) => void): Request<Key.Types.Request, AWSError>;
  /**
   *  Request all loop members to share symmetrical key. 
   */
  createRequest(params: Key.Types.CreateRequest, callback?: (err: AWSError, data: Key.Types.Request) => void): Request<Key.Types.Request, AWSError>;
  /**
   *  Request all loop members to share symmetrical key. 
   */
  createRequest(callback?: (err: AWSError, data: Key.Types.Request) => void): Request<Key.Types.Request, AWSError>;
  /**
   *  Shares symmetrical key with requesting account. 
   */
  share(params: Key.Types.ShareRequest, callback?: (err: AWSError, data: Key.Types.Request) => void): Request<Key.Types.Request, AWSError>;
  /**
   *  Shares symmetrical key with requesting account. 
   */
  share(callback?: (err: AWSError, data: Key.Types.Request) => void): Request<Key.Types.Request, AWSError>;
  /**
   *  Lists pending sharing requests for current account. 
   */
  listIncomingRequests(params: Key.Types.LoopIdRequest, callback?: (err: AWSError, data: Key.Types.Requests) => void): Request<Key.Types.Requests, AWSError>;
  /**
   *  Lists pending sharing requests for current account. 
   */
  listIncomingRequests(callback?: (err: AWSError, data: Key.Types.Requests) => void): Request<Key.Types.Requests, AWSError>;
  /**
   *  Detects if symmetrical key should be created. 
   */
  shouldCreate(params: Key.Types.LoopIdRequest, callback?: (err: AWSError, data: Key.Types.ShouldCreateResponse) => void): Request<Key.Types.ShouldCreateResponse, AWSError>;
  /**
   *  Detects if symmetrical key should be created. 
   */
  shouldCreate(callback?: (err: AWSError, data: Key.Types.ShouldCreateResponse) => void): Request<Key.Types.ShouldCreateResponse, AWSError>;
  /**
   *  Stores encrypted key. 
   */
  backup(params: Key.Types.BackupRequest, callback?: (err: AWSError, data: Key.Types.Backup) => void): Request<Key.Types.Backup, AWSError>;
  /**
   *  Stores encrypted key. 
   */
  backup(callback?: (err: AWSError, data: Key.Types.Backup) => void): Request<Key.Types.Backup, AWSError>;
  /**
   *  Retrieves encrypted key. 
   */
  restore(params: Key.Types.RestoreRequest, callback?: (err: AWSError, data: Key.Types.Backup) => void): Request<Key.Types.Backup, AWSError>;
  /**
   *  Retrieves encrypted key. 
   */
  restore(callback?: (err: AWSError, data: Key.Types.Backup) => void): Request<Key.Types.Backup, AWSError>;
  /**
   *  Lists pending binary decryption requests for current account. 
   */
  listBinaryRequests(params: Key.Types.LoopIdRequest, callback?: (err: AWSError, data: Key.Types.BinaryRequests) => void): Request<Key.Types.BinaryRequests, AWSError>;
  /**
   *  Lists pending binary decryption requests for current account. 
   */
  listBinaryRequests(callback?: (err: AWSError, data: Key.Types.BinaryRequests) => void): Request<Key.Types.BinaryRequests, AWSError>;
  /**
   *  Shares decrypted binary with requesting account. 
   */
  shareBinary(params: Key.Types.ShareBinaryRequest, callback?: (err: AWSError, data: Key.Types.BinaryRequest) => void): Request<Key.Types.BinaryRequest, AWSError>;
  /**
   *  Shares decrypted binary with requesting account. 
   */
  shareBinary(callback?: (err: AWSError, data: Key.Types.BinaryRequest) => void): Request<Key.Types.BinaryRequest, AWSError>;
}
declare namespace Key {
  export type Id = string;
  export type LoopId = string;
  export type AccountId = string;
  export type PublicKey = string;
  export interface ShareRequest {
    id: Id;
    encryptedKey: EncryptedKey;
    keyHash?: KeyHash;
  }
  export interface CreateRequest {
    loopId: LoopId;
    publicKey: PublicKey;
  }
  export interface Request {
    id: Id;
    accountId: AccountId;
    loopId: LoopId;
    publicKey: PublicKey;
    encryptedKey?: EncryptedKey;
  }
  export type Requests = Request[];
  export interface GetRequest {
    id: Id;
  }
  export interface LoopIdRequest {
    loopId: LoopId;
  }
  export type EncryptedKey = string;
  export type KeyHash = string;
  export type PasswordHash = string;
  export interface ShouldCreateResponse {
    shouldCreate: undefined;
  }
  export interface BackupRequest {
    loopId: LoopId;
    encryptedKey: EncryptedKey;
    passwordHash?: PasswordHash;
  }
  export interface RestoreRequest {
    loopId: LoopId;
    passwordHash?: PasswordHash;
  }
  export interface Backup {
    loopId: LoopId;
    accountId?: AccountId;
    encryptedKey: EncryptedKey;
  }
  export type Url = string;
  export interface BinaryRequest {
    id: Id;
    accountId: AccountId;
    loopId: LoopId;
    encryptedUrl: Url;
    decryptedUrl?: Url;
  }
  export type BinaryRequests = BinaryRequest[];
  export type Stream = Buffer|Uint8Array|Blob|string;
  export interface ShareBinaryRequest {
    body?: Stream;
    id: Id;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-02-01"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Key client.
   */
  export import Types = Key;
}
export = Key;
