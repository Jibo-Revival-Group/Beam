/**
 * @class ServiceError
 * @param platformErrorKey {string} Platform error key expected by platform error services
 * @param value {ErrorValue} Value of error for platform key. See expected format below.
 * @description Format of error expected by errors service
 */
export declare class ServiceError {
    key: string;
    value: ErrorValue;
    constructor(platformErrorKey: string, value: ErrorValue);
}
/**
 * @typedef ErrorType
 * @property UNKNOWN {number} Unknown error type.
 * @property EVENT {number} Event error type.
 * @property RECOVERABLE {number} Recoverable error type.
 * @description Types of errors to be reported
 */
export declare enum ErrorType {
    UNKNOWN = 0,
    EVENT = 1,
    RECOVERABLE = 2,
}
/**
 * @typedef ErrorStatus
 * @property UNKNOWN {number} Unknown status.
 * @property BROKEN {number} Broken status.
 * @property FIXED {number} Fixed status.
 * @description Status of errors to be reported.
 */
export declare enum ErrorStatus {
    UNKNOWN = 0,
    BROKEN = 1,
    FIXED = 2,
}
/**
 * @class ErrorValue
 * @param error {ErrorValue} an error to copy into this instance of ErrorValue
 * @description Value for each error expected by errors service
 */
export declare class ErrorValue {
    name: string;
    type: ErrorType;
    status: ErrorStatus;
    count: number;
    oldest: number[];
    newest: number[];
    constructor(name: string, type: ErrorType, status: ErrorStatus, count: number, oldest: number[], newest: number[]);
}
/**
 * @interface ServiceErrors
 * @description Format by which platform errors service expects an
 * array of errors to be reported.
 */
export declare class ServiceErrors {
    entries: ServiceError[];
    constructor(errors?: ServiceError[]);
}
