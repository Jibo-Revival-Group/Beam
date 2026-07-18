import {Request} from '../lib/request';
import {Response} from '../lib/response';
import {AWSError} from '../lib/error';
import {Service} from '../lib/service';
import {ServiceConfigurationOptions} from '../lib/service';
import {ConfigBase as Config} from '../lib/config';
interface Blob {}
declare class Person extends Service {
  /**
   * Constructs a service object. This object has one method for each API operation.
   */
  constructor(options?: Person.Types.ClientConfiguration)
  config: Config & Person.Types.ClientConfiguration;
  /**
   *  Lists questions. 
   */
  list(params: Person.Types.ListRequest, callback?: (err: AWSError, data: Person.Types.ListResponse) => void): Request<Person.Types.ListResponse, AWSError>;
  /**
   *  Lists questions. 
   */
  list(callback?: (err: AWSError, data: Person.Types.ListResponse) => void): Request<Person.Types.ListResponse, AWSError>;
  /**
   *  Logs answer. 
   */
  answer(params: Person.Types.AnswerObject, callback?: (err: AWSError, data: Person.Types.AnswerObject) => void): Request<Person.Types.AnswerObject, AWSError>;
  /**
   *  Logs answer. 
   */
  answer(callback?: (err: AWSError, data: Person.Types.AnswerObject) => void): Request<Person.Types.AnswerObject, AWSError>;
  /**
   * Enables holidays in the loop
   */
  enableHolidays(params: Person.Types.HolidayIdsRequest, callback?: (err: AWSError, data: Person.Types.EnableDisableResult) => void): Request<Person.Types.EnableDisableResult, AWSError>;
  /**
   * Enables holidays in the loop
   */
  enableHolidays(callback?: (err: AWSError, data: Person.Types.EnableDisableResult) => void): Request<Person.Types.EnableDisableResult, AWSError>;
  /**
   * Lists holidays for the loop
   */
  listHolidays(params: Person.Types.ListHolidaysRequest, callback?: (err: AWSError, data: Person.Types.Holidays) => void): Request<Person.Types.Holidays, AWSError>;
  /**
   * Lists holidays for the loop
   */
  listHolidays(callback?: (err: AWSError, data: Person.Types.Holidays) => void): Request<Person.Types.Holidays, AWSError>;
  /**
   * Disables holidays in the loop
   */
  disableHolidays(params: Person.Types.HolidayIdsRequest, callback?: (err: AWSError, data: Person.Types.EnableDisableResult) => void): Request<Person.Types.EnableDisableResult, AWSError>;
  /**
   * Disables holidays in the loop
   */
  disableHolidays(callback?: (err: AWSError, data: Person.Types.EnableDisableResult) => void): Request<Person.Types.EnableDisableResult, AWSError>;
  /**
   * Sets property value for a key and account.
   */
  setLoopProperty(params: Person.Types.SetLoopPropertyRequest, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   * Sets property value for a key and account.
   */
  setLoopProperty(callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   * Gets property by a key for account.
   */
  getLoopProperties(params: Person.Types.GetLoopPropertiesRequest, callback?: (err: AWSError, data: Person.Types.PropertyMap) => void): Request<Person.Types.PropertyMap, AWSError>;
  /**
   * Gets property by a key for account.
   */
  getLoopProperties(callback?: (err: AWSError, data: Person.Types.PropertyMap) => void): Request<Person.Types.PropertyMap, AWSError>;
  /**
   * Sets property value for a key and account.
   */
  setAccountProperty(params: Person.Types.SetAccountPropertyRequest, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   * Sets property value for a key and account.
   */
  setAccountProperty(callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError>;
  /**
   * Gets property by a key for account.
   */
  getAccountProperties(params: Person.Types.GetAccountPropertiesRequest, callback?: (err: AWSError, data: Person.Types.PropertyMap) => void): Request<Person.Types.PropertyMap, AWSError>;
  /**
   * Gets property by a key for account.
   */
  getAccountProperties(callback?: (err: AWSError, data: Person.Types.PropertyMap) => void): Request<Person.Types.PropertyMap, AWSError>;
  /**
   * Lists property keys for account.
   */
  listAccountPropertyKeys(callback?: (err: AWSError, data: Person.Types.ListAccountPropertyKeysResult) => void): Request<Person.Types.ListAccountPropertyKeysResult, AWSError>;
}
declare namespace Person {
  export type MemberId = string;
  export type LoopId = string;
  export type Key = string;
  export type OptionKey = string;
  export type Image = string;
  export type Question = string;
  export type Answer = string;
  export type Category = "app"|string;
  export type Timestamp = number;
  export type PropertyKey = string;
  export type PropertyKeyList = PropertyKey[];
  export type PropertyValue = {[key: string]: any};
  export type PropertyMap = {[key: string]: undefined};
  export interface SetLoopPropertyRequest {
    loopId: LoopId;
    key: PropertyKey;
    value: PropertyValue;
  }
  export interface GetLoopPropertiesRequest {
    loopId: LoopId;
    keys: PropertyKeyList;
  }
  export interface SetAccountPropertyRequest {
    key: PropertyKey;
    value: PropertyValue;
  }
  export interface GetAccountPropertiesRequest {
    keys: PropertyKeyList;
  }
  export interface ListAccountPropertyKeysResult {
    keys: PropertyKeyList;
  }
  export interface ListRequest {
    category: Category;
  }
  export interface OptionObject {
    key: OptionKey;
    answer?: Answer;
    image?: Image;
  }
  export type OptionsList = OptionObject[];
  export interface QuestionObject {
    key: Key;
    question: Question;
    options?: OptionsList;
  }
  export type ListResponse = QuestionObject[];
  export interface AnswerObject {
    key: Key;
    answer: Answer;
  }
  export type HolidayId = string;
  export type HolidayEventId = string;
  export type HolidayIds = HolidayId[];
  export type HolidayName = string;
  export type HolidayCategory = string;
  export type HolidayDate = string;
  export type IsEnabled = boolean;
  export interface Holiday {
    id: HolidayId;
    eventId?: HolidayEventId;
    name: HolidayName;
    category: HolidayCategory;
    subcategory?: HolidayCategory;
    loopId: LoopId;
    memberId?: MemberId;
    isEnabled?: IsEnabled;
    date?: HolidayDate;
    endDate?: HolidayDate;
    created?: Timestamp;
  }
  export type Holidays = Holiday[];
  export interface HolidayIdsRequest {
    ids: HolidayIds;
    loopId: LoopId;
  }
  export interface ListHolidaysRequest {
    loopId: LoopId;
  }
  export interface EnableDisableResult {
    result: undefined;
  }
  /**
   * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
   */
  export type apiVersion = "2016-08-01"|"latest"|string;
  export interface ClientApiVersions {
    /**
     * A string in YYYY-MM-DD format that represents the latest possible API version that can be used in this service. Specify 'latest' to use the latest possible version.
     */
    apiVersion?: apiVersion;
  }
  export type ClientConfiguration = ServiceConfigurationOptions & ClientApiVersions;
  /**
   * Contains interfaces for use with the Person client.
   */
  export import Types = Person;
}
export = Person;
