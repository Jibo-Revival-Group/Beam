/**
 * SuperSimpleStorage
 * A simple persistance layer library to store and retrieve data in Node.js without using a full blown database.
 * version 0.0.2
 * Copyright 2014 - Michiel van der Geest
 */

var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('configurazione');

module.exports = SuperSimpleStorage;

/**
 * Constructor
 */
function SuperSimpleStorage(options) {

	if (!(this instanceof SuperSimpleStorage)) {
		return new SuperSimpleStorage(options);
	}

	var defaults = {
		storageFolder: 'storage',
		dotsToFolders: true,
		fileExtension: 'data'
	};

	// set default and options
	config.defaults(defaults);
	config.options(options);

	// create storage folder
	mkdirp(config.get('storageFolder') , function(err) {
		if(err) console.log(err);
	});

}

/**
 * Reads the content of a storage item and passes the content to a success callback
 * @param  {string} file      Storage item filename. Uses dot-notation for path.
 * @param  {[type]} onSuccess Success callback
 * @param  {[type]} onError   Error callback
 */
SuperSimpleStorage.prototype.open = function (file, onSuccess, onError) {

	// replace dots with slashes
	if(config.get('dotsToFolders'))
	{
		file = file.toString().replace('.', '/');
	}

	var fullPath = config.get('storageFolder') + '/' + file + '.' + config.get('fileExtension');

	// check if the file path exists
	fs.exists(fullPath, function(exists) {

		if(exists)
		{
			fs.readFile(fullPath, 'utf-8', function(error, content) {

				if(error)
				{
					if(typeof onError == 'function')
					{
						onError(error);
					}
				}
				else
				{
					content = parseJsonContent(content);
					if(typeof onSuccess == 'function')
					{
						onSuccess(content);
					}
				}
			});
		}
		else {
			if(typeof onError == 'function')
			{
				onError('Storage item not found.');
			}
		}
	});

};

/**
 * Saves content to a storage item. Create a new file if it doesn't exist yet. Overwrites an existing file if it already exists.
 * @param  {file} file 			Storage item filename. Uses dot-notation for path.
 * @param  {mixed} content 		Content to store. In case it's an object, will be transformed to JSON.
 * @param  {[type]} onSuccess	Success callback
 * @param  {[type]} onError		Error callback
 */
SuperSimpleStorage.prototype.save = function (file, content, onSuccess, onError) {

	// replace dots with slashes
	if(config.get('dotsToFolders'))
	{
		file = file.toString().replace('.', '/');
	}

	var fullPath = config.get('storageFolder') + '/' + file + '.' + config.get('fileExtension');

	if(typeof content == 'object')
	{
		content = JSON.stringify(content);
	}

	// first make sure the path exists
	var parts = fullPath.split('/');
	delete parts[parts.length - 1];
	path = parts.join('/');

	mkdirp(path, function(err) {
		if(err) console.log(err);
		else
		{

			fs.writeFile(fullPath, content, function(error) {
				if(error)
				{
					if(typeof onError == 'function')
					{
						onError(error);
					}
				}
				else
				{
					if(typeof onSuccess == 'function')
					{
						onSuccess(content)
					}
				}
			});

		}
	});

};


/**
 * Checks if content is valid JSON format. Returns parsed JSON when it is, and the plain content when it isn't.
 * @param  {string} content 	Content
 * @return {string|object}		Returns an object when valid JSON. Returns a string when not.
 */
function parseJsonContent(content) {

    try {
        var output = JSON.parse(content);
		if (output && typeof output === "object" && output !== null) {
			return output;
		}
	}
	catch (e) {}

	return content;

}