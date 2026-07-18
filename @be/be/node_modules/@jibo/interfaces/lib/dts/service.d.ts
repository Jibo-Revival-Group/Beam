import * as jibo from './jibo';
/** A UUID string, example: `"123e4567-e89b-12d3-a456-426655440000"` */
export declare type UUID = string;
/** Semver type string, example: `"1.2.3"` */
export declare type Version = string;
export interface BaseMessage<T extends string, D> {
    /** The type of this message, describes what kind of data to expect */
    type: T;
    /** An id that is unique per message */
    msgID: UUID;
    /** A timestamp in number of milliseconds elapsed since 1 January 1970 00:00:00 UTC */
    ts: number;
    /** The data for this message */
    data: D;
}
export declare type BaseResponse<T extends string, D> = BaseMessage<T, D> & {
    final?: boolean;
    timings?: Timings;
};
export interface Timings {
    total: number;
    [x: string]: number;
}
export interface ContextData {
    runtime: jibo.runtime.RuntimeContext;
    skill: jibo.data.SkillData;
}
export interface BaseData extends ContextData {
    general: jibo.data.GeneralData;
}
export declare type ServiceError = BaseResponse<'ERROR', {
    message: string;
}>;
export interface IAuthDetails {
    /** Robot account ID */
    id: string;
    /** Account access key ID (Client ID) */
    accessKeyId: string;
    /** Account secret access key (Client Secret) */
    secretAccessKey: string;
    /** My-Friendly-Robot-Id */
    friendlyId?: string;
}
/**
 * The Jibo specific header values that are used to communicate
 * to services data that is needed (or adds value) to our logging
 */
export declare const Headers: {
    transID: string;
    robotID: string;
    loggingConfig: string;
};
