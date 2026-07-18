    /**
     * @name jibo.jetstream.Client#events
     * @type jibo.jetstream.Events
     */

    /**
     * @name jibo.jetstream.Client#options
     * @type {jibo.jetstream.types.HostOptions}
     */

    /**
     * @name jibo.jetstream.Client._requests
     * @type {Map}
     * @description `Map<string, Request>`
     */

    /**
     * Logging object internal to this library
     * @private
     */

    /**
     * Has the instance been initialized?
     * @private
     */

    /**
     * Are we currently connected?
     * @private
     */

    /**
     * Initializes client. Connects to WS server in Jetstream
     * @returns {Promise<void>}
     * @method jibo.jetstream.Client#init
     * @param options {jibo.jetstream.types.HostOptions}
     * @param [log] {JiboLog}
     */

    /**
     * Closes websocket connection
     * @method jibo.jetstream.Client#close
     */

    /**
     * Gets the requestID from the response (if it exists).
     * @method jibo.jetstream.Client#getRequestID
     * @param  {any} response Response from the Jetstream request.
     * @return {string}
     */

    /**
     * Allows emitting of turn result events so that we can sort of clean up robot state in the
     * event of something going horribly wrong.
     * @private
     */

    /**
     * Emit a LocalTurnResult event (potentially infused with additional Turn data)
     * @param data Result of the LocalTurn
     * @private
     */