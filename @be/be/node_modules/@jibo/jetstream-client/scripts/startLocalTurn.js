const main = require('..');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));


const DEFAULT_PORT = '4444';
const DEFAULT_HOST = 'localhost';
const DEFAULT_OPTIONS = '{"nluRules": ["launch"], "fakeASR": "some text"}';

function printHelp() {
    console.log(`Usage: ${path.basename(process.argv[1])} [options]`);
    console.log(`  Options:`);
    console.log(`  --port, -p: [default: ${DEFAULT_PORT}] Port of service`);
    console.log(`  --host, -s: [default: ${DEFAULT_HOST}] Host name of service`);
    console.log(`  --options, -o: [default '${DEFAULT_OPTIONS}'] Local turn options`);
}

const help = argv['h'] || argv['help'];
const port = parseInt(argv['port'] || argv['p'] || DEFAULT_PORT);
const host = argv['host'] || argv['s'] || DEFAULT_HOST;
const options = JSON.parse(argv['options'] || argv['o'] || DEFAULT_OPTIONS);

if (help) {
    printHelp();
    process.exit();
}

console.log(`Using host '${host}' and port '${port}' and options '${JSON.stringify(options)}'`);

// Print all errors
main.api.events.error.on(e => console.error(e.message));

main.api.init({
    hostname: host,
    port: port
})
    .then(() => main.api.startLocalTurn(options))
    .then((request) => {
        // Print all events
        request.events.on(console.log);
        // Wait for final response
        return request.promise;
    }).then((data) => {
        console.log(`Response:`);
        console.log(data);
    }).catch(e => console.error(e.message))
    .then(() => main.api.close());
