    /**
     * @namespace jibo.jetstream.types
     */

    /**
     * @namespace jibo.jetstream.request
     */

/**
 * Initializes client. Connects to WS server in Jetstream
 * @method jibo.jetstream#init
 * @param options {jibo.jetstream.types.HostOptions}
 * @param [log] {JiboLog}
 * @returns {Promise<void>}
 */

/**
 * Closes client. Disconnects to WS server in Jetstream
 * @method jibo.jetstream#close
 */

/**
 * Notifies the Proactive Selector of an opportunity for proactive behavior
 * @method jibo.jetstream#triggerProactive
 * @param {ProactiveRequestData} data See [ProactiveRequestData](https://pegasus-api-docs.jibo.com/index.html#proactiverequestdata)
 * @returns {Promise<jibo.jetstream.request.ProactiveRequest>}
 */

/**
 * Starts a local listening turn
 * @method jibo.jetstream#startLocalTurn
 * @param {jibo.jetstream.types.LocalTurnOptions} data Options for the turn.
 * @returns {Promise<jibo.jetstream.request.LocalTurnRequest>}
 */

/**
 * Mimics a global listening turn. This is primarily for launching cloud skills from the robot.
 * @method jibo.jetstream#mimicGlobalTurn
 * @param {jibo.jetstream.types.MimicGlobalTurnOptions} data Options for the turn.
 * @returns {Promise<jibo.jetstream.request.Request>}
 */

/**
 * Subscribes a global handler to a selected set of NLU rules.
 * @method jibo.jetstream#subscribeGlobal
 * @param {jibo.jetstream.types.SubscribeGlobalOptions} data Options for the turn.
 * @returns {Promise<jibo.jetstream.request.SubscribeGlobalRequest>}
 */

/**
 * @method jibo.jetstream#cancelAnyTurn
 * @return {Promise<void>}
 */

/**
 * Enables HJ listening.
 * @method jibo.jetstream#setHJMode
 * @param {jibo.jetstream.types.HJMode} mode
 * @returns {Promise<void>}
 * @private
 */

/**
 * Queries whether HJ listening is active.
 * @method jibo.jetstream#getHJMode
 * @returns {Promise<jibo.jetstream.types.HJMode>}
 * @private
 */

/**
 * Changes how hotword listening is handled, from fully disabled to adding additional API.AI grammars.
 * @method jibo.jetstream#setHotwordMode
 * @param {jibo.jetstream.types.HotwordListenMode} mode Mode to set to.
 * @param {string[]} [rules] Additional grammars
 * @returns {jibo.jetstream.HotwordModeToken}
 */

/**
 * Resets the hotword mode, releasing all tokens.
 * @method jibo.jetstream#resetHotwordMode
 * @return {Promise<void>}
 */

/**
 * Needed to make a fresh client in tests.
 */