import { EventContainer, Event } from 'jibo-typed-events';
import { TurnResult, ListenTurnResult, SpeakerIDData, SkillSwitchResult, EnrollmentCollectionResult, VADEvent } from './Types';
/**
 * Describes the global events on the client
 * @namespace jibo.jetstream.events
 * @intdocs
 */
export declare class Events extends EventContainer {
    /**
     * @name jibo.jetstream.events#error
     * @type {Event<Error>}
     * @description `ERROR`
     */
    error: Event<Error>;
    /**
     * @name jibo.jetstream.events#sos
     * @type {Event}
     * @description `Start of speech`
     */
    sos: Event<void>;
    /**
     * @name jibo.jetstream.events#eos
     * @type {Event}
     * @description `End of speech`
     */
    eos: Event<void>;
    /**
     * @name jibo.jetstream.events#hjHeard
     * @type {Event}
     * @description `HJ Heard`
     */
    hjHeard: Event<void>;
    /**
     * @name jibo.jetstream.events#hjOnly
     * @type {Event}
     * @description `HJ Only`
     */
    hjOnly: Event<void>;
    /**
     * @name jibo.jetstream.events#speakerID
     * @type {Event<jibo.jetstream.types.SpeakerIDData>}
     * @description `Speaker ID`
     */
    speakerID: Event<SpeakerIDData>;
    /**
     * @name jibo.jetstream.events#localTurnStarted
     * @type {Event<string>}
     * @description `Local Turn started`
     */
    localTurnStarted: Event<string>;
    /**
     * @name jibo.jetstream.events#localTurnResult
     * @type {Event<jibo.jetstream.types#TurnResult>}
     * @description `Local Turn result`
     */
    localTurnResult: Event<TurnResult>;
    /**
     * @name jibo.jetstream.events#globalTurnStarted
     * @type {Event}
     * @description `Global Turn started`
     */
    globalTurnStarted: Event<void>;
    /**
     * @name jibo.jetstream.events#globalTurnResult
     * @type {Event<jibo.jetstream.types#ListenTurnResult>}
     * @description `Global Turn result`
     */
    globalTurnResult: Event<ListenTurnResult>;
    /**
     * @name jibo.jetstream.events#skillSwitch
     * @type {Event<jibo.jetstream.types.SkillSwitchResult>}
     * @description `Skill Switch`
     */
    skillSwitch: Event<SkillSwitchResult>;
    /**
     * @name jibo.jetstream.events#speakerEnrollment
     * @type {Event<jibo.jetstream.types.EnrollmentCollectionResult>}
     * @description `Speaker Enrollment`
     */
    speakerEnrollment: Event<EnrollmentCollectionResult>;
    /**
     * @name jibo.jetstream.events#vad
     * @type {Event<jibo.jetstream.types.VADEvent>}
     * @description `VAD Event` - Voice activity detection
     */
    vad: Event<VADEvent>;
    /**
     * @name jibo.jetstream.events#connect
     * @type {Event<void>}
     * @description `Connect` - When the client connects (or reconnects) to Jetstream
     */
    connect: Event<void>;
}
