/**
 * @private
 */

/**
 * Token representing a call to jibo.jetstream.setHotwordMode().
 * @class jibo.jetstream.HotwordModeToken
 */

    /**
     * @private
     */

    /**
     * @private
     */

    /**
     * Promise for when the mode is fully active, if you wanted to wait on it.
     * @name jibo.jetstream.HotwordModeToken#activated
     * @type {Promise<void>}
     */

    /**
     * `Global match`
     * @name jibo.jetstream.HotwordModeToken#match
     * @type {Event<jibo.jetstream.types.SuccessTurnResult>}
     */

    /**
     * @name jibo.jetstream.HotwordModeToken#globalRequest
     * @type {jibo.jetstream.request.SubscribeGlobalRequest}
     * @private
     */

    /**
     * If token has not been released.
     * @name jibo.jetstream.HotwordModeToken#valid
     * @type {boolean}
     * @private
     */

    /**
     * @hideConstructor
     */

    /**
     * Releases the token, permanently disabling it.
     * @method jibo.jetstream.HotwordModeToken#release
     * @returns {Promise<void>}
     */

    /**
     * Cleanup without modifying hotword mode. This way we can remove tokens en-masse
     * and update the mode once at the end.
     * @private
     */

    /**
     * @private
     */

    /**
     * @private
     */