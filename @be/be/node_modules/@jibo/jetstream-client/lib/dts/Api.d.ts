import { Log as JiboLog } from 'jibo-log';
import * as types from './Types';
import * as request from './Request';
import * as events_ns from './Events';
import { HotwordModeToken } from './HotwordMode';
export * from './Client';
export import Events = events_ns.Events;
export { types, request, HotwordModeToken };
/**
 * Global events from the jetstream client.
 * @name jibo.jetstream#events
 * @type jibo.jetstream.Events
 * @intdocs
 */
export declare let events: Events;
/**
 * Initializes client. Connects to WS server in Jetstream
 * @method jibo.jetstream#init
 * @param options {jibo.jetstream.types.HostOptions}
 * @param [log] {JiboLog}
 * @returns {Promise<void>}
 */
export declare function init(options: types.HostOptions, log?: JiboLog): Promise<void>;
/**
 * Closes client. Disconnects to WS server in Jetstream
 * @method jibo.jetstream#close
 */
export declare function close(): void;
/**
 * Notifies the Proactive Selector of an opportunity for proactive behavior
 * @method jibo.jetstream#triggerProactive
 * @param {ProactiveRequestData} data See [ProactiveRequestData](https://pegasus-api-docs.jibo.com/index.html#proactiverequestdata)
 * @returns {Promise<jibo.jetstream.request.ProactiveRequest>}
 */
export declare function triggerProactive(data: types.ProactiveRequestData): Promise<request.ProactiveRequest>;
/**
 * Starts a local listening turn
 * @method jibo.jetstream#startLocalTurn
 * @param {jibo.jetstream.types.LocalTurnOptions} data Options for the turn.
 * @returns {Promise<jibo.jetstream.request.LocalTurnRequest>}
 */
export declare function startLocalTurn(data: types.LocalTurnOptions): Promise<request.LocalTurnRequest>;
/**
 * Mimics a global listening turn. This is primarily for launching cloud skills from the robot.
 * @method jibo.jetstream#mimicGlobalTurn
 * @param {jibo.jetstream.types.MimicGlobalTurnOptions} data Options for the turn.
 * @returns {Promise<jibo.jetstream.request.Request>}
 */
export declare function mimicGlobalTurn(data: types.MimicGlobalTurnOptions): Promise<request.Request>;
/**
 * Subscribes a global handler to a selected set of NLU rules.
 * @method jibo.jetstream#subscribeGlobal
 * @param {jibo.jetstream.types.SubscribeGlobalOptions} data Options for the turn.
 * @returns {Promise<jibo.jetstream.request.SubscribeGlobalRequest>}
 */
export declare function subscribeGlobal(data: types.SubscribeGlobalOptions): Promise<request.SubscribeGlobalRequest>;
/**
 * Unsubscribes all global rules.
 * @method jibo.jetstream#unsubscribeAllGlobals
 * @returns {Promise<void>}
 * @intdocs
 */
export declare function unsubscribeAllGlobals(): Promise<void>;
/**
 * @method jibo.jetstream#cancelAnyTurn
 * @return {Promise<void>}
 */
export declare function cancelAnyTurn(): Promise<void>;
/**
 * Changes how hotword listening is handled, from fully disabled to adding additional API.AI grammars.
 * @method jibo.jetstream#setHotwordMode
 * @param {jibo.jetstream.types.HotwordListenMode} mode Mode to set to.
 * @param {string[]} [rules] Additional grammars
 * @returns {jibo.jetstream.HotwordModeToken}
 */
export declare function setHotwordMode(mode: types.HotwordListenMode.Disabled): HotwordModeToken;
export declare function setHotwordMode(mode: types.HotwordListenMode.HJ_Only): HotwordModeToken;
export declare function setHotwordMode(mode: types.HotwordListenMode.ASR_Only): HotwordModeToken;
export declare function setHotwordMode(mode: types.HotwordListenMode.Custom_NLU_Only, rules: string[]): HotwordModeToken;
export declare function setHotwordMode(mode: types.HotwordListenMode.Custom_NLU_Added, rules: string[]): HotwordModeToken;
/**
 * Resets the hotword mode, releasing all tokens.
 * @method jibo.jetstream#resetHotwordMode
 * @return {Promise<void>}
 */
