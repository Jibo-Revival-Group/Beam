    /**
     * Event emitted whenever the loop properties have been updated
     * (including on mobile devices)
     * @name jibo.kb.loop.LoopModelEvents#loopUpdated
     * @type {Event}
     */

/**
 * Jibo KB Loop API
 * @namespace jibo.kb.loop
 */

/** LoopModel Class. The Loop Model subclass
 *
 * @class LoopModel
 * @extends jibo.kb.Model
 * @memberof jibo.kb.loop
 * @example
 * let model = jibo.kb.loop.createModel('/jibo/loop');
 */

    /** Create an Error with a good message from an AxiosError object
     *
     * @method jibo.kb.LoopModel#_processError
     * @param {AxiosError} err Axios error object.
     * @returns {Error} Error object.
     * @private
     */

    /** Load all the current loop members (those that are not status
     * 'declined' or 'removed'). If callback is omitted a promise is
     * returned instead.
     *
     * @method jibo.kb.loop.LoopModel#loadLoop
     * @param {Function} [callback] Called with (err, loop). If callback
     * is omitted a promise that resolves to `loop` is returned
     * instead.
     * @returns {Promise} A promise that resolves with the value of
     * `loop` if the callback is omitted.
     */

    /** Load status `invited` loop members.  These are loop the
     * members who have not yet accepted their invitation to join the
     * loop. If callback is omitted a promise is returned instead.
     *
     * @method jibo.kb.loop.LoopModel#loadLoopInvited
     * @param {Function} [callback] Called with (err, loop). If callback
     * is omitted a promise that resolves to `loop` is returned
     * instead.
     * @returns {Promise} A promise that resolves with the value of
     * `loop` if the callback is omitted.
     * @deprecated since version 5.5.0
     */

    /** Load `isActive` loop members.
     *
     * @method jibo.kb.loop.LoopModel#loadLoopActive
     * @param {Function} [callback] Called with (err, loop). If callback
     * is omitted a promise that resolves to `loop` is returned
     * instead.
     * @returns {Promise} A promise that resolves with the value of
     * `loop` if the callback is omitted.
     * @deprecated since version 5.5.0
     * @see jibo.kb.loop.LoopModel#loadLoop
     */

    /** Load all loop members, including where `status` is `deleted`.
     *
     * @method jibo.kb.loop.LoopModel#loadLoopAll
     * @param {Function} [callback] Called with (err, loop). If callback
     * is omitted a promise that resolves to `loop` is returned
     * instead.
     * @returns {Promise} A promise that resolves with the value of
     * `loop` if the callback is omitted.
     */

    /** Retrieve loop member's written name.
     *
     * @method jibo.kb.loop.LoopModel#getWrittenNameById
     * @param {String} id The loop member's ID.
     * @param {Function} [callback] Called with (err, name). If
     * callback is omitted a promise that resolves to `name` is
     * returned instead.
     * @returns {Promise} A promise that resolves with the value of
     * `name` if the callback is omitted.
     */

    /** Retrieve loop member's spoken name.
     *
     * @method jibo.kb.loop.LoopModel#getSpokenNameById
     * @param {String} id The loop member's ID.
     * @param {Function} [callback] Called with (err, name). If callback
     * is omitted a promise that resolves to `name` is returned
     * instead.
     * @returns {Promise} A promise that resolves with the value of
     * `name` if the callback is omitted.
     */

    /** Fetch status `accepted` loop members from the
     * cache. These are the current loop members.
     *
     * @method jibo.kb.loop.LoopModel#fetchLoop
     * @returns {jibo.kb.loop.UserNode[]} Array of loop members.
     */

    /** Fetch status `invited` loop members from the
     * cache.  These are the loop members who have not yet accepted
     * their invitation to join the loop.
     *
     * @method jibo.kb.loop.LoopModel#fetchLoopInvited
     * @returns {jibo.kb.loop.UserNode[]} Array of invited loop members.
     * @deprecated since version 5.5.0
     * @see jibo.kb.loop.LoopModel#fetchLoop
     */

    /** Fetch `isActive` loop members from the cache.
     *
     * @method jibo.kb.loop.LoopModel#fetchLoopActive
     * @returns {jibo.kb.loop.UserNode[]} Array of active loop members.
     * @deprecated since version 5.5.0
     * @see jibo.kb.loop.LoopModel#fetchLoop
     */

    /** Fetch all loop members from the cache, including where status
     * is `deleted`.
     *
     * @method jibo.kb.loop.LoopModel#fetchLoopAll
     * @returns {jibo.kb.loop.UserNode[]} Array of all loop members.
     */

    /** Filter out declined and removed loop members.
     * @private
     */

    /** Filter out loop members that have not accepted yet.
     *
     * @method jibo.kb.loop.LoopModel#_onlyAccepted
     * @param {jibo.kb.loop.UserNode[]} loop Loop nodes to filter.
     * @returns {jibo.kb.loop.UserNode[]} Loop nodes where `status` is 'accepted'.
     * @private
     */