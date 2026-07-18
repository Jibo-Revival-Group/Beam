import * as interfaces from '@jibo/interfaces';
export import NewArrivalRequestData = interfaces.proactive.NewArrivalRequestData;
export import SurpriseRequestData = interfaces.proactive.SurpriseRequestData;
export import ProactiveRequestData = interfaces.proactive.ProactiveRequestData;
export import ProactiveResponseData = interfaces.proactive.ProactiveResponseData;
export import ProactiveTriggerSource = interfaces.proactive.TriggerSource;
export import ListenMessageData = interfaces.hub.request.ListenMessageData;
export import ListenMessageMode = interfaces.hub.request.ListenMessageMode;
export import ASRResult = interfaces.asr.ASRResult;
export import ASRAnnotation = interfaces.asr.ASRAnnotation;
export import NLUResult = interfaces.nlu.NLUResult;
export import GlobalMatchResponseData = interfaces.common.GlobalMatchResponseData;
export import SkillActionData = interfaces.skill.response.SkillActionData;
export import SkillRedirectData = interfaces.hub.response.SkillRedirectData;
export import ListenResultState = interfaces.hub.response.ListenResultState;
import BaseListenResult = interfaces.hub.response.ListenResult;
export declare const GLOBAL_REQUEST = "GLOBAL";
/**
 * ListenTurnResult type
 * ```
 *  BaseTurnResult<TurnResultType.INTERRUPTED> |
 *  BaseTurnResult<TurnResultType.CANCELED> |
 *  BaseTurnResult<TurnResultType.TIMEOUT> |
 *  FailedTurnResult |
 *  SuccessTurnResult
 * ```
 * @typedef jibo.jetstream.types#ListenTurnResult
 */
export declare type ListenTurnResult = BaseTurnResult<TurnResultType.INTERRUPTED> | BaseTurnResult<TurnResultType.CANCELED> | BaseTurnResult<TurnResultType.TIMEOUT> | FailedTurnResult | SuccessTurnResult;
/**
 * NameTurnResult type
 * ```
 *  BaseTurnResult<TurnResultType.INTERRUPTED> |
 *  BaseTurnResult<TurnResultType.CANCELED> |
 *  BaseTurnResult<TurnResultType.TIMEOUT> |
 *  FailedTurnResult |
 *  NameSuccessTurnResult
 * ```
 * @typedef jibo.jetstream.types#NameTurnResult
 */
export declare type NameTurnResult = BaseTurnResult<TurnResultType.INTERRUPTED> | BaseTurnResult<TurnResultType.CANCELED> | BaseTurnResult<TurnResultType.TIMEOUT> | FailedTurnResult | NameSuccessTurnResult;
/**
 * EnrollnentTurnResult type
 *  ```
 *  BaseTurnResult<TurnResultType.INTERRUPTED> |
 *  BaseTurnResult<TurnResultType.CANCELED> |
 *  BaseTurnResult<TurnResultType.TIMEOUT> |
 *  FailedTurnResult |
 *  EnrollmentSuccessTurnResult
 * ```
 * @typedef jibo.jetstream.types#EnrollmentTurnResult
 */
export declare type EnrollmentTurnResult = BaseTurnResult<TurnResultType.INTERRUPTED> | BaseTurnResult<TurnResultType.CANCELED> | BaseTurnResult<TurnResultType.TIMEOUT> | FailedTurnResult | EnrollmentSuccessTurnResult;
/**
 * All turn result types.
 * <br /> {@link jibo.jetstream.types#ListenTurnResult} |
 * {@link jibo.jetstream.types#EnrollmentTurnResult} |
 * {@link jibo.jetstream.types#NameTurnResult}
 * @typedef jibo.jetstream.types#TurnResult
 */
