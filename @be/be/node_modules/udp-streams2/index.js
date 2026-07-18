'use strict';

var Writable = require('stream').Writable,
    inherits = require('util').inherits,
    net = require('net'),
    dns = require('dns'),
    dgram = require('dgram');

function UdpStream() {
    Writable.call(this);

    this.socket = null;
    this.host = null;
    this.port = null;
}
inherits(UdpStream, Writable);

UdpStream.create = function (opts, cb) {
    var stream = new UdpStream();
    process.nextTick(function () {
        stream.connect(opts, cb);
    });
    return stream;
};
UdpStream.parseArgs = function () {
    if (arguments.length === 0) { return { }; }
    
    var i = arguments.length, args = new Array(i);
    while (i--) { args[i] = arguments[i]; }
    
    var opts = { }, cb;
    if (typeof args[args.length-1] === 'function') {
        opts.cb = args.pop();
    }
    
    if (typeof args[0] === 'number') {
        opts.port = args.shift();
    }
    
    if (typeof args[0] === 'string') {
        opts.host = args.shift();
    }
    if (args[0] && typeof args[0] === 'object') {
        Object.keys(args[0]).forEach(function (key) {
            opts[key] = args[0][key];
        });
    }
    
    if (isNaN(parseInt(opts.port, 10))) {
        opts.port = null;//delete opts.port;
    }
    
    return opts;
};
UdpStream.prototype.connect = function (/*opts, cb*/) {
    var self = this, cb;
    
    var opts = UdpStream.parseArgs.apply(this, arguments);
    if (opts.cb) { cb = opts.cb; delete opts.cb; }

    var _onError = function (err) {
        if (typeof cb === 'function') { cb(err); }
        else { self.emit('error', err); }
    };
    var _onConnect = function () {
        if (typeof cb === 'function') { cb(null, self); }
        process.nextTick(function () {
            self.emit('connect', self);
        });
    };
    
    if (!opts.host) { opts.host = '127.0.0.1'; }
    
    if (!opts.port) { return _onError(new Error('opts.port is required')); }
    
    var connect = function () {
        if (net.isIPv4(opts.host)) {
            opts.type = 'udp4';
        } else if (net.isIPv6(opts.host)) {
            opts.type = 'udp6';
        } else {
            return _onError(new Error('Invalid host: ' + opts.host));
        }
        
        
        try { self.socket = dgram.createSocket(opts.type); }
        catch (e) { return _onError(e); }
        
        self.host = opts.host;
        self.port = opts.port;
        
        // udp sockets can only be 'closed' manually, but we call
        // socket.close() in the 'end' method
        var onError, onClose, cleanup;

        onError = function (e) {
            cleanup();
            self.emit('error', e);
            self.end();
        };
        onClose = function () {
            cleanup();
        };
        cleanup = function () {
            self.socket.removeListener('error', onError);
            self.socket.removeListener('close', onClose);
            
            self.emit('close');
        };
        
        self.socket.once('error', onError);
        self.socket.once('close', onClose);
        
        _onConnect();
    };
    
    if (net.isIP(opts.host)) {
        connect();
    } else {
        dns.lookup(opts.host, function (err, res) {
            if (err) { return _onError(err); }
            opts.host = res;
            connect();
        });
    }
};

UdpStream.prototype.end = function (/*chunk, encoding, callback*/) {
    var i = arguments.length, args = new Array(i);
    while (i--) { args[i] = arguments[i]; }
    
    var chunk, encoding = 'utf8', callback, parentCallback;
    
    if (typeof args[args.length-1] === 'function') {
        parentCallback = args.pop();
    }
    
    if (typeof args[0] === 'string' || Buffer.isBuffer(args[0])) {
        chunk = args.shift();
        if (typeof chunk === 'string' && args.length && typeof args[0] === 'string') {
            encoding = args.shift();
        }
    }
    
    callback = function () {
        this.socket.close();
        if (parentCallback) { parentCallback.apply(null, arguments); }
    }.bind(this);
    
    if (chunk) {
        UdpStream.super_.prototype.end.call(this, chunk, encoding, callback);
    } else {
        UdpStream.super_.prototype.end.call(this, callback);
    }
};


UdpStream.prototype._write = function (chunk, encoding, callback) {
    this.socket.send(chunk, 0, chunk.length, this.port, this.host, callback);
};

module.exports = UdpStream;
