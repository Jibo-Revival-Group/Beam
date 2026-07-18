var SuperSimpleStorage = require('../lib/supersimplestorage');

var storage = new SuperSimpleStorage();

var data = {
	'foo': 'bar',
	'bar': 'foo'
}

// store JSON content
storage.save('foo', data, function() {

	// read data from foo
	storage.open('foo', function(content) {

		// modify content
		content['foobar'] = 'foobar';
		storage.save('foo.bar', content, function(result) {
			console.log('saved!');
			console.log(result);
		})

	}, function(error) {
		console.log(error);
	});

});