export declare type TurnResult = ListenTurnResult | EnrollmentTurnResult | NameTurnResult;
/**
 * ServiceEvent type. </br>
 * ```
 *   BaseServiceEvent<ServiceEventType.EOS, void> |
 *   BaseServiceEvent<ServiceEventType.SOS, void> |
 *   BaseServiceEvent<ServiceEventType.ERROR, ErrorData> |
 *   BaseServiceEvent<ServiceEventType.SPEAKER_ID, SpeakerIDData> |
 *   BaseServiceEvent<ServiceEventType.HJ_HEARD, void> |
 *   BaseServiceEvent<ServiceEventType.HJ_ONLY, void> |
 *   BaseServiceEvent<ServiceEventType.TURN_STARTED, void> |
 *   BaseServiceEvent<ServiceEventType.TURN_RESULT, TurnResult> |
 *   BaseServiceEvent<ServiceEventType.TURN_RESULT, NameTurnResult> |
 *   BaseServiceEvent<ServiceEventType.TURN_RESULT, EnrollmentTurnResult> |
 *   BaseServiceEvent<ServiceEventType.SKILL_ACTION, SkillResponseData> |
 *   BaseServiceEvent<ServiceEventType.PROACTIVE, ProactiveResponseData> |
 *   BaseServiceEvent<ServiceEventType.SPEAKER_ENROLLMENT, EnrollmentCollectionResult>
 * ```
 * @typedef jibo.jetstream.types#ServiceEvent
 */
export declare type ServiceEvent = BaseServiceEvent<ServiceEventType.EOS, void> | BaseServiceEvent<ServiceEventType.SOS, void> | BaseServiceEvent<ServiceEventType.ERROR, ErrorData> | BaseServiceEvent<ServiceEventType.SPEAKER_ID, SpeakerIDData> | BaseServiceEvent<ServiceEventType.HJ_HEARD, void> | BaseServiceEvent<ServiceEventType.HJ_ONLY, void> | BaseServiceEvent<ServiceEventType.TURN_STARTED, void> | BaseServiceEvent<ServiceEventType.TURN_RESULT, TurnResult> | BaseServiceEvent<ServiceEventType.SKILL_ACTION, SkillActionData> | BaseServiceEvent<ServiceEventType.SKILL_REDIRECT, SkillRedirectData> | BaseServiceEvent<ServiceEventType.PROACTIVE, ProactiveResponseData> | BaseServiceEvent<ServiceEventType.SPEAKER_ENROLLMENT, EnrollmentCollectionResult>;
/**
 * Enum of hotword listen modes.
 * @typedef jibo.jetstream.types.HotwordListenMode
 * @prop Disabled `0` HJ listening is disabled entirely, including cloud listening in response.
 * @prop HJ_Only HJ listening is enabled, but no cloud listening will take place in response to HJ.
 * @prop ASR_Only When cloud listening in response to HJ, no `NLU/API.AI` parsing is done, just the
 *      ASR is returned.
 * @prop Custom_NLU_Only When cloud listening in response to HJ, ONLY rules added at `Custom_NLU_Only`
 *      levels are used for `API.AI` parsing.
 * @prop Custom_NLU_Added When cloud listening in response to HJ, rules added at `Custom_NLU_Added `
 *      levels are used for `API.AI` parsing on top of the normal globals.
 * @prop Normal Default mode, HJ listening is enabled as well as cloud listening with global
 *      rules in response.
 */
export declare enum HotwordListenMode {
    Disabled = 0,
    HJ_Only = 1,
    ASR_Only = 2,
    Custom_NLU_Only = 3,
    Custom_NLU_Added = 4,
    Normal = 5,
}
/**
 * @typedef jibo.jetstream.types.TurnResultType
 * @prop SUCCEEDED
 * @prop INTERRUPTED
 * @prop CANCELED
 * @prop FAILED
 * @prop TIMEOUT
 */
export declare enum TurnResultType {
    SUCCEEDED = "SUCCEEDED",
    INTERRUPTED = "INTERRUPTED",
    CANCELED = "CANCELED",
    FAILED = "FAILED",
    TIMEOUT = "TIMEDOUT",
}
/**
 * Enum of service event types
 * @typedef jibo.jetstream.types.ServiceEventType
 * @prop EOS End of speech
 * @prop SOS Start of speech
 * @prop ERROR Error
 * @prop SPEAKER_ID Speaker ID
 * @prop HJ_Heard Heard "hey jibo"
 * @prop HJ_Only Heard "Hey Jibo" and nothing else
 * @prop SKILL_ACTION Cloud skill action
 * @prop SKILL_REDIRECT Cloud skill redirect
 * @prop TURN_STARTED Turn started
 * @prop TURN_RESULT Turn result
 * @prop PROACTIVE Proactive
 */
