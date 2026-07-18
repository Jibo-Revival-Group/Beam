(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jiboClientFramework = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
const events_1 = require("events");
class ClientRemoteObject extends events_1.EventEmitter {
    constructor(client, options) {
        super();
        this.client = client;
        this.options = options;
        client.instances.set(options.instanceId, this);
        this.instanceId = options.instanceId;
    }
    sendMessage(methodName, args, sendAndForget = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.sendMessage(this.instanceId, methodName, args, sendAndForget);
        });
    }
    destroy() {
        this.client.instances.delete(this.instanceId);
    }
}
exports.default = ClientRemoteObject;

},{"events":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const http = require("http");
const log_1 = require("./log");
const log = log_1.default.createChild('HTTPClient');
class HTTPClient extends events_1.EventEmitter {
    constructor(host, port) {
        super();
        this.host = host;
        this.port = port;
    }
    sendRequest(method, path, body, callback) {
        let options = {
            host: this.host,
            port: this.port,
            path: path,
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": body.length
            }
        };
        let request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let data = '';
            response.on('data', (chunk) => {
                data += chunk.toString();
            });
            response.on('end', () => {
                let err;
                let json;
                if (data.length > 0) {
                    try {
                        json = JSON.parse(data);
                    }
                    catch (e) {
                        if (data.length < 500) {
                            log.error('could not parse JSON from request', `${this.host}:${this.port}${path}`, data);
                        }
                        else {
                            log.error('could not parse JSON from request', `${this.host}:${this.port}${path}`);
                        }
                        err = e;
                    }
                }
                if (err) {
                    callback(err);
                }
                else {
                    if (response.statusCode < 200 || response.statusCode > 299) {
                        err = new Error('HTTP Error Code ' + response.statusCode + ' ' + response.statusMessage);
                    }
                    callback(err, json);
                }
            });
        });
        request.on('error', (err) => {
            callback(new Error('problem with request: ' + err.message));
        });
        request.write(body);
        request.end();
    }
    postJSON(path, json, callback) {
        this.sendRequest('post', path, JSON.stringify(json), callback);
    }
    getJSON(path, json, callback) {
        this.sendRequest('get', path, JSON.stringify(json), callback);
    }
    get(path, callback) {
        let request = http.get('http://' + this.host + ':' + this.port + path, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk.toString();
            });
            response.on('end', () => {
                callback(null, JSON.parse(data));
            });
        });
        request.on('error', (e) => {
            callback(new Error(`Got error: ${e.message}`));
        });
    }
}
exports.default = HTTPClient;

},{"./log":8,"events":undefined,"http":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const WSClient_1 = require("./WSClient");
const RegistryClient_1 = require("./RegistryClient");
const log_1 = require("./log");
const log = log_1.default.createChild('NotificationsDispatcher');
class NotificationsDispatcher extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this._processNotification = (message) => {
            if (message && message.payload && message.payload.name) {
                log.info('emitting', message.payload.name);
                this.emit(message.payload.name, message.payload.payload);
            }
            else {
                log.warn('notification message being dropped here!', message);
            }
        };
        this._processStatus = (message) => {
            if (message && message.status) {
                if (message.status !== this._lastStatus) {
                    this._lastStatus = message.status;
                    this.emit('StatusChanged', message.status);
                    if (message.status === 1) {
                        this.emit('StatusConnected');
                    }
                    if (message.status === 2) {
                        this.emit('StatusDisconnected');
                    }
                }
            }
            else {
                log.warn('status message being dropped here!', message);
            }
        };
    }
    init(callback) {
        RegistryClient_1.default.instance.getRecordByName('server', (err, record) => {
            log.iferr(err, 'Error getting "server" service record');
            if (!err) {
                this._setupSockets(`ws://${record.host}:${record.port}`);
            }
            log.info('Initialized');
            callback(err);
        });
    }
    _setupSockets(url) {
        if (!this._notificationsSocket) {
            let socketUrl = `${url}/server/notifications`;
            this._notificationsSocket = new WSClient_1.default(socketUrl);
            this._notificationsSocket.on('open', () => log.debug('notification socket open'));
            this._notificationsSocket.on('error', (err) => log.warn('notification socket error', err));
            this._notificationsSocket.on('message', this._processNotification);
        }
        if (!this._statusSocket) {
            let socketUrl = `${url}/server/notifications/status`;
            this._statusSocket = new WSClient_1.default(socketUrl);
            this._statusSocket.on('open', (err) => log.debug('status socket open'));
            this._statusSocket.on('error', (err) => log.warn('status socket error', err));
            this._statusSocket.on('message', this._processStatus);
        }
    }
}
NotificationsDispatcher.instance = new NotificationsDispatcher();
exports.default = NotificationsDispatcher;

},{"./RegistryClient":4,"./WSClient":7,"./log":8,"events":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPClient_1 = require("./HTTPClient");
class RegistryClient extends HTTPClient_1.default {
    constructor(host, port) {
        super(host, port);
        this.host = host;
        this.port = port;
        if (RegistryClient._instance) {
            throw new Error('Registry Client is a singleton');
        }
        RegistryClient._instance = this;
    }
    static createInstance(host, port) {
        if (!RegistryClient._instance) {
            RegistryClient._instance = new RegistryClient(host, port);
        }
        return RegistryClient._instance;
    }
    static get instance() {
        return RegistryClient._instance;
    }
    addNewRecord(record, callback) {
        this.sendRequest('PUT', '/registry', JSON.stringify(record), callback);
    }
    editRecord(record, callback) {
        this.sendRequest('POST', '/registry', JSON.stringify(record), callback);
    }
    deleteRecord(record, callback) {
        this.sendRequest('DELETE', '/registry', JSON.stringify(record), callback);
    }
    getRecords(callback) {
        this.get('/registry', (error, records) => {
            callback(error, records ? records.records : []);
        });
    }
    getRecordByName(serviceName, callback) {
        this.getRecords((err, records) => {
            if (err) {
                callback(err);
            }
            else if (!records) {
                callback(new Error('no records from registry'));
            }
            else {
                let found = false;
                for (let i = 0; i < records.length; i++) {
                    if (records[i].name === serviceName) {
                        found = true;
                        callback(null, records[i]);
                        break;
                    }
                }
                if (!found) {
                    callback(new Error('no record for service "' + serviceName + '" found in registry'));
                }
            }
        });
    }
}
exports.default = RegistryClient;

},{"./HTTPClient":2}],5:[function(require,module,exports){
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
const jibo_cai_utils_1 = require("jibo-cai-utils");
const events_1 = require("events");
const WSClient_1 = require("./WSClient");
const log_1 = require("./log");
const log = log_1.default.createChild('RemoteClient');
class RemoteClient extends events_1.EventEmitter {
    constructor(token) {
        super();
        this.instances = new Map();
        this._callbackHandlers = new Map();
        this._rejectionHandlers = new Map();
        this._stackTraces = new Map();
        this._isInitialized = false;
        this._messageQueue = [];
        this._messageQueueTask = null;
        this.onMessage = this.onMessage.bind(this);
        this.processMessageQueue = this.processMessageQueue.bind(this);
        this._messageMap = {
            event: this.onEvent.bind(this),
            reply: this.onReply.bind(this),
            request: this.onRequest.bind(this),
            error: this.onError.bind(this)
        };
    }
    init(port = 11111) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isInitialized) {
                return;
            }
            this.port = port;
            this._isInitialized = true;
            this._client = new WSClient_1.default(`ws://127.0.0.1:${this.port}`);
            this._client.on('reopen', () => {
                this.emit('reopen');
            });
            this._client.on('message', this.onMessage);
            yield jibo_cai_utils_1.PromiseUtils.promisify(cb => this._client.on('open', cb));
        });
    }
    sendMessage(instanceId, methodName, args = [], sendAndForget = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                type: 'request',
                messageId: this.getMessageId(),
                instanceId,
                methodName,
                args,
                sendAndForget
            };
            this._client.send(JSON.stringify(data));
            if (!sendAndForget) {
                return yield this.waitForReply(data.messageId);
            }
        });
    }
    destroy() {
        if (this._client) {
            this._client.removeListener('message', this.onMessage);
            this._client = undefined;
        }
        if (this._messageQueueTask !== null) {
            clearImmediate(this._messageQueueTask);
            this._messageQueueTask = null;
        }
        this._messageQueue = undefined;
    }
    waitForReply(messageId) {
        this._stackTraces.set(messageId, new Error().stack);
        return new Promise((resolve, reject) => {
            this._callbackHandlers.set(messageId, (value) => {
                resolve(value);
            });
            this._rejectionHandlers.set(messageId, (err) => {
                reject(err);
            });
        });
    }
    onMessage(messageBase) {
        this._messageQueue.push(messageBase);
        if (this._messageQueueTask === null) {
            this._messageQueueTask = setImmediate(this.processMessageQueue);
        }
    }
    processMessageQueue() {
        this._messageQueueTask = null;
        let processingReplies = false;
        while (this._messageQueue.length > 0) {
            let nextMessage = this._messageQueue[0];
            let nextIsReply = nextMessage.type === 'reply' || nextMessage.type === 'error';
            if (processingReplies && !nextIsReply) {
                break;
            }
            else {
                processingReplies = nextIsReply;
                this._messageQueue.shift();
                try {
                    this._messageMap[nextMessage.type](nextMessage);
                }
                catch (err) {
                    log.error("Error processing incoming message:", err);
                }
            }
        }
        if (this._messageQueue.length > 0) {
            this._messageQueueTask = setImmediate(this.processMessageQueue);
        }
    }
    onEvent(message) {
        const instance = this.instances.get(message.instanceId);
        if (!instance) {
            log.warn(`Cannot emit event ${message.args[0]} on instance id ${message.instanceId}`);
        }
        else if (instance instanceof events_1.EventEmitter) {
            instance.emit.apply(instance, message.args);
        }
        else {
            throw new Error(`Tried to emit an event on ${instance}, but
                it's not an EventEmitter`);
        }
    }
    onRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const instance = this.instances.get(message.instanceId);
                if (!instance) {
                    log.warn(`Could not call method ${message.methodName} on id ${message.instanceId} with args ${message.args}`);
                    return;
                }
                const ret = yield instance[message.methodName].apply(instance, message.args);
                if (!message.sendAndForget) {
                    const reply = {
                        type: 'reply',
                        messageId: message.messageId,
                        value: ret
                    };
                    this._client.send(JSON.stringify(reply));
                }
            }
            catch (err) {
                let messageText = 'Unspeficied Error';
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
                this._client.send(JSON.stringify(errorMessage));
            }
        });
    }
    onReply(message) {
        if (this._callbackHandlers.has(message.messageId)) {
            this._callbackHandlers.get(message.messageId)(message.value);
            this._callbackHandlers.delete(message.messageId);
            this._rejectionHandlers.delete(message.messageId);
            this._stackTraces.delete(message.messageId);
        }
    }
    onError(message) {
        if (this._rejectionHandlers.has(message.messageId)) {
            const err = new Error(message.message);
            err.stack = this._stackTraces.get(message.messageId);
            this._rejectionHandlers.get(message.messageId)(err);
            this._callbackHandlers.delete(message.messageId);
            this._rejectionHandlers.delete(message.messageId);
            this._stackTraces.delete(message.messageId);
        }
    }
    getMessageId() {
        return RemoteClient._messageId++;
    }
}
RemoteClient._messageId = 0;
exports.default = RemoteClient;

},{"./WSClient":7,"./log":8,"events":undefined,"jibo-cai-utils":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPClient_1 = require("./HTTPClient");
const http = require("http");
const log_1 = require("./log");
const log = log_1.default.createChild('SystemManager');
class SingletonEnforcer {
}
exports.SingletonEnforcer = SingletonEnforcer;
class SystemManagerClient extends HTTPClient_1.default {
    constructor(enforcer, host, port) {
        super(host, port);
        this.host = host;
        this.port = port;
        log.debug('constructor', host, port);
        SystemManagerClient._instance = this;
    }
    static createInstance(host, port) {
        return SystemManagerClient._instance ||
            new SystemManagerClient(new SingletonEnforcer(), host, port);
    }
    static get instance() {
        return SystemManagerClient._instance;
    }
    get(path, callback) {
        const url = `http://${this.host}:${this.port}${path}`;
        log.debug('get', url);
        let request = http.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk.toString();
            });
            response.on('end', () => {
                if (response.statusCode === 200) {
                    log.debug('got', url);
                    callback(null, JSON.parse(data));
                }
                else {
                    let msg = 'System Manager is unavailable';
                    if (response.statusMessage !== undefined && response.statusMessage !== "") {
                        msg = response.statusMessage;
                    }
                    log.warn(msg);
                    callback(new Error(msg));
                }
            });
        });
        request.on('error', (e) => {
            log.warn(`Error getting ${url}`, e);
            callback(new Error(`Got error: ${e.message}`));
        });
    }
    sendRequest(method, path, body, callback) {
        let options = {
            host: this.host,
            port: this.port,
            path: path,
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": body.length
            }
        };
        let request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let data = '';
            response.on('data', (chunk) => {
                data += chunk.toString();
            });
            response.on('end', () => {
                if (response.statusCode === 204) {
                    callback(null);
                }
                else if (response.statusCode === 200) {
                    callback(null, JSON.parse(data));
                }
                else {
                    let msg = 'System Manager is unavailable';
                    if (response.statusMessage !== undefined && response.statusMessage !== "") {
                        msg = response.statusMessage;
                    }
                    log.warn(msg);
                    callback(new Error(msg));
                }
            });
        });
        request.on('error', (e) => {
            log.warn(`Problem with ${method} request to ${path}`, e);
            callback(new Error('Problem with request: ' + e.message));
        });
        request.write(body);
        request.end();
    }
    getVersion(callback) {
        this.sendRequest('GET', '/version', "", callback);
    }
    list(callback) {
        this.get('/skill/list', (error, skills) => {
            callback(error, skills ? skills.skills : null);
        });
    }
    getSkillRecordByName(name, callback) {
        this.list((error, skills) => {
            if (error) {
                return callback(error);
            }
            for (let i = 0; i < skills.length; i++) {
                if (skills[i].name === name) {
                    return callback(null, skills[i]);
                }
            }
            return callback(new Error(`Could not find skill with name ${name}`));
        });
    }
    launch(name, callback) {
        let body = JSON.stringify({
            name: name,
            context: '{}'
        });
        this.sendRequest('POST', '/skill/launch', body, callback);
    }
    terminate(name, callback) {
        let body = JSON.stringify({
            name: name
        });
        this.sendRequest('POST', '/skill/terminate', body, callback);
    }
    getMode(callback) {
        this.get('/mode', (error, data) => {
            if (error) {
                return callback(error);
            }
            callback(null, data.mode);
        });
    }
    syncTime(callback) {
        this.sendRequest('POST', '/time/synchronize', "", callback);
    }
    getTimeZone(callback) {
        this.sendRequest('GET', '/time/zone', "", (err, response) => {
            if (err) {
                return callback(err);
            }
            callback(response ? response.timezone : null);
        });
    }
    setTimeZone(zone, callback) {
        if (!zone) {
            callback("No zone given");
            return;
        }
        let body = "";
        try {
            body = JSON.stringify({ timezone: zone });
        }
        catch (e) {
            callback("Timezone request is not valid JSON");
            return;
        }
        this.sendRequest('POST', '/time/zone', body, callback);
    }
    getCredentials(callback) {
        this.get('/credentials', (error, data) => {
            if (error || !data) {
                return callback((!error ? new Error("No credentials set") : error), null);
            }
            if (!data.hasOwnProperty("accessKeyId") || data["accessKeyId"].length === 0) {
                return callback(new Error("No credentials: accessKeyId is not set."));
            }
            if (!data.hasOwnProperty("secretAccessKey") || data["secretAccessKey"].length === 0) {
                return callback(new Error("No credentials: secretAccessKey is not set."));
            }
            if (!data.hasOwnProperty("region") || data["region"].length === 0) {
                return callback(new Error("No credentials: region is not set."));
            }
            callback(null, data);
        });
    }
    sendWifiRequest(method, path, body, callback) {
        this.sendRequest(method, path, body, (error, res) => {
            callback(error, (res ? res.response : null));
        });
    }
    addNetwork(callback) {
        let body = JSON.stringify({
            command: "ADD_NETWORK"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    removeNetwork(networkId, callback) {
        let body = JSON.stringify({
            command: "REMOVE_NETWORK " + networkId
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    saveConfig(callback) {
        let body = JSON.stringify({
            command: "SAVE_CONFIG"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    disconnect(callback) {
        let body = JSON.stringify({
            command: "DISCONNECT"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    signalPoll(callback) {
        let body = JSON.stringify({
            command: "SIGNAL_POLL"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    setNetwork(networkData, callback) {
        let body = JSON.stringify({
            command: "SET_NETWORK " + networkData
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    selectNetwork(networkId, callback) {
        let body = JSON.stringify({
            command: "SELECT_NETWORK " + networkId
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    enableNetwork(networkId, callback) {
        let body = JSON.stringify({
            command: "ENABLE_NETWORK " + networkId
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    setInterface(interfaceData, callback) {
        let body = JSON.stringify({
            interface: interfaceData
        });
        this.sendWifiRequest('POST', '/wifi/interface', body, callback);
    }
    getInterface(callback) {
        this.get('/wifi/interface', (error, data) => {
            if (error) {
                return callback(error);
            }
            callback(null, data.interface);
        });
    }
    listNetworks(callback) {
        let body = JSON.stringify({
            command: "LIST_NETWORKS"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    wifiStatus(callback) {
        let body = JSON.stringify({
            command: "STATUS-VERBOSE"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    scan(callback) {
        let body = JSON.stringify({
            command: "SCAN"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    scanResults(callback) {
        let body = JSON.stringify({
            command: "SCAN_RESULTS"
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, callback);
    }
    bgScan(weakRescanDelay, strengthThreshold, strongRescanDelay, callback) {
        let body = JSON.stringify({
            command: `SET bgscan "simple:${weakRescanDelay | 0}:${strengthThreshold | 0}:${strongRescanDelay | 0}"`
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, (err) => {
            if (err) {
                return callback(err);
            }
            this.saveConfig(callback);
        });
    }
    activeAutoScan(rescanDelay, callback) {
        let body = JSON.stringify({
            command: `AUTOSCAN periodic:${rescanDelay | 0}`
        });
        this.sendWifiRequest('POST', '/wifi/wpa', body, (err) => {
            if (err) {
                return callback(err);
            }
            this.saveConfig(callback);
        });
    }
    getSemanticStorage(callback) {
        this.get('/storage/semantic', (error, data) => {
            if (error) {
                return callback(error);
            }
            callback(null, data);
        });
    }
}
SystemManagerClient.NAME = 'system-manager';
exports.default = SystemManagerClient;

},{"./HTTPClient":2,"./log":8,"http":undefined}],7:[function(require,module,exports){
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
const events_1 = require("events");
const jibo_cai_utils_1 = require("jibo-cai-utils");
const log_1 = require("./log");
const WebSocket = require("ws");
const log = log_1.default.createChild('WSClient');
class HTTPWSClient extends events_1.EventEmitter {
    constructor(host) {
        super();
        this.host = host;
        this._isReconnecting = false;
        this._connect = () => {
            log.debug('connect');
            this.socket = new WebSocket(this.host, { perMessageDeflate: false });
            this.socket.on('error', this._onError);
            this.socket.on('close', this._onClose);
            this.socket.on('message', this._onMessage);
            this.socket.on('open', this._onOpen);
        };
        this._onStartReconnect = () => {
            this._isReconnecting = true;
            this.socket.removeAllListeners();
            this.socket = null;
            setTimeout(this._connect, 1000);
        };
        this._onError = (err) => {
            log.warn('socket error', err);
            this._onStartReconnect();
        };
        this._onClose = (code, message) => {
            log.warn(`socket ${this.host} closed`, code, message);
            this.emit('close');
            this._onStartReconnect();
        };
        this._onMessage = (data) => {
            let command;
            try {
                command = JSON.parse(data.replace(/\bNaN\b/g, "0"));
            }
            catch (err) {
                const r = /at position (\d+)/g;
                const result = r.exec(err.message);
                if (data.length < 500) {
                    if (result) {
                        const pos = parseInt(result[1]);
                        log.error(`Invalid JSON sent to jibo client on host ${this.host} at position ${pos}`, data);
                    }
                    else {
                        log.error('Invalid JSON sent to jibo client on host ' + this.host, data);
                    }
                }
                else {
                    if (result) {
                        const padding = 250;
                        let pos = parseInt(result[1]);
                        data = data.substr(Math.max(0, pos - padding), Math.min(data.length - 1, pos + padding));
                        if (pos > padding) {
                            pos = padding;
                        }
                        log.error('Invalid JSON sent to jibo client on host' + this.host + ' at position ' + pos + ' of snippet', data);
                    }
                    else {
                        log.error('Invalid JSON sent to jibo client on host ' + this.host);
                    }
                }
            }
            if (command) {
                this.emit('message', command);
            }
        };
        this._onOpen = () => __awaiter(this, void 0, void 0, function* () {
            this.emit('open');
            if (this._isReconnecting) {
                this._isReconnecting = false;
                this.emit('reopen');
            }
        });
        this._connect();
    }
    send(json) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let payload;
            if (typeof json === 'string') {
                payload = json;
            }
            else {
                try {
                    payload = JSON.stringify(json);
                }
                catch (err) {
                    log.error('Error stringifying json param:', err);
                    return resolve(false);
                }
            }
            yield this._sendMessage(payload, resolve);
        }));
    }
    _sendMessage(payload, resolve) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield jibo_cai_utils_1.PromiseUtils.promisify(cb => this.socket.send(payload, cb));
                resolve(true);
            }
            catch (err) {
                if (!this.socket) {
                    log.warn('Socket doesn\'t exist on send', err);
                }
                else {
                    log.warn(`Socket isn't open on send; readState: ${this.socket.readyState}`, err);
                }
                resolve(false);
            }
        });
    }
}
exports.default = HTTPWSClient;

},{"./log":8,"events":undefined,"jibo-cai-utils":undefined,"ws":undefined}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_log_1 = require("jibo-log");
exports.default = new jibo_log_1.Log('SF.Client');

},{"jibo-log":undefined}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClientRemoteObject_1 = require("./ClientRemoteObject");
exports.ClientRemoteObject = ClientRemoteObject_1.default;
const HTTPClient_1 = require("./HTTPClient");
exports.HTTPClient = HTTPClient_1.default;
const NotificationsDispatcher_1 = require("./NotificationsDispatcher");
exports.NotificationsDispatcher = NotificationsDispatcher_1.default;
const RegistryClient_1 = require("./RegistryClient");
exports.RegistryClient = RegistryClient_1.default;
const RemoteClient_1 = require("./RemoteClient");
exports.RemoteClient = RemoteClient_1.default;
const SystemManagerClient_1 = require("./SystemManagerClient");
exports.SystemManagerClient = SystemManagerClient_1.default;
const WSClient_1 = require("./WSClient");
exports.WSClient = WSClient_1.default;

},{"./ClientRemoteObject":1,"./HTTPClient":2,"./NotificationsDispatcher":3,"./RegistryClient":4,"./RemoteClient":5,"./SystemManagerClient":6,"./WSClient":7}]},{},[9])(9)
});

//# sourceMappingURL=jibo-client-framework.js.map
