/**
 * Configurazione
 * A simple configuration manager in Node.js
 * version 0.0.1
 * Copyright 2014 - Michiel van der Geest
 */


/**
 * Constructor
 */
function Configurazione() {

	if (!(this instanceof Configurazione)) {
		return new Configurazione();
	}

	this.mergedOptions = this.defaultOptions = {};

}

/**
 * Sets the default options.
 * @param  {object} defaultOptions - object with the default options.
 * @return void
 */
Configurazione.prototype.defaults = function (defaultOptions) {

	this.mergedOptions = this.defaultOptions = defaultOptions;

}

/**
 * Merges user defined options with the defaults. User defined takes precedence over defaults.
 * @param  {object} userOptions - object with the user defined options.
 * @return void
 */
Configurazione.prototype.options = function (userOptions) {

	this.userOptions = userOptions;
	this.mergedOptions = merge(this.defaultOptions, this.userOptions);

};

/**
 * Sets a specific key / value configuration option.
 * @param {string} property - name of the property.
 * @param {mixed} value - value of the property.
 */
Configurazione.prototype.set = function (property, value) {

	this.mergedOptions[property] = value;

};

/**
 * Gets a specific key from the configuration options (user merged with defaults).
 * @param  {string} property - name of the property.
 * @return {mixed} - value of the property.
 */
Configurazione.prototype.get = function ( property ) {

	return this.mergedOptions[property] ? this.mergedOptions[property] : false;

};

/**
 * Exposes an instance of Configurazione to the outside world
 */
module.exports = Configurazione();

/**
 * Private function - Merges 2 objects
 * @param  {object} defaults - default object
 * @param  {object} options - user defined options
 * @return {object} - merged object
 */
function merge( defaults, options ) {

	var merged = {};

	// loop through default options and put each of them in the 'merged' object.
	for (property in defaults)
	{
		if (Object.prototype.hasOwnProperty.call(defaults, property))
		{
			merged[property] = defaults[property];
		}
	}

	// loop through user defined options and put each of them them in the 'merged' object (overwriting the defaults).
	for (property in options)
	{
		if (Object.prototype.hasOwnProperty.call(options, property))
		{
			merged[property] = options[property];
		}
	}

	// return the merged object.
	return merged;

};