import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class GQA extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: GQA.Types.ClientConfiguration)
  config: Config & GQA.Types.ClientConfiguration;
  /**
   *  Asks general question. 
   */
  question(params: GQA.Types.QuestionRequest, callback?: (err: AWSError, data: GQA.Types.QuestionResponse) => void): Request<GQA.Types.QuestionResponse, AWSError>;
  /**
   *  Asks general question. 
   */
  question(callback?: (err: AWSError, data: GQA.Types.QuestionResponse) => void): Request<GQA.Types.QuestionResponse, AWSError>;
  /**
   *  Retrieves attribution data. 
   */
  listAttribution(params: GQA.Types.ListAttributionRequest, callback?: (err: AWSError, data: GQA.Types.ListAttributionResponse) => void): Request<GQA.Types.ListAttributionResponse, AWSError>;
  /**
   *  Retrieves attribution data. 
   */
  listAttribution(callback?: (err: AWSError, data: GQA.Types.ListAttributionResponse) => void): Request<GQA.Types.ListAttributionResponse, AWSError>;
}
declare namespace GQA {
  export interface QuestionRequest {
    Input: undefined;
    Intent?: undefined;
    Latitude?: undefined;
    Longitude?: undefined;
    Country?: undefined;
    HasKid?: undefined;
    Timezone?: undefined;
  }
  export interface QuestionResponse {
    success: undefined;
    source?: undefined;
    answer?: undefined;
    message?: undefined;
    type?: undefined;
    timestamps?: GQATimestamps;
    response?: undefined;
    version?: undefined;
  }
  export interface GQATimestamps {
    receive_request: Timestamp;
    return_response?: Timestamp;
    bing_request?: Timestamp;
    bing_response?: Timestamp;
    wiki_request?: Timestamp;
    wiki_response?: Timestamp;
    wolfram_request?: Timestamp;
    wolfram_response?: Timestamp;
  }
  export type Timestamp = number;
  export interface ListAttributionRequest {
    ID: undefined;
    Service?: undefined;
    after?: Timestamp;
    before?: Timestamp;
  }
  export interface ListAttributionResponse {
    data: Attributions;
  }
  export type Attributions = Attribution[];
  export interface Attribution {
    service?: undefined;
    query?: undefined;
    url?: undefined;
    image_url?: undefined;
    robot_id?: undefined;
    timestamp?: Timestamp;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-09-30"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the GQA client.
   */
  export import Types = GQA;
}
export = GQA;
