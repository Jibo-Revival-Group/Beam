var configurazione = require('../lib/configurazione');

function Icecream(userOptions)
{

	var defaultOptions = {
		name: 'Super delicious icecream',
		flavours: ['vanilla', 'strawberry', 'chocolate'],
		price: 10,
		discount: false
	};

	// add the default options to the configurazione library
	configurazione.defaults(defaultOptions);

	// add the user options to the configurazione library
	configurazione.options(userOptions);

	var name = configurazione.get('name');
	console.log(name); // prints 'Super delicious icecream'

	var discount = configurazione.get('discount');
	console.log(discount); // prints 'true', since user options take precedence over default options

	var price = configurazione.get('price');
	console.log(price); // prints '10'

	// apply the discount
	if(configurazione.get('discount'))
	{
		configurazione.set('price', 8);
	}

	var price = configurazione.get('price');
	console.log(price); // prints '8'
}

new Icecream({discount: true});