export declare enum ServiceEventType {
    EOS = "EOS",
    SOS = "SOS",
    ERROR = "ERROR",
    SPEAKER_ID = "SPEAKER_ID",
    HJ_HEARD = "HJ_HEARD",
    HJ_ONLY = "HJ_ONLY",
    SKILL_ACTION = "SKILL_ACTION",
    SKILL_REDIRECT = "SKILL_REDIRECT",
    TURN_STARTED = "TURN_STARTED",
    TURN_RESULT = "TURN_RESULT",
    PROACTIVE = "PROACTIVE",
    SPEAKER_ENROLLMENT = "SPEAKER_ENROLLMENT",
}
/**
 * Information on how to contact Hub.
 * @interface jibo.jetstream.types.HostOptions
 * @prop hostname {string} Host name of Hub service (ex. `localhost`)
 * @prop port {number} Hub port number.
 */
export interface HostOptions {
    hostname: string;
    port: number;
}
/**
 * Base interface for the different Service event types.
 * @interface jibo.jetstream.types.BaseServiceEvent
 * @prop type {jibo.jetstream.types.ServiceEventType} ServiceEventType enum.
 * @prop requestID {string} Either `GLOBAL` or a specific turn requestID.
 * @prop transID {string} The transaction ID associated with this hub transaction
 * @prop ts {number} Timestamp at sending time.
 * @prop data {any} Payload, depending on `type`.
 */
export interface BaseServiceEvent<T extends ServiceEventType, D> {
    type: T;
    requestID: string;
    transID: string;
    ts: number;
    data: D;
}
/**
 * Interface for skill switching results.
 * @interface jibo.jetstream.types.SkillSwitchResult
 * @prop skillID {string} Unique ID of the skill
 * @prop [onRobot] {boolean} `true` if skill is on robot, `false` for cloud skill.
 * @prop [isProactive] {boolean} `true` if skill is proactively launched
 * @prop [skipSurprises] {boolean} `true` if after this skill exits surprises should be skipped
 * @prop [transID] {string} The transaction ID associated with this hub transaction
 * @prop data {jibo.jetstream.types.ListenResult} Results from a turn of dialog
 * @intdocs
 */
export interface SkillSwitchResult {
    skillID: string;
    onRobot?: boolean;
    isProactive?: boolean;
    skipSurprises?: boolean;
    transID?: string;
    data: ListenResult;
}
/**
 * @interface jibo.jetstream.types.MimicGlobalTurnOptions
 * @prop [clientASR] {string} The ASR text result desired from this turn. If present, no audio will be sent to the hub.
 * @prop [clientNLU] {jibo.jetstream.types.NLUResult} The semantic result desired from this turn. If present, no audio will be sent to the hub.
 * @prop [language] {string} ISO language label, e.g. "en-US"
 * @prop [suppressedEvents] {jibo.jetstream.types.ServiceEventType[]} List of event names to suppress during this turn. It is suggested that this not be used by skills.
 */
export interface MimicGlobalTurnOptions {
    clientASR?: string;
    clientNLU?: interfaces.nlu.NLUResult;
    language?: string;
    suppressedEvents?: ServiceEventType[];
}
/**
 * Interface for local turn options.
 * @interface jibo.jetstream.types.LocalTurnOptions
 * @prop nluRules {string[]} A list of API.AI contexts.
 * @prop [ignoreHJ] {boolean} If HJ can interrupt cloud listen.
 * @prop [rejectIfBusy] {boolean} Reject this request if Jetstream is busy. Default false.
 * @prop [meta] {any} An arbitrary JSON object for caller data, passed back in result.
 * @prop [earlyEOS] {string[]} A list of phrases that cause EOS to be detected.
 * @prop [hintPhrases] {string[]} A list of phrases that ASR will be biased towards detecting.
 * @prop [clientASR] {string} The ASR text result desired from this turn. If present, no audio will be sent to the hub.
 * @prop [clientNLU] {jibo.jetstream.types.NLUResult} The semantic result desired from this turn.
 * If present, no audio will be sent to the hub. </br> See [NLUResult](https://pegasus-api-docs.jibo.com/interfaces/nluresult.html)
 * @prop [log] {any} Arbitrary JSON object to be attached to logs related to this turn
 * @prop [language] {string} ISO language label, e.g. "en-US"
 * @prop [ignoreGlobalRules=false] {boolean} If active global rules should not be allowed during this turn.
 * @prop [suppressedEvents] {jibo.jetstream.types.ServiceEventType[]} List of event names to suppress during this turn. It is suggested that this not be used by skills.
 * @prop [sosTimeout] {number} The period of time to wait (in seconds) for the Start Of Speech after starting to listen. If speech is not heard within this period, the turn completes with a status of TIMEOUT and message of "sos". If this property is set to -1 (or not provided) the value used is the one found in the jibo-jetstream-service.json file.
 * @prop [maxSpeechTimeout] {number} The maximum number of seconds that a user may speak. If the user speaks for more than this number of seconds, the turn completes with a status of TIMEOUT and message of "maxSpeech". As with sosTimeout, a value of -1 causes the config file property to be used.
 */
