export declare type ErrorCode = 'UNEXPECTED' | 'UNAUTHORIZED' | 'INVALID_URL' | 'ECONNREFUSED' | 'WRITE_ERROR' | 'READ_ERROR' | 'ERROR';
/** Namespace for mapping error codes */
export declare namespace ErrorCode {
    const INVALID_URL: ErrorCode;
    const UNAUTHORIZED: ErrorCode;
    const UNEXPECTED: ErrorCode;
    const ECONNREFUSED: ErrorCode;
    const WRITE_ERROR: ErrorCode;
    const READ_ERROR: ErrorCode;
    const ERROR: ErrorCode;
}
export interface RequestError {
    code: ErrorCode;
    message: string;
}
export interface HttpResponse {
    statusCode: number;
    body: any;
}
