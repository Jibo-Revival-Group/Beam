import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class NLP extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: NLP.Types.ClientConfiguration)
  config: Config & NLP.Types.ClientConfiguration;
  /**
   *  Tags parts of speech. 
   */
  partOfSpeech(params: NLP.Types.QuestionRequest, callback?: (err: AWSError, data: NLP.Types.PartOfSpeechResponse) => void): Request<NLP.Types.PartOfSpeechResponse, AWSError>;
  /**
   *  Tags parts of speech. 
   */
  partOfSpeech(callback?: (err: AWSError, data: NLP.Types.PartOfSpeechResponse) => void): Request<NLP.Types.PartOfSpeechResponse, AWSError>;
  /**
   * 
   */
  namedEntityRecognition(params: NLP.Types.QuestionRequest, callback?: (err: AWSError, data: NLP.Types.NamedEntitiesResponse) => void): Request<NLP.Types.NamedEntitiesResponse, AWSError>;
  /**
   * 
   */
  namedEntityRecognition(callback?: (err: AWSError, data: NLP.Types.NamedEntitiesResponse) => void): Request<NLP.Types.NamedEntitiesResponse, AWSError>;
}
declare namespace NLP {
  export interface QuestionRequest {
    Input: undefined;
  }
  export interface PartOfSpeech {
    word?: undefined;
    pos?: undefined;
  }
  export type PartsOfSpeech = PartOfSpeech[];
  export interface PartOfSpeechResponse {
    partsOfSpeech: PartsOfSpeech;
  }
  export interface NamedEntity {
    start?: undefined;
    end?: undefined;
    label?: undefined;
    text?: undefined;
  }
  export type NamedEntities = NamedEntity[];
  export interface NamedEntitiesResponse {
    namedEntities: NamedEntities;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-10-31"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the NLP client.
   */
  export import Types = NLP;
}
export = NLP;
