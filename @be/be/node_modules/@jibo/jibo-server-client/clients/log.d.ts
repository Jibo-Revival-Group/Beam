import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Log extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Log.Types.ClientConfiguration)
  config: Config & Log.Types.ClientConfiguration;
  /**
   *  Uploads a batch of log events to server. 
   */
  putEvents(params: Log.Types.PutEventsRequest, callback?: (err: AWSError, data: Log.Types.Response) => void): Request<Log.Types.Response, AWSError>;
  /**
   *  Uploads a batch of log events to server. 
   */
  putEvents(callback?: (err: AWSError, data: Log.Types.Response) => void): Request<Log.Types.Response, AWSError>;
  /**
   *  Gets uploadUrl to upload a RAW robot log file to S3. 
   */
  putEventsAsync(params: Log.Types.PutEventsAsyncRequest, callback?: (err: AWSError, data: Log.Types.PutEventsAsyncResponse) => void): Request<Log.Types.PutEventsAsyncResponse, AWSError>;
  /**
   *  Gets uploadUrl to upload a RAW robot log file to S3. 
   */
  putEventsAsync(callback?: (err: AWSError, data: Log.Types.PutEventsAsyncResponse) => void): Request<Log.Types.PutEventsAsyncResponse, AWSError>;
  /**
   *  Generates temporary credentials to upload logs to AWS Kinesis. 
   */
  newKinesisCredentials(params: Log.Types.NewKinesisCredentialsRequest, callback?: (err: AWSError, data: Log.Types.NewKinesisCredentialsResponse) => void): Request<Log.Types.NewKinesisCredentialsResponse, AWSError>;
  /**
   *  Generates temporary credentials to upload logs to AWS Kinesis. 
   */
  newKinesisCredentials(callback?: (err: AWSError, data: Log.Types.NewKinesisCredentialsResponse) => void): Request<Log.Types.NewKinesisCredentialsResponse, AWSError>;
  /**
   *  Uploads a binary that will be later associated with several log entries. 
   */
  putBinary(params: Log.Types.PutBinaryRequest, callback?: (err: AWSError, data: Log.Types.PutBinaryResponse) => void): Request<Log.Types.PutBinaryResponse, AWSError>;
  /**
   *  Uploads a binary that will be later associated with several log entries. 
   */
  putBinary(callback?: (err: AWSError, data: Log.Types.PutBinaryResponse) => void): Request<Log.Types.PutBinaryResponse, AWSError>;
  /**
   *  Gets uploadUrl to upload a binary that will be later associated with several log entries. 
   */
  putBinaryAsync(params: Log.Types.PutBinaryAsyncRequest, callback?: (err: AWSError, data: Log.Types.PutBinaryAsyncResponse) => void): Request<Log.Types.PutBinaryAsyncResponse, AWSError>;
  /**
   *  Gets uploadUrl to upload a binary that will be later associated with several log entries. 
   */
  putBinaryAsync(callback?: (err: AWSError, data: Log.Types.PutBinaryAsyncResponse) => void): Request<Log.Types.PutBinaryAsyncResponse, AWSError>;
  /**
   *  Gets uploadUrl to upload a binary that will be later associated with several log entries. 
   */
  putAsrBinary(params: Log.Types.PutAsrBinaryRequest, callback?: (err: AWSError, data: Log.Types.PutAsrBinaryResponse) => void): Request<Log.Types.PutAsrBinaryResponse, AWSError>;
  /**
   *  Gets uploadUrl to upload a binary that will be later associated with several log entries. 
   */
  putAsrBinary(callback?: (err: AWSError, data: Log.Types.PutAsrBinaryResponse) => void): Request<Log.Types.PutAsrBinaryResponse, AWSError>;
}
declare namespace Log {
  export type Timestamp = number;
  export type Payload = {[key: string]: any};
  export type Metadata = {[key: string]: undefined};
  export type EventMessage = string;
  export type Level = "error"|"warn"|"info"|"verbose"|"debug"|"silly"|string;
  export type Kind = "LOG"|"HEALTH"|string;
  export type Serial = string;
  export type ContentEncoding = "gzip"|string;
  export interface InputEvent {
    created: Timestamp;
    payload?: Payload;
    message?: EventMessage;
    level?: Level;
  }
  export type InputEvents = InputEvent[];
  export type DeviceId = string;
  export type TrackingId = string;
  export interface PutEventsRequest {
    trackingId?: TrackingId;
    deviceId?: DeviceId;
    events: InputEvents;
  }
  export type Response = string;
  export type Stream = Buffer|Uint8Array|Blob|string;
  export interface PutBinaryRequest {
    trackingId?: TrackingId;
    body?: Stream;
  }
  export interface PutBinaryResponse {
    path?: undefined;
    url: undefined;
  }
  export interface PutEventsAsyncRequest {
    kind: Kind;
    serial: Serial;
  }
  export interface PutEventsAsyncResponse {
    contentEncoding: ContentEncoding;
    uploadUrl: undefined;
  }
  export interface PutBinaryAsyncRequest {
    trackingId?: TrackingId;
  }
  export interface PutBinaryAsyncResponse {
    path?: undefined;
    url: undefined;
    uploadUrl: undefined;
  }
  export interface PutAsrBinaryRequest {
    trackingId: TrackingId;
    metadata?: Metadata;
  }
  export interface PutAsrBinaryResponse {
    bucketName: undefined;
    key: undefined;
    metadata?: Metadata;
    uploadUrl: undefined;
  }
  export interface NewKinesisCredentialsRequest {
  }
  export interface NewKinesisCredentialsResponse {
    credentials: StsCredentials;
    region: undefined;
    streamName: undefined;
  }
  export interface StsCredentials {
    AccessKeyId: undefined;
    Expiration: undefined;
    SecretAccessKey: undefined;
    SessionToken: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2015-03-09"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Log client.
   */
  export import Types = Log;
}
export = Log;