export interface LocalTurnOptions {
    nluRules: string[];
    ignoreHJ?: boolean;
    rejectIfBusy?: boolean;
    meta?: any;
    earlyEOS?: string[];
    hintPhrases?: string[];
    clientASR?: string;
    clientNLU?: interfaces.nlu.NLUResult;
    log?: any;
    language?: string;
    ignoreGlobalRules?: boolean;
    suppressedEvents?: ServiceEventType[];
    sosTimeout?: number;
    maxSpeechTimeout?: number;
}
/**
 * Interface for local turn updates.
 * @interface jibo.jetstream.types.LocalTurnUpdate
 * @prop requestID {string} The requestID of the in-progress turn to be updated.
 *       If the turn for the given requestID is no longer active, this call is ignored.
 * @prop [meta] {any} An arbitrary JSON object for caller data, passed back in result.
 * @prop [clientASR] {string} The ASR text result desired from this turn.
 *      This is a simple string of words, equivalent to what the ASR returns.
 *      Only one of the clientASR and clientNLU properties should be provided,
 *      if both are provided only the clientNLU property will be used.
 * @prop [clientNLU] {jibo.jetstream.types.NLUResult} The semantic result desired from this turn.
 *      This will be the same JSON schema that arrives as the `data.result.nlu`
 *      field in a successful TURN_RESULT message.
 *      </br> See [NLUResult](https://pegasus-api-docs.jibo.com/interfaces/nluresult.html)
 */
export interface LocalTurnUpdate {
    requestID: string;
    meta?: any;
    clientASR?: string;
    clientNLU?: interfaces.nlu.NLUResult;
}
/**
 * Interface for speaker recognition results.
 * @interface jibo.jetstream.types.SpeakerRecogResult
 * @prop speaker {string} The ID string used to enroll this speaker.
 * @prop score {number} authentication score (not useful without knowing the threshold)
 * @prop accepted {boolean} If true, this speaker's score was high enough to be considered "recognized"
 * @prop high_confidence {boolean} If true, this speaker's score was either high enough that the system
 *      is confident in accepting it, or low enough that it is confident in rejecting it.
 */
export interface SpeakerRecogResult {
    speaker: string;
    score: number;
    accepted: boolean;
    high_confidence: boolean;
}
/**
 * Speaker ID is emitted only if there are enrolled speakers.
 * @interface jibo.jetstream.types.SpeakerIDData
 * @prop speakers {jibo.jetstream.types.SpeakerRecogResult[]} An array of SpeakerRecogResult
 *      objects (sorted in descending score order) with one entry for each enrolled speaker
 *      that states how well that speaker was recognized.
 * @prop snr {number} The estimated signal-to-noise ratio of the HJ input used in the
 *      speaker recognition operation.
 */
export interface SpeakerIDData {
    speakers: SpeakerRecogResult[];
    snr: number;
}
/**
 * Interface to Hub for an individual speaker recognition result.
 * @interface jibo.jetstream.types.HubSpeakerRecogResult
 * @prop {string} id - The ID string used to enroll this speaker.
 * @prop {number} score - Authentication score (not useful without knowing the threshold)
 * @prop {boolean} high_confidence - If `true`, this speaker's score was either high enough that the system
 *      is confident in accepting it, or low enough that it is confident in rejecting it.
 */
export interface HubSpeakerRecogResult {
    id: string;
    score: number;
    high_confidence: boolean;
}
/**
 * Interface to Hub for speaker recognition results, filtered and sorted by confidence.
 * @interface jibo.jetstream.types.HubSpeakerRecogResults
 * @prop {jibo.jetstream.types.HubSpeakerRecogResult[]} accepted - List of speakers ID'd that are
 * above a certain confidence threshold.
 */
