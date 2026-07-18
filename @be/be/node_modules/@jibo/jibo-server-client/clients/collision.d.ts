import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Collision extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Collision.Types.ClientConfiguration)
  config: Config & Collision.Types.ClientConfiguration;
  /**
   *  Matches name with existing ones. 
   */
  match(params: Collision.Types.MatchInput, callback?: (err: AWSError, data: Collision.Types.MatchOutput) => void): Request<Collision.Types.MatchOutput, AWSError>;
  /**
   *  Matches name with existing ones. 
   */
  match(callback?: (err: AWSError, data: Collision.Types.MatchOutput) => void): Request<Collision.Types.MatchOutput, AWSError>;
}
declare namespace Collision {
  export type Name = string;
  export type ExistingNames = Name[];
  export interface MatchInput {
    name: Name;
    existingNames: ExistingNames;
  }
  export interface MatchOutput {
    success: undefined;
    collision?: undefined;
    closest_pair?: Name;
    distance?: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-11-26"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Collision client.
   */
  export import Types = Collision;
}
export = Collision;
