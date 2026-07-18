import { Event } from 'jibo-typed-events';
import { Client } from './Client';
import { ServiceEvent, ListenTurnResult, NameTurnResult, EnrollmentTurnResult, ProactiveResponseData, NameSuccessTurnResult, NLUResult } from './Types';
/**
 * Enum of request statuses.
 * @typedef jibo.jetstream.request#RequestStatus
 * @prop ACTIVE Once a request has been sent.
 * @prop CANCELED Once a request has been canceled or unsubscribed.
 * @prop FINISHED When a request has finished (including due to error).
 */
export declare enum RequestStatus {
    ACTIVE = "ACTIVE",
    CANCELED = "CANCELED",
    FINISHED = "FINISHED",
    ERROR = "ERROR",
}
/**
 * @description The base type of request that the client makes to the Jetstream
 * service. Keeps track of requestID, status, events and errors
 * @class jibo.jetstream.request.Request
 * @hideconstructor
 */
export declare class Request {
    protected client: Client;
    /**
     * ID of the request.
     * @name jibo.jetstream.request.Request#id
     * @type {string}
     */
    id: string;
    /**
     * Status of the request.
     * @name jibo.jetstream.request.Request#status
     * @type {jibo.jetstream.request#RequestStatus}
     * @default RequestStatus.ACTIVE
     */
    status: RequestStatus;
    /**
     * Events attached to the request.
     * @name jibo.jetstream.request.Request#events
     * @type {Event<jibo.jetstream.types#ServiceEvent>}
     */
    events: Event<ServiceEvent>;
    /**
     * Error event attached to the request.
     * @name jibo.jetstream.request.Request#error
     * @type {Event<Error>}
     */
    error: Event<Error>;
    protected resolve: Function;
    constructor(client: Client, id: string);
}
/**
 * The request object returned by client when proactive request made
 * @export
 * @class jibo.jetstream.request.ProactiveRequest
 * @extends {jibo.jetstream.request.Request}
 * @hideconstructor
 */
export declare class ProactiveRequest extends Request {
    /**
     * @description This promise gets resolved when the proactive session is completed.
     * See [ProactiveResponseData](https://pegasus-api-docs.jibo.com/interfaces/proactiveresponsedata.html)
     * @name jibo.jetstream.request.ProactiveRequest#promise
     * @type {Promise<ProactiveResponseData>}
     */
    promise: Promise<ProactiveResponseData>;
    constructor(client: Client, id: string);
}
/**
 * The request object returned by client when listening turn is started
 * @export
 * @class jibo.jetstream.request.LocalTurnRequest
 * @extends {jibo.jetstream.request.Request}
 * @hideconstructor
 */
export declare class LocalTurnRequest extends Request {
    /**
     * Promise that will yield the results of the Local Turn
     * @name jibo.jetstream.request.LocalTurnRequest#promise
     * @type {Promise<jibo.jetstream.types#ListenTurnResult>}
     */
    promise: Promise<ListenTurnResult>;
    protected resolve: (data: ListenTurnResult) => void;
    constructor(client: Client, id: string);
    /**
     * Cancels an ongoing request
     * @returns {Promise<boolean>} `false` if the request could not be canceled.
     * @method jibo.jetstream.request.LocalTurnRequest#cancel
     */
    cancel(): Promise<boolean>;
    /**
     * Update (that is, force the completion of) an in-progress local turn with the given NLU or
     * ASR text information. This function is provided to allow a menu button push to simulate NLU
     * input to the skill. When invoked, the audio being streamed to the Hub is stopped and the Hub
     * accepts the provided ASR or NLU data as input. There is a potential race condition where the
     * given ASR/NLU data is sent to the Hub but the Hub receives the ASR or NLU result first,
     * which causes the update command to be ignored.
     * @param asrOrNlu {string|jibo.jetstream.types.NLUResult} An ASR string or NLU result to update the turn with.
     *   See [NLUResult](https://pegasus-api-docs.jibo.com/interfaces/nluresult.html)
     * @param [meta] {any} Metadata to be sent along for logging purposes.
     * @returns {Promise<void>}
     * @method jibo.jetstream.request.LocalTurnRequest#update
     */
    update(asrOrNlu: string | NLUResult, meta?: any): Promise<void>;
}
/**
 * The request object returned by client when global handler is subscribed
 * @export
 * @class jibo.jetstream.request.SubscribeGlobalRequest
 * @extends {jibo.jetstream.request.Request}
 * @hideconstructor
 */
export declare class SubscribeGlobalRequest extends Request {
    /**
     * Unsubscribes a global request
     * @returns {Promise<boolean>} `false` if the request could not be unsubscribed.
     * @method jibo.jetstream.request.SubscribeGlobalRequest#unsubscribe
     */
    unsubscribe(): Promise<boolean>;
}
/**
 * The request object returned by client when enrollment turn is started
 * @export
 * @class jibo.jetstream.request.EnrollmentTurnRequest
 * @extends {jibo.jetstream.request.Request}
 * @hideconstructor
 */
export declare class EnrollmentTurnRequest extends Request {
    /**
     * Promise that will yield the results of the Enrollment Turn
     * @name jibo.jetstream.request.EnrollmentTurnRequest#promise
     * @type {Promise<jibo.jetstream.types#EnrollmentTurnResult>}
     */
    promise: Promise<EnrollmentTurnResult>;
    /**
     * Ennrollment turn has started (ready for first HJ to be said)
     * @name jibo.jetstream.request.EnrollmentTurnRequest#ready
     * @type {Event<jibo.jetstream.types.EnrollmentCollectionResult>}
     */
    ready: Event<void>;
    protected resolve: (data: EnrollmentTurnResult) => void;
    constructor(client: Client, id: string);
    /**
     * Cancels an ongoing request
     * @returns {Promise<boolean>} `false` if the request could not be canceled.
     * @method jibo.jetstream.request.EnrollmentTurnRequest#cancel
     */
    cancel(): Promise<boolean>;
}
/**
 * The request object returned by client when name learning turn is started
 * @export
 * @class jibo.jetstream.request.NameLearningRequest
 * @extends {jibo.jetstream.request.Request}
 * @hideconstructor
 */
export declare class NameLearningRequest extends Request {
    /**
     * Promise that will yield the results of the Name Learning Turn
     * @name jibo.jetstream.request.NameLearningRequest#promise
     * @type {Promise<jibo.jetstream.types.NameSuccessTurnResult>}
     */
    promise: Promise<NameSuccessTurnResult>;
    protected resolve: (data: NameTurnResult) => void;
    constructor(client: Client, id: string);
    /**
     * Cancels an ongoing request
     * @returns {Promise<boolean>} `false` if the request could not be canceled.
     * @method jibo.jetstream.request.NameLearningRequest#cancel
     */
    cancel(): Promise<boolean>;
}
