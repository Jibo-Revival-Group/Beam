(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jiboKb = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const fs = require("fs-extra");
const path = require("path");
const stream = require("stream");
const url = require("url");
const uuid = require("uuid");
const blobToBuffer = require("blob-to-buffer");
const decorators_1 = require("./decorators");
const log_1 = require("./log");
const log = log_1.default.createChild('Asset');
class Asset {
    constructor(filenameOrURL, subtype, ext) {
        if (!filenameOrURL) {
            this._id = uuid.v4();
            this.subtype = subtype || 'asset';
            this.ext = ext;
        }
        else {
            this.setSelfFromFilenameOrURL(filenameOrURL);
        }
    }
    static _processError(err) {
        if (err.response) {
            let description = `HTTP Error Code ${err.response.status}`;
            if (err.response.data) {
                description += err.response.data;
            }
            return new Error(description);
        }
        else {
            return new Error(err.request
                ? 'No response received'
                : 'Unknown error');
        }
    }
    setRootDir(rootDir) {
        this.rootDir = rootDir;
    }
    filename() {
        let filename = `${this._id}.${this.subtype}`;
        if (this.ext) {
            filename += `.${this.ext}`;
        }
        return filename;
    }
    fullFilenameOrURL() {
        if (!this.rootDir) {
            throw new Error('asset rootDir not set');
        }
        let filename;
        if (this.rootDir.startsWith('http://')) {
            filename = this._url();
        }
        else {
            filename = this.filename();
            filename = path.join(this.rootDir, 'assets', filename);
        }
        return filename;
    }
    toString() { return this.fullFilenameOrURL(); }
    save(data, callback) {
        if (this.rootDir.startsWith('http://')) {
            if ((data instanceof Buffer) || (data instanceof stream.Readable)) {
                this._saveViaWeb(data, callback);
            }
            else {
                blobToBuffer(data, (err, buffer) => {
                    log.iferr(err, 'blobToBuffer');
                    if (!err) {
                        this._saveViaWeb(buffer, callback);
                    }
                    else {
                        callback(err);
                    }
                });
            }
        }
        else {
            if (data instanceof Buffer) {
                this._saveBuffer(data, callback);
            }
            else if (data instanceof stream.Readable) {
                this._saveStream(data, callback);
            }
            else {
                blobToBuffer(data, (err, buffer) => {
                    log.iferr(err, 'blobToBuffer');
                    if (!err) {
                        this._saveBuffer(buffer, callback);
                    }
                    else {
                        callback(err);
                    }
                });
            }
        }
    }
    setSelfFromFilenameOrURL(filenameOrURL) {
        if (filenameOrURL.startsWith('http://')) {
            this._setSelfFromURL(filenameOrURL);
        }
        else {
            this._setSelfFromFilename(filenameOrURL);
        }
    }
    load(callback) {
        if (this.rootDir.startsWith('http://')) {
            this._loadBufferViaWeb(callback);
        }
        else {
            let filename = this.fullFilenameOrURL();
            fs.readFile(filename, (err, data) => {
                log.iferr(err, 'readFile on', filename);
                callback(err, data);
            });
        }
    }
    loadStream() {
        if (this.rootDir.startsWith('http://')) {
            return this._loadStreamViaWeb();
        }
        else {
            let filename = this.fullFilenameOrURL();
            return Promise.resolve(fs.createReadStream(filename));
        }
    }
    loadBlob(callback) {
        this.load((err, data) => {
            let blob;
            log.iferr(err, 'could not load asset file');
            if (!err) {
                blob = new Blob(data, { type: 'application/octet-binary' });
            }
            callback(err, blob);
        });
    }
    remove(callback) {
        if (this.rootDir.startsWith('http://')) {
            this._removeViaWeb(callback);
        }
        else {
            let filename = this.fullFilenameOrURL();
            log.info('removing asset file', filename);
            fs.unlink(filename, (err) => {
                log.iferr(err, 'fs.unlink of', filename);
                if (!err) {
                    log.debug('asset file', filename, 'removed from disk');
                }
                callback(err);
            });
        }
    }
    _url() {
        if (!this.rootDir) {
            throw new Error('asset rootDir not set');
        }
        let filename = this.filename();
        return `${this.rootDir}/asset/${filename}`;
    }
    _saveViaWeb(data, callback) {
        let url = this._url();
        axios_1.default.post(url, data, {
            headers: { 'Content-Type': 'application/octet-stream' }
        }).then(res => callback(null, url), (err) => {
            log.error('axios.post', url, err);
            callback(Asset._processError(err));
        });
    }
    _setSelfFromFilename(filename) {
        if (path.isAbsolute(filename)) {
            this.rootDir = path.dirname(path.dirname(filename));
            filename = path.basename(filename);
        }
        let re = new RegExp(`^([^.]*)[.]([^.]*)([.]([^.]*))?$`);
        let vals = filename.match(re);
        if (!vals) {
            throw new Error('filename did not parse');
        }
        this._id = vals[1];
        this.subtype = vals[2] || '';
        this.ext = vals[4] || '';
    }
    _setSelfFromURL(httpurl) {
        let urlParts = url.parse(httpurl);
        let pathParts = urlParts.pathname.split('/');
        let rootPath = pathParts.slice(0, 3).join('/');
        this.rootDir = `http://${urlParts.hostname}:${urlParts.port}/${rootPath}`;
        let filename = pathParts[pathParts.length - 1];
        this._setSelfFromFilename(filename);
    }
    _removeViaWeb(callback) {
        let url = this._url();
        axios_1.default.delete(url).then(res => callback(null), (err) => {
            log.error('axios.delete', url, err);
            callback(Asset._processError(err));
        });
    }
    _saveBuffer(buffer, callback) {
        if (!buffer) {
            callback();
            return;
        }
        let filename = this.fullFilenameOrURL();
        fs.ensureDir(path.dirname(filename), (err) => {
            log.iferr(err, 'ensureDir');
            if (!err) {
                log.info('writing asset file', filename);
                fs.writeFile(filename, buffer, (err) => {
                    log.iferr(err, 'file write error', filename);
                    callback(err, filename);
                });
            }
            else {
                callback(err);
            }
        });
    }
    _saveStream(stream, callback) {
        if (!stream) {
            callback();
            return;
        }
        let filename = this.fullFilenameOrURL();
        fs.ensureDir(path.dirname(filename), (err) => {
            log.iferr(err, 'ensureDir');
            if (!err) {
                log.info('writing asset file', filename);
                let writeStream = fs.createWriteStream(filename);
                stream.pipe(writeStream);
                writeStream.on('finish', () => {
                    callback(null, filename);
                });
                writeStream.on('error', (err) => {
                    log.error('file write error', filename, err);
                });
            }
            else {
                callback(err);
            }
        });
    }
    _loadBufferViaWeb(callback) {
        let url = this._url();
        axios_1.default.get(url, {
            responseType: 'arraybuffer',
        }).then(res => callback(null, new Buffer(res.data)), (err) => {
            log.error('request.get', url, err);
            callback(Asset._processError(err));
        });
    }
    _loadStreamViaWeb() {
        return axios_1.default.get(this._url(), {
            responseType: 'stream',
        }).then(response => response.data);
    }
}
__decorate([
    decorators_1.promisify
], Asset.prototype, "save", null);
__decorate([
    decorators_1.promisify
], Asset.prototype, "load", null);
__decorate([
    decorators_1.promisify
], Asset.prototype, "loadBlob", null);
__decorate([
    decorators_1.promisify
], Asset.prototype, "remove", null);
exports.default = Asset;

},{"./decorators":15,"./log":16,"axios":undefined,"blob-to-buffer":undefined,"fs-extra":undefined,"path":undefined,"stream":undefined,"url":undefined,"uuid":undefined}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("./log");
const log = log_1.default.createChild('Cache');
class Cache {
    fetch(id, quietly = false) {
        let node = undefined;
        if (id in this) {
            node = this[id];
        }
        else {
            if (!quietly) {
                log.warn('fetch id', id, 'not in cache');
            }
        }
        return node;
    }
    add(node, quietly = false) {
        if (node && node._id) {
            this._add(node._id, node, quietly);
        }
        else {
            log.error('add: can not add invalid object', node);
        }
    }
    remove(idOrNode, quietly = false) {
        let id = this._toId(idOrNode);
        if (id) {
            if (id in this) {
                delete this[id];
            }
            else {
                if (!quietly) {
                    log.warn('remove: id not in cache', id);
                }
            }
        }
        else {
            log.error('remove: invalid idOrNode', idOrNode);
        }
    }
    isPresent(idOrNode) {
        let id = this._toId(idOrNode);
        if (!id) {
            log.error('isPresent: invalid idOrNode', idOrNode);
        }
        return (id in this);
    }
    interceptLoad(id, callback, load) {
        let node = this.fetch(id, true);
        if (node) {
            setImmediate(() => {
                callback(null, node);
            });
        }
        else {
            load(id, (err, loadedNode) => {
                if (!err) {
                    if (loadedNode) {
                        this.add(loadedNode);
                    }
                    else {
                        this._add(id, null);
                    }
                }
                callback(err, loadedNode);
            });
        }
    }
    _add(_id, value, quietly = false) {
        if (!(_id in this)) {
            this[_id] = value;
        }
        else if (this[_id] === null) {
            this[_id] = value;
        }
        else {
            if (Object.is(value, this[_id])) {
                if (!quietly) {
                    log.warn('add: there was already an entry in the cache for node id', _id);
                }
            }
            else {
                log.warn('add: existing entry for node id', _id, 'and new object does not match it!');
                this[_id] = value;
            }
        }
    }
    _toId(idOrNode) {
        if (typeof idOrNode === 'object') {
            idOrNode = idOrNode._id;
        }
        return idOrNode;
    }
}
exports.default = Cache;

},{"./log":16}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Collection = require("nedb");
const log_1 = require("./log");
const log = log_1.default.createChild('Database');
class Database {
    constructor(filename) {
        this.filename = filename;
    }
    init(callback) {
        this.nodes = new Collection({ filename: this.filename });
        this.nodes.loadDatabase((err) => {
            log.iferr(err, 'Collection#loadDatabase for nodes', this.filename);
            if (!err) {
                this.nodes.count({}, (err, count) => {
                    log.iferr(err, 'error counting nodes in', this.filename);
                    if (!err) {
                        log.info(count, 'KB node' + ((count === 1) ? '' : 's') + ' in', this.filename);
                    }
                    callback(err, count);
                });
            }
            else {
                callback(err);
            }
        });
    }
    load(id, callback) {
        this.nodes.findOne({ _id: id }, (err, node) => {
            log.iferr(err, 'Database#findOne of', id, 'on', this.filename);
            callback(err, node);
        });
    }
    loadList(ids, callback) {
        this.nodes.find({ _id: { $in: ids } }, (err, nodes) => {
            log.iferr(err, 'Database#find of _id $in ', ids, 'on', this.filename);
            callback(err, nodes);
        });
    }
    loadNodeOfType(nodeType, callback) {
        this.nodes.findOne({ type: nodeType }, (err, node) => {
            log.iferr(err, 'Database#findOne of type', nodeType, 'on', this.filename);
            callback(err, node);
        });
    }
    loadNodesOfType(nodeType, callback) {
        let q = { type: nodeType };
        this.nodes.find(q).exec((err, nodes) => {
            log.iferr(err, 'Collection#find error');
            callback(err, nodes);
        });
    }
    save(node, callback) {
        if (!node._id) {
            throw new Error('node does not have an id');
        }
        this.nodes.update({ _id: node._id }, node, { upsert: true }, (err, numReplaced) => {
            log.iferr(err, 'Collection#update error', this.filename);
            if (err) {
                node._id = undefined;
            }
            if (callback) {
                callback(err, node);
            }
        });
    }
    remove(idOrNode, callback) {
        let id = this._toId(idOrNode);
        this.nodes.remove({ _id: id }, {}, (err, numRemoved) => {
            log.iferr(err, 'Database#remove of', id, 'on', this.filename);
            if (callback) {
                callback(err, numRemoved);
            }
        });
    }
    _toId(idOrNode) {
        if (typeof idOrNode === 'object') {
            idOrNode = idOrNode._id;
        }
        return idOrNode;
    }
}
exports.default = Database;

},{"./log":16,"nedb":undefined}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fsExtra = require("fs-extra");
const KnowledgeDatabase_1 = require("./KnowledgeDatabase");
const log_1 = require("./log");
const log = log_1.default.createChild('DatabaseManager');
class DatabaseManager {
    static get(kbName, callback) {
        let database = this.databases[kbName];
        if (database) {
            setImmediate(() => {
                callback(null, database);
            });
        }
        else {
            this.exists(kbName, (err, exists) => {
                if (err || !exists) {
                    callback(new Error('KB slice ' + kbName + ' does not exist, create it first'));
                }
                else {
                    database = new KnowledgeDatabase_1.default(kbName);
                    this.databases[kbName] = database;
                    database.init((err) => {
                        log.iferr(err, 'KnowledgeDatabase.init');
                        if (!err) {
                            callback(null, database);
                        }
                        else {
                            callback(err);
                        }
                    });
                }
            });
        }
    }
    static exists(kbName, callback) {
        const dbFilename = KnowledgeDatabase_1.default.getKbFilename(kbName);
        fs.access(dbFilename, (err) => {
            let exists = !err;
            callback(null, exists);
        });
    }
    get databases() {
        return DatabaseManager.databases;
    }
    create(kbName, callback) {
        if (this.databases[kbName]) {
            setImmediate(() => {
                callback(null, false);
            });
        }
        else {
            const dbDirectory = KnowledgeDatabase_1.default.getKbDirectory(kbName);
            fsExtra.ensureDir(dbDirectory, (err) => {
                if (err) {
                    callback(err);
                }
                else {
                    const dbFilename = KnowledgeDatabase_1.default.getKbFilename(kbName);
                    fs.open(dbFilename, 'ax', (err, fd) => {
                        let created = false;
                        if (err) {
                            if (err && err.code === 'EEXIST') {
                                err = null;
                                created = false;
                            }
                        }
                        else {
                            fs.close(fd);
                            created = true;
                        }
                        callback(err, created);
                    });
                }
            });
        }
    }
    exists(kbName, callback) {
        DatabaseManager.exists(kbName, callback);
    }
    get(kbName, callback) {
        DatabaseManager.get(kbName, callback);
    }
    release(kbName) {
        delete this.databases[kbName];
    }
}
DatabaseManager.databases = {};
exports.DatabaseManager = DatabaseManager;
exports.default = DatabaseManager;

},{"./KnowledgeDatabase":6,"./log":16,"fs":undefined,"fs-extra":undefined}],5:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const querystring = require("querystring");
const decorators_1 = require("./decorators");
const Model_1 = require("./Model");
const KnowledgeDatabase_1 = require("./KnowledgeDatabase");
const Node_1 = require("./Node");
const Asset_1 = require("./Asset");
const DatabaseManager_1 = require("./DatabaseManager");
const LoopModel_1 = require("./LoopModel");
const UserNode_1 = require("./UserNode");
const RobotModel_1 = require("./RobotModel");
const RobotRootNode_1 = require("./RobotRootNode");
const log_1 = require("./log");
const log = log_1.default.createChild('KnowledgeBase');
class KnowledgeBase {
    constructor() {
        this.Asset = Asset_1.default;
        this.KnowledgeDatabase = KnowledgeDatabase_1.default;
        this.Model = Model_1.default;
        this.Node = Node_1.default;
        this.databaseManager = new DatabaseManager_1.default();
        this.onInitCallbacks = [];
        this.registerModelClass('jibo/loop', LoopModel_1.default);
        this.registerNodeClass('user', UserNode_1.default, 'jibo/loop');
        this.registerModelClass('jibo/robot', RobotModel_1.default);
        this.registerNodeClass('root', RobotRootNode_1.default, 'jibo/robot');
    }
    static _processError(err) {
        if (err.response) {
            let description = `HTTP Error Code ${err.response.status}`;
            if (err.response.data) {
                description += err.response.data;
            }
            return new Error(description);
        }
        else {
            return new Error(err.request
                ? 'No response received'
                : 'Unknown error');
        }
    }
    init(service, callback) {
        this.httpUrl = 'http://' + service.host + ':' + service.port;
        process.nextTick(callback);
        this.onInitCallbacks.forEach((onInitCallback) => {
            process.nextTick(onInitCallback);
        });
        this.onInitCallbacks = [];
        this.robot = this.createModel('/jibo/robot');
    }
    onInit(callback) {
        if (!this.httpUrl) {
            this.onInitCallbacks.push(callback);
        }
        else {
            process.nextTick(() => {
                callback(null);
            });
        }
    }
    initLoop() {
        let loop = this.createModel('/jibo/loop');
        this.loop = loop;
    }
    initMedia() {
        return;
    }
    createSlice(sliceName, httpUrl, callback) {
        if (typeof httpUrl === 'function' && !callback) {
            callback = httpUrl;
            httpUrl = null;
        }
        httpUrl = httpUrl || this.httpUrl;
        let escapedName = querystring.escape(sliceName);
        let url = `${this.httpUrl}/v1/kb/${escapedName}/create`;
        axios_1.default.post(url).then(res => {
            let created = res.data && res.data.created;
            if (callback) {
                callback(null, created);
            }
        }, (err) => {
            log.error('axios.post', url, err.message);
            if (callback) {
                callback(KnowledgeBase._processError(err));
            }
        });
    }
    existsSlice(sliceName, httpUrl, callback) {
        if (typeof httpUrl === 'function' && !callback) {
            callback = httpUrl;
            httpUrl = null;
        }
        httpUrl = httpUrl || this.httpUrl;
        let escapedName = querystring.escape(sliceName);
        let url = `${this.httpUrl}/v1/kb/${escapedName}/exists`;
        axios_1.default.get(url).then(res => {
            let exists = res.data && res.data.exists;
            if (callback) {
                callback(null, exists);
            }
        }, (err) => {
            log.error('axios.get', url, err);
            if (callback) {
                callback(KnowledgeBase._processError(err));
            }
        });
    }
    createModel(kbNames, httpUrl) {
        httpUrl = httpUrl || this.httpUrl;
        if (!httpUrl) {
            throw new Error('Knowledge Base has not been inited');
        }
        let newKBNames = [];
        this._toArray(kbNames).forEach((kbName) => {
            if (!kbName.startsWith('/')) {
                throw new Error('kb#createModel: kb names must be rooted (must start with /)');
            }
            else {
                kbName = kbName.substr(1);
            }
            newKBNames.push(kbName);
        });
        let ModelClass = this.findModelClass(newKBNames);
        return new ModelClass(newKBNames, httpUrl);
    }
    registerNodeClass(nodeType, classConstructor, kbName = '*') {
        Node_1.default.registerNodeClass(nodeType, classConstructor, kbName);
    }
    registerModelClass(kbNames, classConstructor) {
        Model_1.default.registerModelClass(kbNames, classConstructor);
    }
    findNodeClass(nodeType, kbName) {
        return Node_1.default.findNodeClass(nodeType, kbName);
    }
    findModelClass(kbNames) {
        return Model_1.default.findModelClass(kbNames);
    }
    removeSlice(sliceName, callback) {
        let escapedName = querystring.escape(sliceName);
        let url = `${this.httpUrl}/v1/kb/${escapedName}/remove/yesiamsure`;
        axios_1.default.delete(url).then(res => {
            if (callback) {
                callback(null);
            }
        }, (err) => {
            log.error('axios.del', url, err);
            if (callback) {
                callback(KnowledgeBase._processError(err));
            }
        });
    }
    removeAll(callback) {
        let url = `${this.httpUrl}/v1/removeall/yesiamsure`;
        axios_1.default.delete(url).then(res => {
            if (callback) {
                callback(null);
            }
        }, (err) => {
            log.error('axios.del', url, err);
            if (callback) {
                callback(KnowledgeBase._processError(err));
            }
        });
    }
    _toArray(items) {
        if (!Array.isArray(items)) {
            return [items];
        }
        else {
            return items;
        }
    }
}
__decorate([
    decorators_1.promisify
], KnowledgeBase.prototype, "onInit", null);
__decorate([
    decorators_1.promisify
], KnowledgeBase.prototype, "createSlice", null);
__decorate([
    decorators_1.promisify
], KnowledgeBase.prototype, "existsSlice", null);
__decorate([
    decorators_1.promisify
], KnowledgeBase.prototype, "removeSlice", null);
__decorate([
    decorators_1.promisify
], KnowledgeBase.prototype, "removeAll", null);
exports.default = KnowledgeBase;

},{"./Asset":1,"./DatabaseManager":4,"./KnowledgeDatabase":6,"./LoopModel":7,"./Model":8,"./Node":9,"./RobotModel":10,"./RobotRootNode":12,"./UserNode":13,"./decorators":15,"./log":16,"axios":undefined,"querystring":undefined}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const Database_1 = require("./Database");
const Node_1 = require("./Node");
const log_1 = require("./log");
const log = log_1.default.createChild('KnowledgeDatabase');
const reservedNames = ['nodes', 'assets'];
const RunMode = {
    SIMULATOR: "SIMULATOR",
    REMOTELY: "REMOTELY",
    ON_ROBOT: "ON_ROBOT",
    UNIT_TESTS: "UNIT_TESTS"
};
class KnowledgeDatabase {
    constructor(kbName) {
        this.kbName = kbName;
        KnowledgeDatabase._validateKbName(kbName);
        this.dbDirectory = KnowledgeDatabase.getKbDirectory(this.kbName);
        this.dbFilename = KnowledgeDatabase.getKbFilename(this.kbName);
    }
    static getRootDirectory() {
        if (this._onRobot()) {
            return '/opt/jibo/Knowledge';
        }
        else {
            return path.join(process.env.HOME || process.env.USERPROFILE, '.jibo', 'kb');
        }
    }
    static getKbDirectory(kbName) {
        KnowledgeDatabase._validateKbName(kbName);
        let rootDirectory = KnowledgeDatabase.getRootDirectory();
        return path.join(rootDirectory, kbName);
    }
    static getKbFilename(kbName) {
        KnowledgeDatabase._validateKbName(kbName);
        const dbDirectory = KnowledgeDatabase.getKbDirectory(kbName);
        return path.join(dbDirectory, 'nodes');
    }
    static _validateKbName(kbName) {
        if (kbName.length > 200) {
            throw new Error('kb name is too long');
        }
        if (/[^a-z0-9\/_-]/.test(kbName)) {
            throw new Error('illegal character in kb name');
        }
        if (kbName.endsWith('/')) {
            throw new Error('kb name ends with a slash');
        }
        let parts = kbName.split('/');
        if (parts.length > 10) {
            throw new Error('kb name has too many sub directories');
        }
        parts.forEach((part, n) => {
            if (part.length === 0 && n !== 0) {
                throw new Error('kb name component is empty');
            }
            if (part.length > 75) {
                throw new Error('kb name component is too long');
            }
            if (/^[^a-z0-9]/.test(part)) {
                throw new Error('kb names must start with an alphanumeric character');
            }
            if (reservedNames.indexOf(part) >= 0) {
                throw new Error('kb name is reserved word');
            }
        });
    }
    static _onRobot() {
        let runMode = process.env.runMode || process.env.RUNMODE;
        if (!runMode && process.platform === 'linux' && process.arch === 'arm') {
            runMode = RunMode.ON_ROBOT;
        }
        return (runMode === RunMode.ON_ROBOT);
    }
    init(callback) {
        this._setupDirectory((err) => {
            log.iferr(err, 'KnowledgeDatabase#_setupDirectory');
            if (!err) {
                this.database = new Database_1.default(this.dbFilename);
                this.database.init((err, nodeCount) => {
                    log.iferr(err, 'Database#init');
                    if (!err) {
                        if (nodeCount === 0) {
                            log.info('creating root node for', this.kbName);
                            let NodeClass = Node_1.default.findNodeClass('root', this.kbName);
                            let rootNode = new NodeClass('root');
                            this.adoptNodeAsOurOwn(rootNode);
                            rootNode.save((err) => {
                                log.iferr(err, 'error creating initial root node for', this.kbName);
                                callback(err);
                            });
                        }
                        else {
                            callback(err);
                        }
                    }
                    else {
                        callback(err);
                    }
                });
            }
        });
    }
    load(id, callback) {
        this.database.load(id, (err, data) => {
            if (!err) {
                let node = null;
                if (data) {
                    node = this.createNodeFromObject(data);
                }
                callback(null, node);
            }
            else {
                callback(err);
            }
        });
    }
    loadList(ids, callback) {
        this.database.loadList(ids, (err, data) => {
            if (!err) {
                let nodes = [];
                if (data) {
                    const resultsMap = {};
                    data.forEach(node => {
                        if (node) {
                            resultsMap[node._id] =
                                this.createNodeFromObject(node);
                        }
                    });
                    nodes = ids.map(id => resultsMap[id] || null);
                }
                callback(null, nodes);
            }
            else {
                callback(err);
            }
        });
    }
    loadRoot(callback) {
        this.database.loadNodeOfType('root', (err, data) => {
            log.iferr(err, 'Database#loadNodeOfType');
            let node;
            if (!err && data) {
                node = this.createNodeFromObject(data);
            }
            callback(err, node);
        });
    }
    save(node, callback) {
        node.setUpdated();
        this.database.save(node, (err) => {
            if (callback) {
                callback(err);
            }
        });
    }
    remove(idOrNode, callback) {
        let id = this.toId(idOrNode);
        this.database.remove(id, callback);
    }
    createNodeFromObject(object) {
        let nodeType = object.type || 'node';
        let NodeClass = Node_1.default.findNodeClass(nodeType, this.kbName);
        let node = new NodeClass(null, null, object);
        this.adoptNodeAsOurOwn(node);
        return node;
    }
    createNode(nodeTypeOrClass, data) {
        let NodeClass;
        let nodeType;
        if (typeof nodeTypeOrClass === 'function') {
            NodeClass = nodeTypeOrClass;
        }
        else {
            nodeType = nodeTypeOrClass;
            NodeClass = Node_1.default.findNodeClass(nodeType, this.kbName);
            if (nodeType === 'root') {
                throw new Error('can not create additional root nodes');
            }
        }
        let node;
        if (nodeType && NodeClass === Node_1.default) {
            node = new NodeClass(nodeType, data);
        }
        else {
            node = new NodeClass(data);
        }
        this.adoptNodeAsOurOwn(node);
        return node;
    }
    adoptNodeAsOurOwn(node) {
        node.setKb(this);
    }
    getDirectory() {
        return this.dbDirectory;
    }
    toId(idOrNode) {
        if (typeof idOrNode === 'object') {
            idOrNode = idOrNode._id;
        }
        return idOrNode;
    }
    _setupDirectory(callback) {
        fs.ensureDir(this.dbDirectory, callback);
    }
}
exports.default = KnowledgeDatabase;

},{"./Database":3,"./Node":9,"./log":16,"fs-extra":undefined,"path":undefined}],7:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const jibo_client_framework_1 = require("jibo-client-framework");
const jibo_typed_events_1 = require("jibo-typed-events");
const decorators_1 = require("./decorators");
const Model_1 = require("./Model");
const log_1 = require("./log");
const log = log_1.default.createChild('LoopModel');
class LoopModelEvents extends jibo_typed_events_1.EventContainer {
    constructor() {
        super(...arguments);
        this.loopUpdated = new jibo_typed_events_1.Event('Loop has been updated');
    }
}
exports.LoopModelEvents = LoopModelEvents;
class LoopModel extends Model_1.default {
    constructor(kbNames, httpUrl = null) {
        super(kbNames, httpUrl);
        this.events = new LoopModelEvents();
        this._listenForWSMessages();
    }
    static _processError(err) {
        if (err.response) {
            let description = `HTTP Error Code ${err.response.status}`;
            if (err.response.data) {
                description += err.response.data;
            }
            return new Error(description);
        }
        else {
            return new Error(err.request
                ? 'No response received'
                : 'Unknown error');
        }
    }
    loadLoop(callback) {
        this.loadLoopAll((err, loop) => {
            if (!err) {
                callback(null, this._notDeclinedOrRemoved(loop));
            }
            else {
                callback(err);
            }
        });
    }
    loadLoopInvited(callback) {
        this.loadLoop(callback);
    }
    loadLoopActive(callback) {
        this.loadLoop(callback);
    }
    loadLoopAll(callback) {
        this.loadRoot(null, (err, rootNode) => {
            log.iferr(err, 'loadRoot');
            if (!err && rootNode) {
                let userIds = rootNode.getEdges('user');
                this.load(userIds, (err, nodes) => {
                    log.iferr(err, 'load');
                    callback(err, nodes);
                });
            }
            else {
                callback(err);
            }
        });
    }
    getUserNodeById(id, callback) {
        this.loadLoop((err, loop) => {
            if (err) {
                return callback(err);
            }
            let user = loop.find((node) => {
                return node.id === id;
            });
            if (user) {
                callback(null, user);
            }
            else {
                callback(new Error('Could not find user node for loop id ' + id));
            }
        });
    }
    getWrittenNameById(id, callback) {
        this.getUserNodeById(id, (error, user) => {
            if (error) {
                return callback(error);
            }
            callback(null, user.getWrittenName());
        });
    }
    getSpokenNameById(id, callback) {
        this.getUserNodeById(id, (error, user) => {
            if (error) {
                return callback(error);
            }
            callback(null, user.toString());
        });
    }
    fetchLoop() {
        return this._onlyAccepted(this.fetchLoopAll());
    }
    fetchLoopInvited() {
        return this.fetchLoop();
    }
    fetchLoopActive() {
        return this.fetchLoop();
    }
    fetchLoopAll() {
        return this.fetch(this.fetchRoot().getEdges('user'));
    }
    setPhoneticName(idOrNode, phoneticName, callback) {
        let memberId = (typeof idOrNode === 'object') ? idOrNode._id : idOrNode;
        let url = `${this.httpUrl}/v1/loop/updatePhoneticName`;
        this.loadRoot((err, root) => {
            log.iferr(err, 'loadRoot');
            let params = {
                loopId: root.data.id,
                id: memberId,
                phoneticName: phoneticName
            };
            axios_1.default.post(url, params).then(res => callback(null), (err) => {
                log.error('axios.post', url, err);
                callback(LoopModel._processError(err));
            });
        });
    }
    setEnrollmentFace(idOrNode, face, callback) {
        let memberId = (typeof idOrNode === 'object') ? idOrNode._id : idOrNode;
        let params = {
            id: memberId,
            face: !!face
        };
        this.setEnrollment(params, callback);
    }
    setEnrollmentVoice(idOrNode, voice, callback) {
        let memberId = (typeof idOrNode === 'object') ? idOrNode._id : idOrNode;
        let params = {
            id: memberId,
            voice: !!voice
        };
        this.setEnrollment(params, callback);
    }
    setEnrollment(params, callback) {
        let url = `${this.httpUrl}/v1/loop/enrollment`;
        this.loadRoot((err, root) => {
            log.iferr(err, 'loadRoot');
            params.loopId = root.data.id;
            axios_1.default.post(url, params).then(res => {
                if (callback) {
                    callback(null);
                }
            }, (err) => {
                log.error('axios.post', url, err);
                if (callback) {
                    callback(LoopModel._processError(err));
                }
            });
        });
    }
    suspend(callback) {
        let url = `${this.httpUrl}/v1/loop/suspend`;
        this.loadRoot((err, root) => {
            log.iferr(err, 'loadRoot');
            let params = {
                loopId: root.data.id
            };
            axios_1.default.post(url, params).then(res => {
                if (callback) {
                    callback(null);
                }
            }, (err) => {
                log.error('axios.post', url, err);
                if (callback) {
                    callback(LoopModel._processError(err));
                }
            });
        });
    }
    hasKeyBackup(callback) {
        this.loadRoot((err, root) => {
            log.iferr(err, 'loadRoot');
            let loopId = root.data.id;
            let url = `${this.httpUrl}/v1/loop/hasKeyBackup/${loopId}`;
            axios_1.default.get(url).then(res => {
                let hasKeyBackup = !!(res.data && res.data.hasKeyBackup);
                if (callback) {
                    callback(null, hasKeyBackup);
                }
            }, (err) => {
                log.error('axios.get', url, err);
                if (callback) {
                    callback(LoopModel._processError(err));
                }
            });
        });
    }
    _notDeclinedOrRemoved(loop) {
        loop.forEach(user => {
            if (!user.data) {
                log.error('loop entry with missing data', user._id);
            }
        });
        return loop.filter(user => user.data && user.data.status !== 'declined' && user.data.status !== 'removed');
    }
    _onlyAccepted(loop) {
        return loop.filter(user => user.data.status === 'accepted');
    }
    _listenForWSMessages() {
        this._wsClient = new jibo_client_framework_1.WSClient(this.httpUrl);
        this._wsClient.on('message', this._wsMessageReceived.bind(this));
    }
    _wsMessageReceived(message) {
        switch (message) {
            case 'LoopUpdated':
                console.log('LoopModel: received LoopUpdated event; emitting LoopModelEvents.loopUpdate');
                this.events.loopUpdated.emit();
                break;
            default:
                console.warn('LoopModel: received unknown message from KBService', message);
        }
    }
}
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "loadLoop", null);
__decorate([
    decorators_1.promisify,
    decorators_1.deprecate('loadLoopInvited is no longer useful, use loadLoop() instead')
], LoopModel.prototype, "loadLoopInvited", null);
__decorate([
    decorators_1.promisify,
    decorators_1.deprecate('loadLoopActive is no longer useful, use loadLoop() instead')
], LoopModel.prototype, "loadLoopActive", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "loadLoopAll", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "getUserNodeById", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "getWrittenNameById", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "getSpokenNameById", null);
__decorate([
    decorators_1.deprecate('no longer useful, use fetchLoop() instead')
], LoopModel.prototype, "fetchLoopInvited", null);
__decorate([
    decorators_1.deprecate('no longer useful, use fetchLoop() instead')
], LoopModel.prototype, "fetchLoopActive", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "setPhoneticName", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "setEnrollmentFace", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "setEnrollmentVoice", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "setEnrollment", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "suspend", null);
__decorate([
    decorators_1.promisify
], LoopModel.prototype, "hasKeyBackup", null);
exports.default = LoopModel;

},{"./Model":8,"./decorators":15,"./log":16,"axios":undefined,"jibo-client-framework":undefined,"jibo-typed-events":undefined}],8:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const decorators_1 = require("./decorators");
const Cache_1 = require("./Cache");
const DatabaseManager_1 = require("./DatabaseManager");
const WebClient_1 = require("./WebClient");
const log_1 = require("./log");
const log = log_1.default.createChild('Model');
class Model {
    constructor(kbNames, httpUrl = null) {
        this.kbNames = this._toArray(kbNames);
        this.httpUrl = httpUrl;
        this.pool = [];
        if (this.httpUrl) {
            this.kbNames.forEach((kbName) => {
                let knowledgeDatabase = new WebClient_1.default(kbName, this.httpUrl);
                this.pool.push(knowledgeDatabase);
            });
        }
    }
    static registerModelClass(kbNames, classConstructor) {
        if (!Array.isArray(kbNames)) {
            kbNames = [kbNames];
        }
        let key = kbNames.join(';');
        let registry = this.modelClassRegistry;
        if (registry[key]) {
            log.warn('registerModelClass: overwriting previous class registered for ', key);
        }
        registry[key] = classConstructor;
    }
    static findModelClass(kbNames) {
        if (!Array.isArray(kbNames)) {
            kbNames = [kbNames];
        }
        let key = kbNames.join(';');
        let ModelClass = Model;
        let registry = this.modelClassRegistry;
        if (registry[key]) {
            ModelClass = registry[key];
        }
        return ModelClass;
    }
    init(callback) {
        if (this.httpUrl) {
            setImmediate(callback);
        }
        else {
            let tasks = [];
            this.kbNames.forEach((kbName) => {
                tasks.push((next) => {
                    DatabaseManager_1.default.get(kbName, next);
                });
            });
            async.series(tasks, (err, results) => {
                log.iferr(err, 'KnowledgeDatabase#init');
                if (!err) {
                    this.pool = results;
                }
                callback(err);
            });
        }
    }
    createModel(kbNames, httpUrl = null) {
        kbNames = this._toArray(kbNames);
        httpUrl = httpUrl || this.httpUrl;
        let defaultBaseName = this.kbNames[0];
        let newKBNames = [];
        kbNames.forEach((kbName) => {
            if (!kbName.startsWith('/')) {
                kbName = '/' + defaultBaseName + '/' + kbName;
            }
            newKBNames.push(kbName);
        });
        let ModelClass = Model.findModelClass(newKBNames);
        return new ModelClass(newKBNames, httpUrl);
    }
    createNode(nodeType, data) {
        let node = this.pool[0].createNode(nodeType, data);
        if (this.cache) {
            this.cache.add(node);
        }
        return node;
    }
    load(ids, callback) {
        if (!Array.isArray(ids)) {
            this._loadOne(ids, callback);
        }
        else {
            this._loadArray(ids, callback);
        }
    }
    loadList(ids, callback) {
        throw new Error('kb.Model.loadList is an unsupported method, use kb.Model.load');
    }
    fetchList(ids, quietly = false) {
        throw new Error('kb.Model.fetchList is an unsupported method, use kb.Model.fetch');
    }
    loadRoot(kbName, callback) {
        if (typeof kbName === 'function' && !callback) {
            callback = kbName;
            kbName = null;
        }
        let knowledgeDatabase;
        if (!kbName) {
            knowledgeDatabase = this.pool[0];
        }
        else {
            knowledgeDatabase = this._getKnowledgeDatabase(kbName);
        }
        if (!knowledgeDatabase) {
            setImmediate(() => {
                let err = new Error('loadRoot kb slice name ' + kbName + ' not found');
                callback(err);
            });
        }
        else {
            if (this.cache) {
                let rootNode = this.fetchRoot(kbName, true);
                if (rootNode) {
                    setImmediate(() => {
                        callback(null, rootNode);
                    });
                }
                else {
                    knowledgeDatabase.loadRoot((err, loadedRootNode) => {
                        if (!err && loadedRootNode) {
                            this.roots[kbName] = loadedRootNode;
                        }
                        callback(err, loadedRootNode);
                    });
                }
            }
            else {
                knowledgeDatabase.loadRoot(callback);
            }
        }
    }
    loadLayers(node, layers, callback) {
        let action = (eachNode, callback) => callback();
        this.visitLayers(node, layers, action, callback);
    }
    saveLayers(node, layers, callback) {
        let action = (eachNode, callback) => eachNode.save(callback);
        this.visitLayers(node, layers, action, callback);
    }
    visitLayers(node, layers, action, callback) {
        if (!node) {
            return callback();
        }
        layers = this._toArray(layers);
        let visited = {};
        visited[node._id] = true;
        let visitNodes = (idList, callback) => {
            let tasks = [];
            let queue = [];
            idList.forEach((id) => {
                if (!(id in visited)) {
                    visited[id] = true;
                    tasks.push((next) => {
                        this.load(id, (err, eachNode) => {
                            if (!err && eachNode) {
                                action(eachNode, (err) => {
                                    eachNode.getEdges(layers).forEach((everyId) => {
                                        if (!(everyId in visited)) {
                                            queue.push(everyId);
                                        }
                                    });
                                    next(err);
                                });
                            }
                            else {
                                next(err);
                            }
                        });
                    });
                }
            });
            async.series(tasks, (err) => {
                if (!err && queue.length) {
                    visitNodes(queue, callback);
                }
                else {
                    callback(err);
                }
            });
        };
        action(node, (err) => {
            log.iferr(err, 'action on initial node failed');
            if (!err) {
                visitNodes(node.getEdges(layers), callback);
            }
            else {
                callback(err);
            }
        });
    }
    begin() {
        let ourConstructor = this.constructor;
        let model = new ourConstructor(this.kbNames, this.httpUrl);
        model.enableCache();
        return model;
    }
    fetch(ids, quietly = false) {
        this._assertCache();
        if (!Array.isArray(ids)) {
            return this.cache.fetch(ids, quietly);
        }
        else {
            const list = [];
            const notFoundIds = [];
            ids.forEach((id) => {
                const node = this.cache.fetch(id, true);
                if (node || node === null) {
                    list.push(node);
                }
                else {
                    list.push(undefined);
                    notFoundIds.push(id);
                }
            });
            if (notFoundIds.length && !quietly) {
                log.warn('fetchList ids were not in cache, skipped', notFoundIds.join(', '));
            }
            return list;
        }
    }
    fetchRoot(kbName, quietly = false) {
        this._assertCache();
        if (!kbName) {
            kbName = this.pool[0].kbName;
        }
        let root = null;
        if (this.roots[kbName]) {
            root = this.roots[kbName];
        }
        else {
            if (!quietly) {
                log.warn('fetchRoot for name', kbName, 'root not in cache');
            }
        }
        return root;
    }
    enableCache() {
        this.cache = new Cache_1.default();
        this.roots = {};
    }
    _load(id, callback) {
        const tasks = [];
        this.pool.forEach((knowledgeDatabase) => {
            tasks.push((node, next) => {
                if (!next) {
                    next = node;
                    node = null;
                }
                if (!node) {
                    knowledgeDatabase.load(id, (err, node) => {
                        next(err, node);
                    });
                }
                else {
                    next(null, node);
                }
            });
        });
        async.waterfall(tasks, callback);
    }
    _loadOne(id, callback) {
        if (this.cache) {
            this.cache.interceptLoad(id, callback, (missingId, cacheCallback) => {
                this._load(missingId, cacheCallback);
            });
        }
        else {
            this._load(id, callback);
        }
    }
    _loadArray(ids, callback) {
        const nodes = new Map();
        const remainingIDs = ids.slice(0);
        if (this.cache) {
            const fakeLoad = (id, callback) => setImmediate(() => callback(null, null));
            ids.forEach(id => {
                const addNode = (err, node) => {
                    if (node) {
                        nodes[id] = node;
                        remainingIDs.splice(remainingIDs.indexOf(id), 1);
                    }
                };
                this.cache.interceptLoad(id, addNode, fakeLoad);
            });
        }
        function getNodes(slice, callback) {
            slice.loadList(remainingIDs, callback);
        }
        async.map(this.pool, getNodes, (err, allSlicesResults) => {
            allSlicesResults.forEach(nodesForSlice => {
                nodesForSlice.forEach(node => {
                    if (node && !nodes[node._id]) {
                        nodes[node._id] = node;
                        if (this.cache) {
                            this.cache.add(node);
                        }
                    }
                });
            });
            callback(null, ids.map(id => nodes[id] || null));
        });
    }
    _getKnowledgeDatabase(kbName) {
        let knowledgeDatabase;
        for (let n = 0; n < this.pool.length; n++) {
            if (kbName === this.pool[n].kbName) {
                knowledgeDatabase = this.pool[n];
                break;
            }
        }
        return knowledgeDatabase;
    }
    _assertCache() {
        if (!this.cache) {
            throw new Error('fetch method called on a Model without a cache');
        }
    }
    _toArray(items) {
        if (!Array.isArray(items)) {
            return [items];
        }
        else {
            return items;
        }
    }
}
Model.modelClassRegistry = {};
__decorate([
    decorators_1.promisify
], Model.prototype, "load", null);
__decorate([
    decorators_1.promisify
], Model.prototype, "loadRoot", null);
__decorate([
    decorators_1.promisify
], Model.prototype, "loadLayers", null);
__decorate([
    decorators_1.promisify
], Model.prototype, "saveLayers", null);
__decorate([
    decorators_1.promisify_4
], Model.prototype, "visitLayers", null);
exports.default = Model;

},{"./Cache":2,"./DatabaseManager":4,"./WebClient":14,"./decorators":15,"./log":16,"async":undefined}],9:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash/lodash.min");
const uuid = require("uuid");
const async = require("async");
const decorators_1 = require("./decorators");
const Asset_1 = require("./Asset");
const log_1 = require("./log");
const log = log_1.default.createChild('Node');
class Node {
    constructor(nodeType, data, cloneFrom) {
        if (cloneFrom) {
            _.extend(this, cloneFrom);
        }
        this._id = this._id || uuid.v4();
        this.data = data || this.data || {};
        this.type = nodeType || this.type || 'node';
        let timestamp = Number(new Date());
        this.created = this.created || timestamp;
        this.updated = this.updated || timestamp;
    }
    static registerNodeClass(nodeType, classConstructor, kbName = '*') {
        let registry = Node.nodeClassRegistry;
        if (registry[kbName] && registry[kbName][nodeType]) {
            log.warn('registerNodeClass: overwriting previous class registered for type', nodeType);
        }
        if (!registry[kbName]) {
            registry[kbName] = {};
        }
        registry[kbName][nodeType] = classConstructor;
    }
    static findNodeClass(nodeType, kbName) {
        let NodeClass = Node;
        let registry = Node.nodeClassRegistry;
        if (registry[kbName] && registry[kbName][nodeType]) {
            NodeClass = registry[kbName][nodeType];
        }
        else if (registry['*'] && registry['*'][nodeType]) {
            NodeClass = registry['*'][nodeType];
        }
        return NodeClass;
    }
    save(callback) {
        this.getKb().save(this, callback);
    }
    remove(callback) {
        this.getKb().remove(this, callback);
    }
    addEdges(idsOrNodes, layer) {
        this.edges = this.edges || {};
        this._toArray(idsOrNodes).forEach((idOrNode) => {
            const { id, l } = this._resolveIdAndLayer(idOrNode, layer, 'Node#addEdges()');
            this.edges[l] = this.edges[l] || [];
            this.edges[l].push(id);
        });
    }
    removeEdges(idsOrNodes, layer) {
        if (this.edges) {
            this._toArray(idsOrNodes).forEach((idOrNode) => {
                let { id, l } = this._resolveIdAndLayer(idOrNode, layer, 'Node#removeEdges()');
                if (this.edges[l]) {
                    _.pull(this.edges[l], id);
                }
            });
        }
    }
    clearEdges(layers) {
        if (this.edges) {
            this._toArray(layers).forEach((layer) => {
                if (this.edges[layer]) {
                    this.edges[layer] = [];
                }
            });
        }
    }
    getEdges(layers) {
        let edges = [];
        this._toArray(layers).forEach((layer) => {
            let theseEdges = _.get(this, 'edges.' + layer, []);
            theseEdges.forEach((thisEdge) => {
                if (edges.indexOf(thisEdge) < 0) {
                    edges.push(thisEdge);
                }
            });
        });
        return edges;
    }
    getLayers() {
        if (this.edges) {
            return Object.keys(this.edges);
        }
        else {
            return [];
        }
    }
    createAsset(subtype, ext) {
        let asset = new Asset_1.default(null, subtype, ext);
        if (this.getKb) {
            let rootDir = this.getKb().getDirectory();
            asset.setRootDir(rootDir);
        }
        else {
            log.warn('createAsset: creating an asset from a node without a kb, rootDir not set');
        }
        this.addAssets(asset);
        return asset;
    }
    addAssets(assets, subtype) {
        this.assets = this.assets || {};
        this._toArray(assets).forEach((asset) => {
            let st = subtype || asset.subtype;
            this.assets[st] = this.assets[st] || [];
            this.assets[st].push(asset.filename());
        });
    }
    getAssets(subtype = 'asset') {
        let assets = [];
        if (this.assets && this.assets[subtype]) {
            let assetFilenames = this.assets[subtype];
            let rootDir = this.getKb().getDirectory();
            assetFilenames.forEach((filename) => {
                let asset = new Asset_1.default(filename);
                asset.setRootDir(rootDir);
                assets.push(asset);
            });
        }
        return assets;
    }
    getAllAssets() {
        let assets = [];
        let subtypes = this.getAssetSubtypes();
        subtypes.forEach((subtype) => {
            assets = assets.concat(this.getAssets(subtype));
        });
        return assets;
    }
    getAssetSubtypes() {
        let subtypes = _.keys(this.assets);
        return subtypes;
    }
    removeAsset(asset, callback) {
        let st = asset.subtype;
        let assetIndex = this.assets[st].indexOf(asset.filename());
        this.assets[st].splice(assetIndex, 1);
        asset.remove(callback);
    }
    removeAllAssets(callback) {
        let subtypes = this.getAssetSubtypes();
        let tasks = [];
        subtypes.forEach((subtype) => {
            let assets = this.getAssets(subtype);
            assets.forEach((asset) => {
                tasks.push((next) => {
                    this.removeAsset(asset, next);
                });
            });
        });
        async.series(tasks, callback);
    }
    setKb(knowledgeDatabase) {
        this.getKb = () => { return knowledgeDatabase; };
        return this;
    }
    setUpdated(timestamp) {
        this.updated = timestamp || Number(new Date());
    }
    _resolveIdAndLayer(idOrNode, layer, methodName) {
        let id;
        let l;
        if (typeof idOrNode === 'string') {
            id = idOrNode;
            if (!layer) {
                throw Error(`${methodName}: must specify layer when supplying ids`);
            }
            l = layer;
        }
        else {
            let node = idOrNode;
            id = node._id;
            l = layer || node.type;
        }
        return { id, l };
    }
    _toArray(items) {
        if (!Array.isArray(items)) {
            return [items];
        }
        else {
            return items;
        }
    }
}
Node.nodeClassRegistry = {};
__decorate([
    decorators_1.promisify
], Node.prototype, "save", null);
__decorate([
    decorators_1.promisify
], Node.prototype, "remove", null);
__decorate([
    decorators_1.promisify
], Node.prototype, "removeAsset", null);
__decorate([
    decorators_1.promisify
], Node.prototype, "removeAllAssets", null);
exports.default = Node;

},{"./Asset":1,"./decorators":15,"./log":16,"async":undefined,"lodash/lodash.min":undefined,"uuid":undefined}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_1 = require("./Model");
const RobotModelEvents_1 = require("./RobotModelEvents");
const jibo_client_framework_1 = require("jibo-client-framework");
class RobotModel extends Model_1.default {
    constructor(kbNames, httpUrl = null) {
        super(kbNames, httpUrl);
        this.events = new RobotModelEvents_1.default();
        this._listenForWSMessages();
    }
    _listenForWSMessages() {
        this._wsClient = new jibo_client_framework_1.WSClient(this.httpUrl);
        this._wsClient.on('message', this._wsMessageReceived.bind(this));
    }
    _wsMessageReceived(message) {
        switch (message) {
            case 'RobotUpdated':
                console.log('RobotModel: received RobotUpdated event; emitting RobotModelEvents.robotUpdate');
                this.events.robotUpdated.emit();
                break;
            default:
                console.warn('RobotModel: received unknown message from KBService', message);
        }
    }
}
exports.default = RobotModel;

},{"./Model":8,"./RobotModelEvents":11,"jibo-client-framework":undefined}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_typed_events_1 = require("jibo-typed-events");
class RobotModelEvents extends jibo_typed_events_1.EventContainer {
    constructor() {
        super(...arguments);
        this.robotUpdated = new jibo_typed_events_1.Event('Robot properties have updated');
    }
}
exports.default = RobotModelEvents;

},{"jibo-typed-events":undefined}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
class RobotRootNode extends Node_1.default {
    get locationOverride() {
        return this.data.locationOverride;
    }
}
exports.default = RobotRootNode;

},{"./Node":9}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("./Node");
class UserNode extends Node_1.default {
    get id() {
        return this._id;
    }
    get firstName() {
        return this.data.firstName;
    }
    get lastName() {
        return this.data.lastName;
    }
    get nickName() {
        return this.data.nickName;
    }
    get gender() {
        return this.data.gender;
    }
    get isJibo() {
        return !this.data.firstName;
    }
    getWrittenName() {
        return this.data.nickName || this.data.firstName || 'Jibo';
    }
    toString() {
        if (this.data.phoneticName) {
            return this.data.phoneticName.replace(/\s+(?=[^>]*\<)/g, '');
        }
        return this.getWrittenName();
    }
    getInitials() {
        if (this.isJibo) {
            return 'J';
        }
        if (!this.data.firstName || !this.data.lastName) {
            return '';
        }
        return this.data.firstName.charAt(0).toUpperCase() +
            this.data.lastName.charAt(0).toUpperCase();
    }
    toLog() {
        return `[UserNode id:${this._id}]`;
    }
}
exports.default = UserNode;

},{"./Node":9}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const axios_1 = require("axios");
const querystring = require("querystring");
const KnowledgeDatabase_1 = require("./KnowledgeDatabase");
const log_1 = require("./log");
const log = log_1.default.createChild('WebClient');
class WebClient extends KnowledgeDatabase_1.default {
    static _processError(err) {
        if (err.response) {
            let description = `HTTP Error Code ${err.response.status}`;
            if (err.response.data) {
                description += err.response.data;
            }
            return new Error(description);
        }
        else {
            return new Error(err.request
                ? 'No response received'
                : 'Unknown error');
        }
    }
    constructor(kbName, httpUrl) {
        super(kbName);
        this.httpUrl = httpUrl.replace(/\/$/, '');
    }
    init(callback) {
        setImmediate(callback);
    }
    load(id, callback) {
        let url = this._makeUrl(`/node/load/${id}`);
        axios_1.default.get(url).then(res => {
            const node = res.data
                ? this.createNodeFromObject(res.data)
                : null;
            callback(null, node);
        }, (err) => {
            log.error('axios.get', url, err);
            callback(WebClient._processError(err));
        });
    }
    loadList(ids, callback) {
        let url = this._makeUrl(`/node/load`);
        axios_1.default.post(url, ids).then(res => {
            const nodes = res.data
                ? res.data.map(node => node ? this.createNodeFromObject(node) : null)
                : null;
            callback(null, nodes);
        }, (err) => {
            if (err.response && err.response.status === 400) {
                log.warn('Deprecation warning: jibo-kb will soon drop support for legacy SSM without /node/load POST endpoint.');
                async.map(ids, this.load.bind(this), callback);
            }
            else {
                log.error('axios.post', url, err);
                callback(WebClient._processError(err));
            }
        });
    }
    loadRoot(callback) {
        let url = this._makeUrl(`/node/loadRoot`);
        axios_1.default.get(url).then(res => {
            const node = res.data
                ? this.createNodeFromObject(res.data)
                : null;
            callback(null, node);
        }, (err) => {
            log.error('axios.get', url, err);
            callback(WebClient._processError(err));
        });
    }
    save(node, callback) {
        let url = this._makeUrl(`/node/save`);
        axios_1.default.post(url, node).then(res => {
            if (callback) {
                callback(null);
            }
        }, (err) => {
            log.error('axios.post', url, err);
            if (callback) {
                callback(WebClient._processError(err));
            }
        });
    }
    remove(idOrNode, callback) {
        let id = this.toId(idOrNode);
        let url = this._makeUrl(`/node/remove/${id}`);
        axios_1.default.delete(url).then(res => {
            callback(null);
        }, (err) => {
            log.error('axios.delete', url, err);
            callback(WebClient._processError(err));
        });
    }
    getDirectory() {
        return this._makeUrl();
    }
    _makeUrl(addPath = '') {
        let escapedName = querystring.escape(this.kbName);
        return `${this.httpUrl}/v1/kb/${escapedName}` + addPath;
    }
}
exports.default = WebClient;

},{"./KnowledgeDatabase":6,"./log":16,"async":undefined,"axios":undefined,"querystring":undefined}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    descriptor.value = function () {
        let result;
        let args = Array.from(arguments);
        let lastArg = args.slice(-1)[0];
        if (typeof lastArg === 'function') {
            result = originalMethod.apply(this, args);
        }
        else {
            result = new Promise((resolve, reject) => {
                let callback = function (err, arg) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(arg);
                    }
                };
                let newArgs = args.concat(callback);
                originalMethod.apply(this, newArgs);
            });
        }
        return result;
    };
    return descriptor;
}
exports.promisify = promisify;
function promisify_4(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    descriptor.value = function () {
        let result;
        let args = Array.from(arguments);
        let fourthArg = args[4];
        if (typeof fourthArg === 'function') {
            result = originalMethod.apply(this, args);
        }
        else {
            let originalThis = this;
            result = new Promise((resolve, reject) => {
                let callback = function (err, arg) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(arg);
                    }
                };
                let newArgs = args.concat(callback);
                originalMethod.apply(originalThis, newArgs);
            });
        }
        return result;
    };
    return descriptor;
}
exports.promisify_4 = promisify_4;
function deprecate(msg) {
    msg = msg === undefined ? '' : msg;
    function warn() {
        let stack = new Error().stack;
        stack = stack.split('\n').splice(4).join('\n');
        if (console.groupCollapsed) {
            console.groupCollapsed("%cDeprecation Warning: %c%s", "color:#614108;background:#fffbe6", "font-weight:normal;color:#614108;background:#fffbe6", msg);
            console.warn(stack);
            console.groupEnd();
        }
        else {
            console.warn("Deprecation Warning:", msg);
            console.warn(stack);
        }
    }
    function doDeprecate(target, propertyKey, descriptor) {
        let originalMethod = descriptor.value;
        descriptor.value = function () {
            warn();
            return originalMethod.apply(this, arguments);
        };
        return descriptor;
    }
    return doDeprecate;
}
exports.deprecate = deprecate;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jibo_log_1 = require("jibo-log");
exports.default = new jibo_log_1.Log('Jibo.KB');

},{"jibo-log":undefined}],17:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./KnowledgeBase"));
var Asset_1 = require("./Asset");
exports.Asset = Asset_1.default;
var Cache_1 = require("./Cache");
exports.Cache = Cache_1.default;
var Database_1 = require("./Database");
exports.Database = Database_1.default;
var DatabaseManager_1 = require("./DatabaseManager");
exports.DatabaseManager = DatabaseManager_1.default;
var KnowledgeBase_1 = require("./KnowledgeBase");
exports.KnowledgeBase = KnowledgeBase_1.default;
var KnowledgeDatabase_1 = require("./KnowledgeDatabase");
exports.KnowledgeDatabase = KnowledgeDatabase_1.default;
var LoopModel_1 = require("./LoopModel");
exports.LoopModel = LoopModel_1.default;
var RobotModel_1 = require("./RobotModel");
exports.RobotModel = RobotModel_1.default;
var Model_1 = require("./Model");
exports.Model = Model_1.default;
var Node_1 = require("./Node");
exports.Node = Node_1.default;
var UserNode_1 = require("./UserNode");
exports.UserNode = UserNode_1.default;
var RobotRootNode_1 = require("./RobotRootNode");
exports.RobotRootNode = RobotRootNode_1.default;
var WebClient_1 = require("./WebClient");
exports.WebClient = WebClient_1.default;

},{"./Asset":1,"./Cache":2,"./Database":3,"./DatabaseManager":4,"./KnowledgeBase":5,"./KnowledgeDatabase":6,"./LoopModel":7,"./Model":8,"./Node":9,"./RobotModel":10,"./RobotRootNode":12,"./UserNode":13,"./WebClient":14}]},{},[17])(17)
});

//# sourceMappingURL=jibo-kb.js.map
