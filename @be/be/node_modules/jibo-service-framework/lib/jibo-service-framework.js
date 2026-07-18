(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jiboServiceFramework = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class ServiceError
 * @param platformErrorKey {string} Platform error key expected by platform error services
 * @param value {ErrorValue} Value of error for platform key. See expected format below.
 * @description Format of error expected by errors service
 */
class ServiceError {
    constructor(platformErrorKey, value) {
        this.key = platformErrorKey;
        this.value = value;
    }
}
exports.ServiceError = ServiceError;
/**
 * @typedef ErrorType
 * @property UNKNOWN {number} Unknown error type.
 * @property EVENT {number} Event error type.
 * @property RECOVERABLE {number} Recoverable error type.
 * @description Types of errors to be reported
 */
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["UNKNOWN"] = 0] = "UNKNOWN";
    ErrorType[ErrorType["EVENT"] = 1] = "EVENT";
    ErrorType[ErrorType["RECOVERABLE"] = 2] = "RECOVERABLE";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
/**
 * @typedef ErrorStatus
 * @property UNKNOWN {number} Unknown status.
 * @property BROKEN {number} Broken status.
 * @property FIXED {number} Fixed status.
 * @description Status of errors to be reported.
 */
var ErrorStatus;
(function (ErrorStatus) {
    ErrorStatus[ErrorStatus["UNKNOWN"] = 0] = "UNKNOWN";
    ErrorStatus[ErrorStatus["BROKEN"] = 1] = "BROKEN";
    ErrorStatus[ErrorStatus["FIXED"] = 2] = "FIXED";
})(ErrorStatus = exports.ErrorStatus || (exports.ErrorStatus = {}));
/**
 * @class ErrorValue
 * @param error {ErrorValue} an error to copy into this instance of ErrorValue
 * @description Value for each error expected by errors service
 */
class ErrorValue {
    constructor(name, type, status, count, oldest, newest) {
        this.name = name;
        this.type = type;
        this.status = status;
        this.count = count;
        this.oldest = oldest;
        this.newest = newest;
    }
}
exports.ErrorValue = ErrorValue;
/**
 * @interface ServiceErrors
 * @description Format by which platform errors service expects an
 * array of errors to be reported.
 */
