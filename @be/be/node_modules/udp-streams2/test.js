'use strict';

var dgram = require('dgram'),
    UdpStream = require('./index');

var BIND_PORT = 1234;

require('should');

describe('UdpStream', function () {
    var server, server6,
        _onMessage = function () { };
    
    var onMessage = function (cb) { _onMessage = cb; }
    
    before(function (_done) {

        var count = 2;
        function done() {
            count--;
            if (!count) _done();
        };
        server = dgram.createSocket('udp4', function () {
            _onMessage.apply(null, arguments);
        });
        server.bind({
            address: '127.0.0.1',
            port: BIND_PORT
        }, done);
        
        server6 = dgram.createSocket('udp6', function () {
            _onMessage.apply(null, arguments);
        });
        server6.bind({
            address: '::1',
            port: BIND_PORT
        }, done);
    });
    
    after(function () {
        server.close();
        server6.close();
    });
    afterEach(function () {
        onMessage(function () { });
    });
    
    it('should pass messages', function (done) {
        var client = new UdpStream();
        client.connect({
            host: '127.0.0.1',
            port: BIND_PORT
        }, function (e) {
            if (e) { done(e); return; }

            onMessage(done.bind(null, null));
            
            client.write('hello');
        });
    });
    
    it('should support connect(port, host) syntax', function (done) {
        var client = new UdpStream();
        client.connect(BIND_PORT, '127.0.0.1', function (e) {
            if (e) { done(e); return; }

            onMessage(done.bind(null, null));
            
            client.write('hello');
        });
    });
    
    it('should support connect(port) syntax', function (done) {
        var client = new UdpStream();
        client.connect(BIND_PORT, function (e) {
            if (e) { done(e); return; }

            onMessage(done.bind(null, null));
            
            client.write('hello');
        });
    });
    
    it('should support dns resolution', function (done) {
        var client = new UdpStream();
        client.connect({
            host: 'localhost',
            port: BIND_PORT
        }, function (e) {
            if (e) { done(e); return; }

            onMessage(done.bind(null, null));
            
            client.write('hello');
        });
    });
    
    it('should support IPv6', function (done) {
        var client = new UdpStream();
        client.connect({
            host: '::1',
            port: BIND_PORT
        }, function (e) {
            if (e) { done(e); return; }

            onMessage(done.bind(null, null));
            
            client.write('hello');
        });
    });

    it('should end gracefully', function (done) {
        var client = new UdpStream();
        client.connect({
            host: 'localhost',
            port: BIND_PORT
        }, function (e) {
            if (e) { done(e); return; }
         
            client.end(done);
        });
    });
    
    it('should emit a \'connect\' event on the next tick', function (done) {
        var client = new UdpStream();
        client.connect({ host: '127.0.0.1', port: BIND_PORT });
        client.on('connect', done.bind(null, null));
    });
    it('should emit a \'close\' event', function (done) {
        var client = new UdpStream();
        client.connect({
            host: 'localhost',
            port: BIND_PORT
        }, function (e) {
            if (e) { done(e); return; }
            client.end();
        });
        client.on('close', done.bind(null, null));
    });
    
    it('should error on write after end', function () {
        var client = new UdpStream();
        client.connect({
            host: 'localhost',
            port: BIND_PORT
        }, function (e) {
            if (e) { done(e); return; }
         
            client.end();
            (function () {
                client.write('foo');
            }).should.throw(/write after end/);
        });
    });
    
    it('should pass along socket errors and end', function (done) {
        var client = new UdpStream();
        client.connect({
            host: 'localhost',
            port: BIND_PORT
        }, function (e, client) {
            if (e) { done(e); return; }
         
            var received = null;
            client.on('error', function (err) { received = err; });
            
            client.on('finish', function () {
                received.should.equal('fake');
                done();
            });

            client.socket.emit('error', 'fake');
        });
    });
    
    it('should fail if no port is provided', function (done) {
        var client = new UdpStream();
        client.connect(function (err, res) {
            err.message.should.match(/opts\.port is required/);
            done();
        });
    });
    
    it('should not throw synchronously with invalid parameters', function (done) {
        this.timeout(40000);
        var count = 0;
        function swallow() {
            count++;
            if (count === 8) { done(); }
        }

        UdpStream.create().on('error', swallow);
        UdpStream.create('foo').on('error', swallow);
        UdpStream.create('foo', 'foo').on('error', swallow);
        UdpStream.create('foo', 'foo', 'foo').on('error', swallow);
        UdpStream.create(null).on('error', swallow);
        UdpStream.create(null, null).on('error', swallow);
        UdpStream.create(null, null, null).on('error', swallow);
        UdpStream.create({
            host: null,
            port: null
        }).on('error', swallow);
    });
    
    it('should wait until stream is ended to destroy socket (fixes syslog2 #3, #4)', function (done) {
        var PassThrough = require('stream').PassThrough;
        var client = new UdpStream(),
            pt = new PassThrough();
        
        client.connect({
            host: '127.0.0.1',
            port: BIND_PORT
        }, function (e) {
            if (e) { done(e); return; }

            pt.pipe(client);
            
            pt.write('one', function () {
                pt.write('two', function () {
                    pt.end(done.bind(null, null));
                });
            });
        });
    });
});