export declare function resetHotwordMode(): Promise<void>;
/**
 * Gets a promise for a cloud skill response from a skill launch. Provided so that skill
 * launches can be handled in the SSM but cloud responses handled in Be.
 * @method jibo.jetstream#getCloudSkillResponse
 * @param {string} transID Transaction ID from the session from which to retrieve the skill response.
 * @return {Promise<any>}
 * @intdocs
 */
export declare function getCloudSkillResponse(transId: string): Promise<any>;
/**
 * Clear the authentication model and collected utterances for the given speaker.
 * @method jibo.jetstream#removeSpeakerModel
 * @param {string} speakerID UUID of the speaker whose model is being cleared
 * @returns {Promise<void>}
 * @intdocs
 */
export declare function removeSpeakerModel(speakerID: string): Promise<void>;
/**
 * Collect enrollment utterances from a speaker, waiting for HJ to be said the given number of
 * times.
 * @method jibo.jetstream#startEnrollmentTurn
 * @param {string} speakerID UUID of the speaker being enrolled
 * @param {number} number_of_utterances Number of good utterances to collect and use before reporting complete.
 *                                      `1` for existing "single HJ capture" behavior.
 * @returns {Promise<jibo.jetstream.request.EnrollmentTurnRequest>}
 * @intdocs
 */
export declare function startEnrollmentTurn(speakerID: string, number_of_utterances: number): Promise<request.EnrollmentTurnRequest>;
/**
 * This prepares the system for listening to the way a user pronounces a particular word. It builds
 * data structures that will be used during the listening step. For normal length names this
 * completes in under 50ms, but longer names can take several hundred ms.
 * @method jibo.jetstream#initNameLearning
 * @param {string} looperName Name to learn
 * @returns {Promise<void>}
 * @intdocs
 */
export declare function initNameLearning(looperName: string): Promise<void>;
/**
 * Collect the pronunciation of a given name.
 * @method jibo.jetstream#startNameLearningTurn
 * @param {string} looperName Name to learn
 * @param {boolean} [ignoreHJ=true] If HJ should be ignored during the turn.
 * @param {boolean} [rejectIfBusy=false] If this turn should be rejected if there is already an active turn.
 * @returns {Promise<jibo.jetstream.request.NameLearningRequest>}
 * @intdocs
 */
export declare function startNameLearningTurn(looperName: string, ignoreHJ?: boolean, rejectIfBusy?: boolean): Promise<request.NameLearningRequest>;
/**
 * Create a model from all the speaker’s utterances collected so far.
 * @method jibo.jetstream#createSpeakerModel
 * @param {string} speakerID UUID of the speaker whose model is being created
 * @param {boolean} [append] Use true if you want the samples to be added to the existing speaker model. Use false if you want to replace the existing speaker model.
 * @returns {Promise<jibo.jetstream.types.SpeakerModelResult>}
 * @intdocs
 */
export declare function createSpeakerModel(speakerID: string, append?: boolean): Promise<types.SpeakerModelResult>;
/**
 * Removes sample Hey Jibo utterances that have not been used to create a speaker model.
 * @method jibo.jetstream#removePendingSamples
 * @param {string} speakerID UUID of the speaker whose unused samples should be cleared
 * @returns {Promise<void>}
 * @intdocs
 */
export declare function removePendingSamples(speakerID: string): Promise<void>;
/**
 * Gets list of speakers enrolled in the system
 * @method jibo.jetstream#getEnrolledSpeakers
 * @returns {Promise<string[]>} List of speakers enrolled in the system
 * @intdocs
 */
export declare function getEnrolledSpeakers(): Promise<string[]>;
/**
 * Needed to make a fresh client in tests.
 */
export declare function _resetInstance(): void;
