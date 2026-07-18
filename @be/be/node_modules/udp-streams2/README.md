# Udp-Streams2
This is a small wrapper around Node core's UDP (datagram) functionality providing a writable stream interface. There is currently no support for duplex/binding. It is written mostly to provide a *consistent* api for modules that support multiple transports.

# Usage
    var UdpStream = require('udp-streams2');
	var client = new UdpStream();
    client.connect({
		host: '127.0.0.1',
		port: 1234
	}, function () {
		client.write('hello');
	});

Or:
    var UdpStream = require('udp-streams2');
    UdpStream.create({
        host: '127.0.0.1,
        port: 1234
    }, function (err, client) {
        client.write('hello');
    });

While UDP socket creation is essentially synchronous, this module does perform DNS lookup in order to determine whether to create an IPv4 or an IPv6 instance (based on the resolved value). It also stores the resolved IP and sends directly to that, rather than performing a lookup every time. For these reasons, the API itself is asynchronous.

# Tests

Clone, `npm install`, `npm test`.