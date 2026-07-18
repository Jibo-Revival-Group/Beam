#Configurazione
##A simple configuration manager in Node.js

###Introduction
Configurazione is a very simple tool to make the management of configuration options for modules and classes easier.

In this first version, it's (limited) capabilities include:

- setting default options
- setting user defined options (which take precedence)
- set configuration options at runtime
- retrieve configration values

###Instalation

Install Configurazione through NPM

```
npm install configurazione --save
```

This will install Configurazione as a dependency and update your package.json automatically.

Next require Configurazione in your Node.js script, like this:

```
var configurazione = require('configurazione');
```

###Usage

Configurazione has a clean and simple API, currently consisting of 4 methods:

####Setting default options

Imagine that we have an Icecream class, and in the constructor of our class, we define some following default options. We can easily add them to the Configurazione manager by calling ```configurazione.defaults()```
```
var defaultOptions = {
	name: 'Super delicious icecream',
	flavours: ['vanilla', 'strawberry', 'chocolate'],
	price: 10,
	discount: false
};

// add the default options to the Configurazione manager
configurazione.defaults(defaultOptions);
```

####Setting user options

Next imagine that we instantiate a new Icecream, passing our own custom options. Let's say we want to enable a discount.

```
new Icecream({discount: true});
```
In the constructor of our Icecream class we now add the user options to the Configurazione manager by calling ```config.options()```

```
var defaultOptions = {
	name: 'Super delicious icecream',
	flavours: ['vanilla', 'strawberry', 'chocolate'],
	price: 10,
	discount: false
};

// add the default options to the Configurazione library
configurazione.defaults(defaultOptions);

// add the user options to the Configurazione library
configurazione.options(userOptions);
```

####Getting configuration options

Next, inside our Icecream class, when we want to use a configuration option, we simply ask Configurazione to retrieve the correct value for a specific option. Configurazione will figure out if it should return the default value, or the user submitted value. User submitted options haven precedence over the default values.

```
var name = configurazione.get('name');
console.log(name); // prints 'Super delicious icecream'

var discount = configurazione.get('discount');
console.log(discount); // prints 'true', since user options take precedence over default options
```

####Setting configuration options

Sometimes, we want to store a specific configuration value at runtime. It's possible to add a new option or overwrite the value of an existign one.

```
var price = configurazione.get('price');
console.log(price); // prints '10'

// apply the discount
if(configurazione.get('discount'))
{
	configurazione.set('price', 8);
}

var price = configurazione.get('price');
console.log(price); // prints '8'
```