class ServiceErrors {
    constructor(errors) {
        this.entries = [];
        if (errors) {
            errors.forEach((err) => {
                this.entries.push(err);
            });
        }
    }
}
exports.ServiceErrors = ServiceErrors;

},{}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
const DataTypes_1 = require("./DataTypes");
const connect = require("connect");
const mime = require("./mime");
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");
const path = require("path");
const querystring = require("querystring");
const Router = require("router");
const serveStatic = require("serve-static");
const events_1 = require("events");
const jibo_cai_utils_1 = require("jibo-cai-utils");
const jibo_client_framework_1 = require("jibo-client-framework");
const log = log_1.default.createChild('HTTPService');
const REFRESH_DURATION = 10000;
const TTL = 30;
const prify = jibo_cai_utils_1.PromiseUtils.promisify;
class HTTPService extends events_1.EventEmitter {
    static getPort(firstPortToTry = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = http.createServer((req, res) => {
                // These headers ensure that the client closes the connection;
                // otherwise, server.close takes forever
                res.setHeader('Content-Length', '0');
                res.setHeader('Connection', 'close');
                res.writeHead(204);
                res.end();
            });
            let port = firstPortToTry;
            let done = false;
            let retries = 0;
            const MAX_RETRIES = 10;
            while (!done && retries++ < MAX_RETRIES) {
                yield prify(cb => server.listen(port, '0.0.0.0', cb));
                port = server.address().port;
                done = yield HTTPService._testPort(port);
                yield prify(cb => server.close(cb));
                if (!done) {
                    port = 0;
                }
            }
            if (!done) {
                throw new Error('Failed to find an available port');
            }
            return port;
        });
    }
    // This function, by design, returns a Promise that never rejects, but
    // instead resolves with false, in the spirit of Node 8's fs.exists
    // (or a promisified fs.exists in Node 6 or less)
    static _testPort(port) {
        // XMLHttpRequest is what causes issues, with its no-fix bug where it
        // fails to accept port 65535.  Only Electron has XMLHttpRequest, so
        // we need to do this check - if we're in a Node process, we can
        // assume that the OS returned a valid port, and just resolve true
        if (global.XMLHttpRequest) {
            return new Promise(resolve => {
                const request = new XMLHttpRequest();
                // NOTE: we explicitly use 127.0.0.1 instead of localhost here (and everywhere else) see JIBO-7115
                request.open('GET', `http://127.0.0.1:${port}/`, true);
                request.addEventListener('load', () => {
                    resolve(request.status === 204);
                });
                request.addEventListener('abort', () => {
                    log.error('Attempt to connect while getting port aborted');
                    resolve(false);
                });
                request.addEventListener('error', err => {
                    log.warn('Attempt to connect while getting port failed');
                    resolve(false);
                });
                request.send();
            });
        }
        else {
            return Promise.resolve(true);
        }
    }
    static get _onRobot() {
        // Check environment variables for run mode
        let runMode = process.env.runMode || process.env.RUNMODE;
        // Default to ON_ROBOT under arm/linux if not set
        if (!runMode && process.platform === 'linux' && process.arch === 'arm') {
            runMode = 'ON_ROBOT';
        }
        return runMode === 'ON_ROBOT';
    }
    constructor(name, options, rootDir) {
        super();
        this.name = name;
        this.options = options;
        this.rootDir = rootDir;
        options.register =
            options.register === undefined ? true : options.register;
        this._refreshDuration = REFRESH_DURATION;
        this._ttl = TTL;
        this.refresh = this.refresh.bind(this);
    }
    init(callback) {
        this.app = connect();
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use((req, res, next) => this.parseQueryString(req, res, next));
        this.router = new Router();
        this.routes(this.router);
        this.app.use(this.router);
        if (this.rootDir) {
            this.staticDir = path.join(this.rootDir, 'static', this.name);
            this.app.use(serveStatic(this.staticDir)); // html and friends
        }
        this.server = http.createServer(this.app);
        HTTPService.getPort(this.options.port)
            .catch((err) => {
            log.error(err.message);
            throw err;
        })
            .then(port => {
            if (this.options.port !== 0 && this.options.port !== port) {
                log.warn(`Requested port ${this.options.port} unavailable; listening on ${port} instead`);
            }
            // We pass the hostname of 127.0.0.1 explicitly here off-robot
            // so we don't get a success code if a port is already bound only
            // to localhost, but not to another available interface, which is
            // the default (0.0.0.0)
            // We don't need to discern which mode we're in or whether the
            // service should be available outside the bot, since we have
            // a firewall for that.
            const hostname = HTTPService._onRobot ? '0.0.0.0' : '127.0.0.1';
            return prify(cb => this.server.listen(port, hostname, cb))
                .then(() => this.port = this.server.address().port)
                .catch(err => {
                log.error(`Can't listen on port ${this.options.port}`, err);
                throw err;
            });
        })
            .then(() => {
            log.info(`${this.name} service listening on port ${this.options.port}`);
            if (this.name === 'registry' || !this.options.register) {
                callback();
            }
            else {
                this._register(callback);
            }
        })
            .catch(err => callback(err));
    }
    refresh() {
        jibo_client_framework_1.RegistryClient.instance.editRecord(this.record, (error) => {
            if (error) {
                // [SDK-848] if registry service restarted the entry
                // will have disappeared and has to be added back
                log.info('readding registry record', this.record);
                jibo_client_framework_1.RegistryClient.instance.addNewRecord(this.record, () => {
                    return;
                });
            }
            else {
                return;
            }
        });
    }
    get port() {
        return this.options.port ? this.options.port : 0;
    }
    set port(value) {
        this.options.port = value;
    }
    enableDebug() {
        this.app.use((req, res, next) => {
            log.debug(this.name, req.method, req.url);
            next();
        });
    }
    parseQueryString(req, res, next) {
        req.query = querystring.parse(req._parsedUrl.query);
        next();
    }
    parseBody(req, cb) {
        if (req.body) {
            return cb(null, req.body);
        }
        let chunk = '';
        req.on('data', function (data) {
            chunk += (data);
        });
        let finished = false;
        req.on('end', function () {
            if (!finished) {
                finished = true;
                let data = null;
                let err = null;
                try {
                    data = JSON.parse(chunk);
                    log.debug('Parsed request', data);
                }
                catch (e) {
                    err = new Error('Invalid request. Request body is not valid JSON');
                    log.warn('Error parsing request', e);
                }
                cb(err, data);
            }
        });
        req.on('error', function (err) {
            if (!finished) {
                finished = true;
                cb(new Error(`Error parsing request: ${err.message}`));
            }
        });
    }
    routes(url) {
        url.get('/_M_/errors', this.onErrors.bind(this));
        url.get('/_M_/health', this.onHealth.bind(this));
        url.post('/_M_/system/backup', this.onBackupRequest.bind(this));
        url.post('/_M_/system/restore', this.onRestoreRequest.bind(this));
        url.post('/_M_/system/wipe', this.onWipeRequest.bind(this));
    }
    finish(res, err, data, contentType, statusCode = 200) {
        if (err) {
            const body = err.toString();
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Length', Buffer.byteLength(body).toString());
            res.statusCode =
                !statusCode || statusCode === 200 ? 500 : statusCode;
            return res.end(body);
        }
        // enforce no content on 204, and 204 when no content
        if (statusCode === 204 || !data) {
            res.statusCode = 204;
            res.setHeader('Content-Length', '0');
            return res.end();
        }
        if (contentType) {
            // http://stackoverflow.com/questions/24729329/node-js-how-to-disable-chunked-transfer-encoding
            //res.removeHeader('Transfer-Encoding');
            res.setHeader('Content-Type', contentType);
        }
        res.setHeader('Content-Length', Buffer.byteLength(data).toString());
        res.statusCode = statusCode < 1 ? 200 : statusCode;
        res.end(data);
    }
    finishNoContent(res, status, err) {
        this.finish(res, err, null, null, 204);
    }
    sendFile(res, filename, contentType) {
        log.debug(this.name, 'sending ' + filename);
        contentType = contentType || mime.lookup(filename);
        const file = fs.createReadStream(filename);
        file.on('open', () => {
            res.writeHead(200, { 'Content-Type': contentType });
            file.pipe(res);
        });
        file.on('error', (err) => {
            this.finish(res, err);
        });
    }
    sendJson(res, json, statusCode = 200) {
        let err;
        if (typeof json !== 'string') {
            try {
                json = JSON.stringify(json);
            }
            catch (e) {
                log.error('JSON.stringify: ', e);
                json = null;
                err = e;
            }
        }
        this.finish(res, err, json, 'application/json', statusCode);
    }
    destroy(callback) {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
        this._intervalId = null;
        if (this.server.listening) {
            this.server.close(callback);
        }
        else {
            if (callback) {
                callback();
            }
        }
    }
    /*
     * @description Function called with request and response when service receives an error message.
     * Replies with empty 200 response.
     * should be overridden on a by-service basis.
     * @method HTTPService#onErrors
     * @param req {JiboServerRequest} request to service
     * @param res {JiboServerResponse} response to send from service.
     * @protected
     */
    onErrors(req, res) {
        const data = new DataTypes_1.ServiceErrors();
        this.sendJson(res, data, 200);
    }
    /*
     * @description Function called with request and response when service receives a health check message.
     * Replies with empty 200 response.
     * should be overridden on a by-service basis.
     * @method HTTPService#onHealth
     * @param req {JiboServerRequest} request to service
     * @param res {JiboServerResponse} response to send from service.
     * @protected
     */
    onHealth(req, res) {
        const data = {}; // Health check accepts *any* valid JSON
        this.sendJson(res, data, 200);
    }
    /*
     * @description Base function for service backup. Each service that has files to backup
     * should override it.
     * Replies with empty 204 response.
     * @method HTTPService#onBackupRequest
     * @param req {JiboServerRequest} request to service
     *                                param "directory" -- directory to backup to
     *                                param "dataDirectory" (optional) -- directory where data is stored
     *                                  otherwise, use service's own data directory
     * @param res {JiboServerResponse} response to send from service.
     * @protected
     */
    onBackupRequest(req, res) {
        this.sendJson(res, {}, 204);
    }
    /*
     * @description Base function for wipe service. Each service that
     * has files to wipe should override it.
     * Replies with empty 204 response.
     * @method HTTPService#onWipeRequest
     * @param req {JiboServerRequest} request to service
     *                                param "dataDirectory" (optional) -- directory where data is stored
     *                                  otherwise, use service's own data directory
     * @param res {JiboServerResponse} response to send from service.
     * @protected
     */
    onWipeRequest(req, res) {
        this.sendJson(res, {}, 204);
    }
    /*
     * @description Base function for service backup restore. Each service that
     * has files to restore should override it.
     * Replies with empty 204 response.
     * @method HTTPService#onBackupRequest
     * @param req {JiboServerRequest} request to service
     *                                param "directory" -- directory where backup is
     *                                param "dataDirectory" (optional) -- directory where data is stored
     *                                  otherwise, use service's own data directory
     * @param res {JiboServerResponse} response to send from service.
     * @protected
     */
    onRestoreRequest(req, res) {
        this.sendJson(res, {}, 204);
    }
    _register(callback) {
        // NOTE: we explicitly use 127.0.0.1 instead of localhost here (and everywhere else) see JIBO-7115
        this.record = {
            name: this.name,
            host: '127.0.0.1',
            port: this.options.port,
            path: '/',
            ttl: this._ttl,
            tls: ''
        };
        // since the registry service is persistent on the robot, clear out
        // any old records first
        prify(cb => jibo_client_framework_1.RegistryClient.instance.deleteRecord(this.record, cb))
            .catch(err => {
            log.error('RegistryClient.deleteRecord', err);
        })
            .then(() => prify(cb => jibo_client_framework_1.RegistryClient.instance.addNewRecord(this.record, cb)))
            .catch(err => {
            log.error('RegistryClient.addRecord', err);
            throw err;
        })
            .then(() => {
            //set a refresh of 10 seconds
            this._intervalId = setInterval(this.refresh, this._refreshDuration);
            // don't report upwards any errors
            // if there is a registry problem (e.g. registry service isn't up)
            // it should resolve itself during the refreshes
            return callback();
        })
            .catch(err => callback(err));
    }
}
exports.default = HTTPService;

},{"./DataTypes":1,"./log":8,"./mime":9,"body-parser":undefined,"connect":undefined,"events":undefined,"fs":undefined,"http":undefined,"jibo-cai-utils":undefined,"jibo-client-framework":undefined,"path":undefined,"querystring":undefined,"router":undefined,"serve-static":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPService_1 = require("./HTTPService");
class HTTPServiceDebug extends HTTPService_1.default {
    constructor(options, rootDir) {
        super('debugger-service', options, rootDir);
    }
    routes(url) {
        super.routes(url);
        //this.enableDebug();
        url.get('/testing/echo/:param1?/:param2?', (req, res) => {
            let reply = {
                params: req.params,
                query: req.query
            };
            this.sendJson(res, reply);
        });
    }
}
exports.default = HTTPServiceDebug;

},{"./HTTPService":2}],4:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPService_1 = require("./HTTPService");
const log_1 = require("./log");
const jibo_cai_utils_1 = require("jibo-cai-utils");
const WebSocket = require("ws");
const log = log_1.default.createChild('HTTPWSService');
class HTTPWSService extends HTTPService_1.default {
    constructor(name, options, staticDir) {
        super(name, options, staticDir);
        this.onConnection = this.onConnection.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onClose = this.onClose.bind(this);
        this.connections = [];
    }
    init(callback) {
        super.init((err) => {
            this.wsServer = new WebSocket.Server({ server: this.server });
            this.wsServer.on('connection', this.onConnection);
            callback(err);
        });
    }
    onConnection(client, request) {
        client.url = request.url;
        client.on('close', () => this.closeClient(client));
        this.connections.push(client);
        client.on('message', (message) => {
            let command;
            try {
                command = JSON.parse(message);
            }
            catch (err) {
                return log.error('Error parsing message from socket', err);
            }
            this.onMessage(command, client);
        });
    }
    onClose(client) {
        return;
    }
    sendWsJson(client, json) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof json !== 'string') {
                try {
                    json = JSON.stringify(json);
                }
                catch (err) {
                    // Log stringify failures at error level, since there's likely
                    // nothing the caller can do to recover gracefully, and it's
                    // likely a logic error in the caller's code (object too
                    // complex - will need a code change)
                    log.error('Error stringifying json param:', err);
                    return false;
                }
            }
            try {
                yield jibo_cai_utils_1.PromiseUtils.promisify(cb => client.send(json, cb));
                return true;
            }
            catch (err) {
                // Log this situation at warn level, since we're going to resolve
                // false, so it's possible for the service to gracefully recover
                log.warn(`Error sending message; socket readyState ${client.readyState}:`, err);
                if (client.readyState === WebSocket.CLOSING || client.readyState === WebSocket.CLOSED) {
                    this.closeClient(client);
                }
                return false;
            }
        });
    }
    /**
     * Broadcast a message to all connected WebSocket clients
     * @method HTTPWSService#broadcast
     * @param {any} message JSON message to broadcast
     */
    broadcast(message) {
        log.debug(`broadcasting to ${this.connections.length} clients:`, message);
        this.connections.forEach(client => client.send(message));
    }
    closeClient(client) {
        let i = this.connections.indexOf(client);
        if (i >= 0) {
            this.connections.splice(i, 1);
        }
        client.removeAllListeners();
        if (client.readyState !== client.CLOSED) {
            client.close();
        }
        this.onClose(client);
    }
}
exports.default = HTTPWSService;

},{"./HTTPService":2,"./log":8,"jibo-cai-utils":undefined,"ws":undefined}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPWSService_1 = require("./HTTPWSService");
class HTTPSWSServiceDebug extends HTTPWSService_1.default {
    constructor(options, rootDir) {
        super('debuger-service', options, rootDir);
    }
    onMessage(command, client) {
        this.emit('message', command, client);
    }
    onClose(client) {
        this.emit('close', client);
    }
    onConnection(client, request) {
        super.onConnection(client, request);
        this.emit('connection', client);
    }
    routes(url) {
        super.routes(url);
        this.emit('routes', url);
    }
}
exports.default = HTTPSWSServiceDebug;

},{"./HTTPWSService":4}],6:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const jibo_cai_utils_1 = require("jibo-cai-utils");
const HTTPWSService_1 = require("./HTTPWSService");
const log_1 = require("./log");
const log = log_1.default.createChild('RemoteService');
class RemoteObjectCache extends jibo_cai_utils_1.CacheManager {
}
exports.RemoteObjectCache = RemoteObjectCache;
class RemoteService extends HTTPWSService_1.default {
    /**
     * @param  {string}         name      Name of the service in the registry
     * @param  {ServiceOptions} options
     * @param  {string}         staticDir Path to a static wenpage directory
     */
    constructor(name, options, staticDir) {
        super(name, options, staticDir);
        /** Maps a callback handle to a callback */
        this.callbackHandlers = new Map();
        this.rejectionHandlers = new Map();
        this.cache = new RemoteObjectCache();
        this.onConnection = this.onConnection.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this._messageMap = {
            reply: this.onReply.bind(this),
            request: this.onRequest.bind(this),
            error: this.onError.bind(this)
        };
    }
    /**
     * When a client requests a remote instance be created the server
     * wants to associate that instance with the owner for cleanup
     * purposes. Called from the constructor of ServiceRemoteObject if
     * it's instantiated with an owner.
     * @param  {WebSocket}           owner    The client that owns the instance.
     * @param  {ServiceRemoteObject} instance The remote object instance
     */
    addInstance(owner, instance) {
        this.cache.addObjectToCache(instance, instance.instanceId, owner);
    }
    /**
     * When a websocket disconnects destory all instances that are associated
     * with this connection.
     * @param {WebSocket} client The client that disconnected.
     */
    onClose(client) {
        const set = this.cache.removeCache(client);
        set.forEach((instance) => {
            instance.destroy();
            instance.isDestroyed = true;
        });
        this.emit('connection-closed', client);
    }
    /**
     * Called when a websocket message is received
     * @param  {any}       command [description]
     * @param  {WebSocket} ws      [description]
     */
    onMessage(command, ws) {
        const messageBase = command;
        if (this.lazyInitCheck) {
            this.lazyInitCheck(err => {
                if (!err) {
                    this._messageMap[messageBase.type](ws, messageBase);
                }
            });
        }
        else {
            this._messageMap[messageBase.type](ws, messageBase);
        }
    }
    /**
     * Called when the client sends a message reply. Finds the appropriate
     * callback handle and calls it with the results/
     * @param  {WebSocket} ws      Client that responded
     * @param  {Reply}     message The results
     */
    onReply(ws, message) {
        if (this.callbackHandlers.has(message.messageId)) {
            this.callbackHandlers.get(message.messageId)(message.value);
            this.callbackHandlers.delete(message.messageId);
            this.rejectionHandlers.delete(message.messageId);
        }
    }
    /**
     * Called when the client sends an error. This happens when a remote
     * call threw an error or had an unhandled promise rejection.
     * @param  {WebSocket}      ws      Client that responded
     * @param  {MessageError}       message The results
     */
    onError(ws, message) {
        if (this.rejectionHandlers.has(message.messageId)) {
            this.rejectionHandlers.get(message.messageId)(message.message);
            this.callbackHandlers.delete(message.messageId);
            this.rejectionHandlers.delete(message.messageId);
        }
    }
    /**
     * Called when the client makes an RPC request on an instance
     * @param  {WebSocket} ws      The client making the request
     * @param  {Request}   message Contains the instance id, method and args
     */
    onRequest(ws, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.lazyInitCheck) {
                this.lazyInitCheck(err => {
                    if (!err) {
                        this.doOnRequest(ws, message);
                    }
                });
            }
            else {
                this.doOnRequest(ws, message);
            }
        });
    }
    doOnRequest(ws, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = this.cache.getById(message.instanceId);
            try {
                if (!instance) {
                    throw new Error(`No instance with id "${message.instanceId}" available to handle method "${message.methodName}"`);
                }
                //useful to know what websocket called the method
                instance.callee = ws;
                if (!instance[message.methodName]) {
                    throw new Error(`Cannot call method ${message.methodName} on class ${instance}`);
                }
                const ret = yield instance[message.methodName].apply(instance, message.args);
                if (!message.sendAndForget) {
                    const reply = {
                        type: 'reply',
                        messageId: message.messageId,
                        value: ret
                    };
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(reply));
                    }
                }
            }
            catch (err) {
                let messageText = 'Unspecified Error';
                if (err instanceof Error) {
                    messageText = err.message;
                }
                else if (typeof err === 'string') {
                    messageText = err;
                }
                const errorMessage = {
                    type: 'error',
                    messageId: message.messageId,
                    message: messageText
                };
                log.error(errorMessage);
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(errorMessage));
                }
            }
        });
    }
}
exports.default = RemoteService;

},{"./HTTPWSService":4,"./log":8,"jibo-cai-utils":undefined,"ws":undefined}],7:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class ServiceRemoteObject {
    constructor(options) {
        this._callbackHandlers = new Map();
        this.isDestroyed = false;
        this._instanceId = options.instanceId !== undefined ?
            options.instanceId :
            ServiceRemoteObject.GLOBAL_COUNTER++;
        this.base = options.base;
        this.owner = options.owner;
        if (this.owner) {
            this.base.addInstance(this.owner, this);
        }
        else {
            this.base.addInstance(null, this);
        }
    }
    get instanceId() {
        return this._instanceId;
    }
    /**
     * Emits an event to the client object
     * @param  {string}        event   Event name
     * @param  {any[]}         ...args
     * @return {Promise<void>}
     */
    emit(event, ...args) {
        let webSockets = [];
        if (this.owner) {
            webSockets.push(this.owner);
        }
        else {
            webSockets = this.base.connections;
        }
        let eventMessage = {
            type: 'event',
            instanceId: this._instanceId,
            methodName: 'emit',
            args: [event].concat(args)
        };
        eventMessage = JSON.stringify(eventMessage);
        webSockets.forEach((ws) => {
            this._sendMessage(ws, eventMessage);
        });
    }
    /**
     * Send a message to the client version of this object. Returns the result
     * of the RPC.
     * @param {string} methodName
     * @param {any[]} args
     */
    sendMessage(methodName, args, sendAndForget = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.owner) {
                throw new Error('Cannot send a message to a public remote object');
            }
            if (this.owner.readyState !== WebSocket.OPEN) {
                throw new Error('Owner Websocket is closed');
            }
            const request = {
                type: 'request',
                messageId: this.getMessageId(),
                instanceId: this._instanceId,
                methodName,
                args,
                sendAndForget
            };
            this._sendMessage(this.owner, JSON.stringify(request));
            if (!sendAndForget) {
                return yield this.waitForReply(request.messageId);
            }
        });
    }
    /**
     * Removes this remote object from the remote service cache
     */
    remove() {
        this.base.cache.removeById(this.instanceId);
    }
    /**
     * When called with a specific messageId, this function will return
     * a Promise that resolves when a
     * @param messageId The message handle
     * @returns Promise that resolves to the return value
     */
    waitForReply(messageId) {
        return new Promise((resolve, reject) => {
            this.base.callbackHandlers.set(messageId, (value) => {
                resolve(value);
            });
            this.base.rejectionHandlers.set(messageId, (err) => {
                reject(err);
            });
        });
    }
    getMessageId() {
        return ServiceRemoteObject._messageId++;
    }
    _sendMessage(ws, eventMessage) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(eventMessage);
        }
    }
}
ServiceRemoteObject._messageId = 0;
ServiceRemoteObject.GLOBAL_COUNTER = 1000;
exports.default = ServiceRemoteObject;

},{"ws":undefined}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_log_1 = require("jibo-log");
exports.default = new jibo_log_1.Log('SF.Service');

},{"jibo-log":undefined}],9:[function(require,module,exports){
"use strict";
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 * @private
 */
const path_1 = require("path");
/**
 * Module variables.
 * @private
 */
//Simplified mime-db with just the basics (AS May 2017)
const db = {
    "application/font-woff": {
        "source": "iana",
        "compressible": false,
        "extensions": ["woff"]
    },
    "application/font-woff2": {
        "compressible": false,
        "extensions": ["woff2"]
    },
    "application/gzip": {
        "source": "iana",
        "compressible": false
    },
    "application/javascript": {
        "source": "iana",
        "charset": "UTF-8",
        "compressible": true,
        "extensions": ["js"]
    },
    "application/json": {
        "source": "iana",
        "charset": "UTF-8",
        "compressible": true,
        "extensions": ["json", "map"]
    },
    "application/octet-stream": {
        "source": "iana",
        "compressible": false,
        "extensions": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
    },
    "application/ogg": {
        "source": "iana",
        "compressible": false,
        "extensions": ["ogx"]
    },
    "application/pdf": {
        "source": "iana",
        "compressible": false,
        "extensions": ["pdf"]
    },
    "application/xml": {
        "source": "iana",
        "compressible": true,
        "extensions": ["xml", "xsl", "xsd", "rng"]
    },
    "audio/midi": {
        "source": "apache",
        "extensions": ["mid", "midi", "kar", "rmi"]
    },
    "audio/mp3": {
        "compressible": false,
        "extensions": ["mp3"]
    },
    "audio/mp4": {
        "source": "iana",
        "compressible": false,
        "extensions": ["m4a", "mp4a"]
    },
    "audio/mpeg": {
        "source": "iana",
        "compressible": false,
        "extensions": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
    },
    "audio/ogg": {
        "source": "iana",
        "compressible": false,
        "extensions": ["oga", "ogg", "spx"]
    },
    "audio/wav": {
        "compressible": false,
        "extensions": ["wav"]
    },
    "audio/wave": {
        "compressible": false,
        "extensions": ["wav"]
    },
    "audio/webm": {
        "source": "apache",
        "compressible": false,
        "extensions": ["weba"]
    },
    "image/gif": {
        "source": "iana",
        "compressible": false,
        "extensions": ["gif"]
    },
    "image/jpeg": {
        "source": "iana",
        "compressible": false,
        "extensions": ["jpeg", "jpg", "jpe"]
    },
    "image/png": {
        "source": "iana",
        "compressible": false,
        "extensions": ["png"]
    },
    "image/svg+xml": {
        "source": "iana",
        "compressible": true,
        "extensions": ["svg", "svgz"]
    },
    "image/webp": {
        "source": "apache",
        "extensions": ["webp"]
    },
    "multipart/alternative": {
        "source": "iana",
        "compressible": false
    },
    "multipart/appledouble": {
        "source": "iana"
    },
    "multipart/byteranges": {
        "source": "iana"
    },
    "multipart/digest": {
        "source": "iana"
    },
    "multipart/encrypted": {
        "source": "iana",
        "compressible": false
    },
    "multipart/form-data": {
        "source": "iana",
        "compressible": false
    },
    "multipart/header-set": {
        "source": "iana"
    },
    "multipart/mixed": {
        "source": "iana",
        "compressible": false
    },
    "multipart/parallel": {
        "source": "iana"
    },
    "multipart/related": {
        "source": "iana",
        "compressible": false
    },
    "multipart/report": {
        "source": "iana"
    },
    "multipart/signed": {
        "source": "iana",
        "compressible": false
    },
    "text/calendar": {
        "source": "iana",
        "extensions": ["ics", "ifb"]
    },
    "text/css": {
        "source": "iana",
        "compressible": true,
        "extensions": ["css"]
    },
    "text/csv": {
        "source": "iana",
        "compressible": true,
        "extensions": ["csv"]
    },
    "text/html": {
        "source": "iana",
        "compressible": true,
        "extensions": ["html", "htm", "shtml"]
    },
    "text/javascript": {
        "source": "iana",
        "compressible": true
    },
    "text/markdown": {
        "source": "iana"
    },
    "text/plain": {
        "source": "iana",
        "compressible": true,
        "extensions": ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
    },
    "text/tab-separated-values": {
        "source": "iana",
        "compressible": true,
        "extensions": ["tsv"]
    },
    "text/xml": {
        "source": "iana",
        "compressible": true,
        "extensions": ["xml"]
    },
    "video/h264": {
        "source": "apache",
        "extensions": ["h264"]
    },
    "video/mp4": {
        "source": "apache",
        "compressible": false,
        "extensions": ["mp4", "mp4v", "mpg4"]
    },
    "video/mpeg": {
        "source": "apache",
        "compressible": false,
        "extensions": ["mpeg", "mpg", "mpe", "m1v", "m2v"]
    },
    "video/ogg": {
        "source": "apache",
        "compressible": false,
        "extensions": ["ogv"]
    },
    "video/vp8": {
        "source": "apache"
    },
    "video/webm": {
        "source": "apache",
        "compressible": false,
        "extensions": ["webm"]
    },
};
let extensions = Object.create(null);
let types = Object.create(null);
// Populate the extensions/types maps
populateMaps(extensions, types);
/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */
function lookup(path) {
    if (!path || typeof path !== 'string') {
        return false;
    }
    // get the extension ("ext" or ".ext" or full path)
    const extension = path_1.extname('x.' + path)
        .toLowerCase()
        .substr(1);
    if (!extension) {
        return false;
    }
    return types[extension] || false;
}
exports.lookup = lookup;
/**
 * Populate the extensions and types maps.
 * @private
 */
function populateMaps(extensions, types) {
    // source preference (least -> most)
    const preference = ['nginx', 'apache', undefined, 'iana'];
    Object.keys(db).forEach(function forEachMimeType(type) {
        const mime = db[type];
        const exts = mime.extensions;
        if (!exts || !exts.length) {
            return;
        }
        // mime -> extensions
        extensions[type] = exts;
        // extension -> mime
        for (let i = 0; i < exts.length; i++) {
            const extension = exts[i];
            if (types[extension]) {
                const from = preference.indexOf(db[types[extension]].source);
                const to = preference.indexOf(mime.source);
                if (types[extension] !== 'application/octet-stream' &&
                    (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
                    // skip the remapping
                    continue;
                }
            }
            // set the extension -> mime
            types[extension] = type;
        }
    });
}

},{"path":undefined}],10:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var HTTPService_1 = require("./HTTPService");
exports.HTTPService = HTTPService_1.default;
var HTTPServiceDebug_1 = require("./HTTPServiceDebug");
exports.HTTPServiceDebug = HTTPServiceDebug_1.default;
var HTTPWSService_1 = require("./HTTPWSService");
exports.HTTPWSService = HTTPWSService_1.default;
var HTTPWSServiceDebug_1 = require("./HTTPWSServiceDebug");
exports.HTTPWSServiceDebug = HTTPWSServiceDebug_1.default;
__export(require("jibo-client-framework"));
var RemoteService_1 = require("./RemoteService");
exports.RemoteService = RemoteService_1.default;
var DataTypes_1 = require("./DataTypes");
exports.ServiceErrors = DataTypes_1.ServiceErrors;
exports.ServiceError = DataTypes_1.ServiceError;
exports.ErrorStatus = DataTypes_1.ErrorStatus;
exports.ErrorType = DataTypes_1.ErrorType;
exports.ErrorValue = DataTypes_1.ErrorValue;
var ServiceRemoteObject_1 = require("./ServiceRemoteObject");
exports.ServiceRemoteObject = ServiceRemoteObject_1.default;

},{"./DataTypes":1,"./HTTPService":2,"./HTTPServiceDebug":3,"./HTTPWSService":4,"./HTTPWSServiceDebug":5,"./RemoteService":6,"./ServiceRemoteObject":7,"jibo-client-framework":undefined}]},{},[10])(10)
});

//# sourceMappingURL=jibo-service-framework.js.map
