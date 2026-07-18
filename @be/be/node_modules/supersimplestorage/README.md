#SuperSimpleStorage
##A simple persistance layer library to store and retrieve data in Node.js without using a full blown database.

###Introduction
Often in a Node.js application there is a need to store some pieces data. Nothing big to justify a full blown database.
For those cases SuperSimpleStorage is handy tool that allows you to easily store and retrieve data from the filesystem.

SuperSimpleStorage is able to store:

- strings
- integers
- javascript data objects (that are automatically converted to and from JSON)

###Instalation

Install SuperSimpleStorage through NPM

```
npm install supersimplestorage --save
```

This will install SuperSimpleStorage as a dependency and update your package.json automatically.

Next require SuperSimpleStorage in your Node.js script, like this:

```
var supersimplestorage = require('supersimplestorage');
```

###Usage

####Initializing the storage

Before we can store and retrieve storage items, we first need to initialize the storage. We do this by creating a new storage object. When creating a new object we can pass configuration options. When no configuration options are passed (or only partially), default values are used.

```
var storage = new SuperSimpleStorage({
		storageFolder: 'my_storage_folder',
		dotsToFolders: true,
		fileExtension: 'txt'
});
```

The following configuration options are available:

- **storageFolder** - Folder where the storage items are stored. Defaults to '*storage*'
- **dotsToFolders** - Whether to translate a dots to slahes in order to store items in a file structure. Defaults to '*true*'
- **fileExtension** - The file extension used for the storage files. Defaults to '*data*'.

####Retrieving data from a storage item

Retrieving data from a storage item is done by calling the ```open``` method. The open-method accepts 3 parameters:

- **name** - The name of the storage item. When dotsToFolder is set to true, dots will translate to a file tree.
- **successCallback** - Function to call when the storage item has successfully been retrieved
- **errorCallback** - Function to call when an error has occurred while retrieving the item

It is important to realize that retrieving data from storage is *asynchronous*. That means that we can't assign the result of the open method directly to a variable. Instead we pass a success callback, which will receive the data as soon as it becomes available, where it can be processed further.

```
storage.open('foo', function(content) {

	console.log('Successfully opened foo');
	console.log(content);

}, function(error) {

	console.log('An error has occured');
	console.log(error);

});
```

####Saving data in a storage item

Storing data into a storage item is done by calling the ```save``` method. The save method accepts 4 parameters:

- **name** - The name of the storage item. When dotsToFolder is set to true, dots will translate to a file tree.
- **content** - The content to save in the storage item
- **successCallback** - Function to call when the storage item has successfully been saved
- **errorCallback** - Function to call when an error has occurred while storing the item

```
var data = {
	'foo': 'bar',
	'bar': 'foo'
}

// store JSON content
storage.save('foo.bar', data, function(content) {

	console.log('The content has been saved')

}, function(error) {

	console.log('An error has occured');
	console.log(error);

});
```

It is important to realize that saving data in storage also is *asynchronous*. If we want to act upon successfully saving data, we have to pass a callback, which will be executed as soon as the item has been stored.