export interface HubSpeakerRecogResults {
    accepted: HubSpeakerRecogResult[];
}
/**
 * Base interface for turn results
 * @interface jibo.jetstream.types.BaseTurnResult
 * @prop {jibo.jetstream.types.TurnResultType} status - Status of turn result
 * @prop {boolean} global - `true` if the turn is global
 * @prop {string} [transID] - Transaction id of turn result (if available)
 */
export interface BaseTurnResult<T extends TurnResultType> {
    status: T;
    global: boolean;
    transID?: string;
}
/**
 * Where {@link jibo.jetstream.types.TurnResultType} = `FAILED`
 * @interface jibo.jetstream.types.FailedTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 * @prop message {string} Message providing information on error/failure.
 */
export interface FailedTurnResult extends BaseTurnResult<TurnResultType.FAILED> {
    message: string;
}
/**
 * @description Where {@link jibo.jetstream.types.TurnResultType} = `SUCCEEDED` from a local or global turn.
 * @interface jibo.jetstream.types.SuccessTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 * @prop result.asr {ASRResult} [ASRResult](https://pegasus-api-docs.jibo.com/interfaces/asrresult.html)
 * @prop result.nlu {NLUResult} [NLUResult](https://pegasus-api-docs.jibo.com/interfaces/nluresult.html)
 * @prop [result.match] {GlobalMatchResponseData} [GlobalMatchResponseData](https://pegasus-api-docs.jibo.com/interfaces/globalmatchresponsedata.html)
 */
export interface SuccessTurnResult extends BaseTurnResult<TurnResultType.SUCCEEDED> {
    result: ListenResult;
}
/**
 * @description Where {@link jibo.jetstream.types.TurnResultType} = `SUCCEEDED` from a name learning turn.
 * @interface jibo.jetstream.types.NameSuccessTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 * @prop message {string} The learned pronunciation
 */
export interface NameSuccessTurnResult extends BaseTurnResult<TurnResultType.SUCCEEDED> {
    message: string;
}
/**
 * @description Where {@link jibo.jetstream.types.TurnResultType} = `SUCCEEDED` from a voice enrollment turn.
 * @interface jibo.jetstream.types.EnrollmentSuccessTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 */
export interface EnrollmentSuccessTurnResult extends BaseTurnResult<TurnResultType.SUCCEEDED> {
}
/**
 * Interface for options around enabling/disabling 'Hey Jibo' listening.
 * @interface jibo.jetstream.types.SetHJEnabledOptions
 * @prop enabled {boolean} `true` if 'Hey Jibo' listening should be enabled.
 */
export interface SetHJEnabledOptions {
    enabled: boolean;
}
/**
 * @description Provides the SkillID of the CloudSkill that matched the NLU in addition.
 *      </br> Extends [GlobalMatchResponseData](https://pegasus-api-docs.jibo.com/interfaces/globalmatchresponsedata.html)
 * @interface jibo.jetstream.types.GlobalAndCloudMatchResponseData
 * @extends GlobalMatchResponseData
 * @prop [cloudSkill] {string} - SkillID of Cloud Skill
 */
export interface GlobalAndCloudMatchResponseData extends GlobalMatchResponseData {
    cloudSkill?: string;
}
/**
 * Generic interface for error/failure data.
 * @interface jibo.jetstream.types.ErrorData
 * @prop message {string} Message providing information on error/failure.
 * @intdocs
 */
export interface ErrorData {
    message: string;
}
/**
 * Interface for subscribing to global options.
 * @interface jibo.jetstream.types.SubscribeGlobalOptions
 * @prop nluRules {string[]} One or more NLU rules to subscribe to.
 * @prop [meta] {any} An arbitrary JSON object for caller data, passed back in result.
 * @prop [language] {string} The language of transcription: `'en-US'` , `'ja-JP'`, or `'zh-CN'`.
 * @prop [exclusive] {boolean} If `true`, only global subscriptions marked as exclusive will be used. Others will be temporarily disabled.
 */
export interface SubscribeGlobalOptions {
    nluRules: string[];
    meta?: any;
    language?: string;
    exclusive?: boolean;
}
/**
 * Interface for the speaker model results
 * @interface jibo.jetstream.types.SpeakerModelResult
 * @prop [message] {string} In case of `FAILED`, the reason.
 */
