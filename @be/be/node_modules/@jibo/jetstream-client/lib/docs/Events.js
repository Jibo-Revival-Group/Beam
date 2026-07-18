    /**
     * @name jibo.jetstream.events#error
     * @type {Event<Error>}
     * @description `ERROR`
     */

    /**
     * @name jibo.jetstream.events#sos
     * @type {Event}
     * @description `Start of speech`
     */

    /**
     * @name jibo.jetstream.events#eos
     * @type {Event}
     * @description `End of speech`
     */

    /**
     * @name jibo.jetstream.events#hjHeard
     * @type {Event}
     * @description `HJ Heard`
     */

    /**
     * @name jibo.jetstream.events#hjOnly
     * @type {Event}
     * @description `HJ Only`
     */

    /**
     * @name jibo.jetstream.events#speakerID
     * @type {Event<jibo.jetstream.types.SpeakerIDData>}
     * @description `Speaker ID`
     */

    /**
     * @name jibo.jetstream.events#localTurnStarted
     * @type {Event<string>}
     * @description `Local Turn started`
     */

    /**
     * @name jibo.jetstream.events#localTurnResult
     * @type {Event<jibo.jetstream.types#TurnResult>}
     * @description `Local Turn result`
     */

    /**
     * @name jibo.jetstream.events#globalTurnStarted
     * @type {Event}
     * @description `Global Turn started`
     */

    /**
     * @name jibo.jetstream.events#globalTurnResult
     * @type {Event<jibo.jetstream.types#ListenTurnResult>}
     * @description `Global Turn result`
     */

    /**
     * @name jibo.jetstream.events#skillSwitch
     * @type {Event<jibo.jetstream.types.SkillSwitchResult>}
     * @description `Skill Switch`
     */

    /**
     * @name jibo.jetstream.events#speakerEnrollment
     * @type {Event<jibo.jetstream.types.EnrollmentCollectionResult>}
     * @description `Speaker Enrollment`
     */

    /**
     * @name jibo.jetstream.events#vad
     * @type {Event<jibo.jetstream.types.VADEvent>}
     * @description `VAD Event` - Voice activity detection
     */

    /**
     * @name jibo.jetstream.events#connect
     * @type {Event<void>}
     * @description `Connect` - When the client connects (or reconnects) to Jetstream
     */