/**
 * HTTP WebSocket Client
 * @class HTTPWSClient
 * @extends EventEmitter
 * @param {String} host
 */

    /**
     * The socket connection.
     * @name HTTPWSClient#socket
     * @type {WebSocket}
     */

    /**
     * Send data.
     * @method HTTPWSClient#send
     * @param {String|Object} json Either pre-serialzed or raw data object
     * @returns {Promise<boolean>} Whether the send succeeded
     */

    /**
     * Called when there is an error to try reconnect
     */