export interface SpeakerModelResult {
    message?: string;
}
/**
 * Interface for enrollment collection results
 * @interface jibo.jetstream.types.EnrollmentCollectionResult
 * @prop good_utterance_count {number} The number of utterances accepted so far during this turn.
 * @prop total_utterance_count {number} The total number of utterances seen so far during this turn.
 * @prop accepted {boolean} Whether the last enrollment was usable for training
 * @prop problems {string[]} If `data.accepted` is `false`, this is a string vector containing
 *      the problem(s) with the utterance. The possible values are:
 *   - `CLIPPING`
 *   - `POOR_SNR`
 *   - `NOT_SPEECH_LIKE`
 *   - `NOT_CONSISTENT`
 *   - `BAD_DURATION`
 * @prop final {boolean} `true` if the number of acceptable utterances matches the `numberOfUtterances`
 *      parameter specified when the enrollment turn was started. After this the turn will complete
 *      and no further Speaker Enrollment messages will appear.
 * @prop speaker {string} The ID of the speaker being enrolled.
 * @prop snr {number} The estimated SNR of the HJ utterance.
 */
export interface EnrollmentCollectionResult {
    good_utterance_count: number;
    total_utterance_count: number;
    accepted: boolean;
    problems: string[];
    final: boolean;
    speaker: string;
    snr: number;
}
/**
 * Interface describing a Voice Activity Detection (VAD) event.
 * @interface jibo.jetstream.types.VADEvent
 * @prop name {string} Name of the event. Unlikely to be useful, but present in case of additional events in the future.
 * @prop timestamp {number} Timestamp of the event.
 * @prop audio_time {number} Timestamp of the audio. Will be slightly off from `timestamp`.
 * @prop avg_frame_db {number} Average db of this audio frame.
 * @prop VADEvents {jibo.jetstream.types.VADFrame[]} List of VAD frames from the audio data. Due to VAD frames having different durations than audio frames, this will be 2 or 3 frames long.
 */
export interface VADEvent {
    name: 'VAD_EVENT_DATA';
    timestamp: number;
    audio_time: number;
    avg_frame_db: number;
    VADevents: VADFrame[];
}
/**
 * Interface describing the data in a Voice Activity Detection (VAD) frame.
 * @interface jibo.jetstream.types.VADFrame
 * @prop time {number} Timestamp of the frame.
 * @prop vad {number} Rating from -1 to 1 of how like human speech this frame is, with 1 being speech-like.
 */
export interface VADFrame {
    time: number;
    vad: number;
}
/**
 * @class ListenResult
 * @memberof jibo.jetstream.types
 * @description Results of a turn, with helper getters.
 */
export declare class ListenResult extends BaseListenResult {
    /**
     * Promise for getting the cloud skill response.
     * Type is from [SkillResponseData](https://pegasus-api-docs.jibo.com/index.html#skillresponsedata)
     * @name jibo.jetstream.types.ListenResult#cloudSkillResponse
     * @type {Promise<SkillResponseData>}
     * @readOnly
     * @intdocs
     */
    cloudSkillResponse?: Promise<SkillActionData>;
    /**
     * Transaction id for the global turn - for getting the cloud skill response.
     * @name jibo.jetstream.types.ListenResult#transID
     * @type {string}
     * @readOnly
     * @intdocs
     */
    transID?: string;
    /**
     * Information about a skill launch match from Jetstream
     * @name jibo.jetstream.types.ListenResult#match
     * @type {jibo.jetstream.types.GlobalAndCloudMatchResponseData}
     * @readOnly
     * @intdocs
     */
    match?: GlobalAndCloudMatchResponseData;
    text: string;
    intent: string;
    /**
     * Creates a ListenResult object from a JSON version of one.
     * @method jibo.jetstream.types.ListenResult#fromJSON
     * @param {any} json The JSON object to turn into a ListenResult.
     * @return {jibo.jetstream.types.ListenResult} The new ListenResult object
     * @intdocs
     */
    static fromJSON(json: any): ListenResult;
    /**
     * Creates a JSON representation of this object. This method will
     * automatically be called by `JSON.stringify()`.
     * @intdocs
     * @method jibo.jetstream.types.ListenResult#toJSON
     * @return {any} JSON representation
     * @intdocs
     */
    toJSON(): any;
    /**
     * Creates a stripped down copy of this object with no specific user data in it, so that it
     * can be safely logged.
     * @method jibo.jetstream.types.ListenResult#toLog
     * @return {any} A clean version of the parse result data.
     * @intdocs
     */
    toLog(): any;
}
