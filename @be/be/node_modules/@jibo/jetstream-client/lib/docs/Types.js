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

/**
 * All turn result types.
 * <br /> {@link jibo.jetstream.types#ListenTurnResult} |
 * {@link jibo.jetstream.types#EnrollmentTurnResult} |
 * {@link jibo.jetstream.types#NameTurnResult}
 * @typedef jibo.jetstream.types#TurnResult
 */

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

/**
 * @typedef jibo.jetstream.types.TurnResultType
 * @prop SUCCEEDED
 * @prop INTERRUPTED
 * @prop CANCELED
 * @prop FAILED
 * @prop TIMEOUT
 */

/**
 * Enum of "Hey Jibo" mode options.
 * @typedef jibo.jetstream.types.HJMode
 * @prop NORMAL_HJ Normal response to HJ hotword.
 * @prop IGNORE_HJ Don't respond to HJ hotword (including events).
 * @prop ONLY_HJ Respond to HJ, but don't start an ASR turn.
 * @private
 */

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

/**
 * Information on how to contact Hub.
 * @interface jibo.jetstream.types.HostOptions
 * @prop hostname {string} Host name of Hub service (ex. `localhost`)
 * @prop port {number} Hub port number.
 */

/**
 * Base interface for the different Service event types.
 * @interface jibo.jetstream.types.BaseServiceEvent
 * @prop type {jibo.jetstream.types.ServiceEventType} ServiceEventType enum.
 * @prop requestID {string} Either `GLOBAL` or a specific turn requestID.
 * @prop transID {string} The transaction ID associated with this hub transaction
 * @prop ts {number} Timestamp at sending time.
 * @prop data {any} Payload, depending on `type`.
 */

/**
 * @interface jibo.jetstream.types.MimicGlobalTurnOptions
 * @prop [clientASR] {string} The ASR text result desired from this turn. If present, no audio will be sent to the hub.
 * @prop [clientNLU] {jibo.jetstream.types.NLUResult} The semantic result desired from this turn. If present, no audio will be sent to the hub.
 * @prop [language] {string} ISO language label, e.g. "en-US"
 * @prop [suppressedEvents] {jibo.jetstream.types.ServiceEventType[]} List of event names to suppress during this turn. It is suggested that this not be used by skills.
 */

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

/**
 * Interface for speaker recognition results.
 * @interface jibo.jetstream.types.SpeakerRecogResult
 * @prop speaker {string} The ID string used to enroll this speaker.
 * @prop score {number} authentication score (not useful without knowing the threshold)
 * @prop accepted {boolean} If true, this speaker's score was high enough to be considered "recognized"
 * @prop high_confidence {boolean} If true, this speaker's score was either high enough that the system
 *      is confident in accepting it, or low enough that it is confident in rejecting it.
 */

/**
 * Speaker ID is emitted only if there are enrolled speakers.
 * @interface jibo.jetstream.types.SpeakerIDData
 * @prop speakers {jibo.jetstream.types.SpeakerRecogResult[]} An array of SpeakerRecogResult
 *      objects (sorted in descending score order) with one entry for each enrolled speaker
 *      that states how well that speaker was recognized.
 * @prop snr {number} The estimated signal-to-noise ratio of the HJ input used in the
 *      speaker recognition operation.
 */

/**
 * Interface to Hub for an individual speaker recognition result.
 * @interface jibo.jetstream.types.HubSpeakerRecogResult
 * @prop {string} id - The ID string used to enroll this speaker.
 * @prop {number} score - Authentication score (not useful without knowing the threshold)
 * @prop {boolean} high_confidence - If `true`, this speaker's score was either high enough that the system
 *      is confident in accepting it, or low enough that it is confident in rejecting it.
 */

/**
 * Interface to Hub for speaker recognition results, filtered and sorted by confidence.
 * @interface jibo.jetstream.types.HubSpeakerRecogResults
 * @prop {jibo.jetstream.types.HubSpeakerRecogResult[]} accepted - List of speakers ID'd that are
 * above a certain confidence threshold.
 */

/**
 * Base interface for turn results
 * @interface jibo.jetstream.types.BaseTurnResult
 * @prop {jibo.jetstream.types.TurnResultType} status - Status of turn result
 * @prop {boolean} global - `true` if the turn is global
 * @prop {string} [transID] - Transaction id of turn result (if available)
 */

/**
 * Where {@link jibo.jetstream.types.TurnResultType} = `FAILED`
 * @interface jibo.jetstream.types.FailedTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 * @prop message {string} Message providing information on error/failure.
 */

/**
 * @description Where {@link jibo.jetstream.types.TurnResultType} = `SUCCEEDED` from a local or global turn.
 * @interface jibo.jetstream.types.SuccessTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 * @prop result.asr {ASRResult} [ASRResult](https://pegasus-api-docs.jibo.com/interfaces/asrresult.html)
 * @prop result.nlu {NLUResult} [NLUResult](https://pegasus-api-docs.jibo.com/interfaces/nluresult.html)
 * @prop [result.match] {GlobalMatchResponseData} [GlobalMatchResponseData](https://pegasus-api-docs.jibo.com/interfaces/globalmatchresponsedata.html)
 */

/**
 * @description Where {@link jibo.jetstream.types.TurnResultType} = `SUCCEEDED` from a name learning turn.
 * @interface jibo.jetstream.types.NameSuccessTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 * @prop message {string} The learned pronunciation
 */

/**
 * @description Where {@link jibo.jetstream.types.TurnResultType} = `SUCCEEDED` from a voice enrollment turn.
 * @interface jibo.jetstream.types.EnrollmentSuccessTurnResult
 * @extends jibo.jetstream.types.BaseTurnResult
 */

/**
 * Interface for options around enabling/disabling 'Hey Jibo' listening.
 * @interface jibo.jetstream.types.SetHJEnabledOptions
 * @prop enabled {boolean} `true` if 'Hey Jibo' listening should be enabled.
 */

/**
 * @description Provides the SkillID of the CloudSkill that matched the NLU in addition.
 *      </br> Extends [GlobalMatchResponseData](https://pegasus-api-docs.jibo.com/interfaces/globalmatchresponsedata.html)
 * @interface jibo.jetstream.types.GlobalAndCloudMatchResponseData
 * @extends GlobalMatchResponseData
 * @prop [cloudSkill] {string} - SkillID of Cloud Skill
 */

/**
 * Interface for subscribing to global options.
 * @interface jibo.jetstream.types.SubscribeGlobalOptions
 * @prop nluRules {string[]} One or more NLU rules to subscribe to.
 * @prop [meta] {any} An arbitrary JSON object for caller data, passed back in result.
 * @prop [language] {string} The language of transcription: `'en-US'` , `'ja-JP'`, or `'zh-CN'`.
 * @prop [exclusive] {boolean} If `true`, only global subscriptions marked as exclusive will be used. Others will be temporarily disabled.
 */

/**
 * Interface for the speaker model results
 * @interface jibo.jetstream.types.SpeakerModelResult
 * @prop [message] {string} In case of `FAILED`, the reason.
 */

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

/**
 * Interface describing a Voice Activity Detection (VAD) event.
 * @interface jibo.jetstream.types.VADEvent
 * @prop name {string} Name of the event. Unlikely to be useful, but present in case of additional events in the future.
 * @prop timestamp {number} Timestamp of the event.
 * @prop audio_time {number} Timestamp of the audio. Will be slightly off from `timestamp`.
 * @prop avg_frame_db {number} Average db of this audio frame.
 * @prop VADEvents {jibo.jetstream.types.VADFrame[]} List of VAD frames from the audio data. Due to VAD frames having different durations than audio frames, this will be 2 or 3 frames long.
 */

/**
 * Interface describing the data in a Voice Activity Detection (VAD) frame.
 * @interface jibo.jetstream.types.VADFrame
 * @prop time {number} Timestamp of the frame.
 * @prop vad {number} Rating from -1 to 1 of how like human speech this frame is, with 1 being speech-like.
 */

/**
 * @class ListenResult
 * @memberof jibo.jetstream.types
 * @description Results of a turn, with helper getters.
 */