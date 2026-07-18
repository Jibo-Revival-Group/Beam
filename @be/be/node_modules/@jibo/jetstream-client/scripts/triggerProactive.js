const main = require('..');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));


const DEFAULT_PORT = '4444';
const DEFAULT_HOST = 'localhost';
const DEFAULT_DATA = '{}';

/**
 * Run example:
 * node scripts/triggerProactive.js 
 *      --port 8090 
 *      --host seafoam-node-syrup-angora.local 
 *      --data "{ \"timestamp\": \"1000\",  \"triggerSource\": \"VISIBLE_FACE\" }"
 */
function printHelp() {
    console.log(`Usage: ${path.basename(process.argv[1])} [options]`);
    console.log(`  Options:`);
    console.log(`  --port, -p: [default: ${DEFAULT_PORT}] Port of service`);
    console.log(`  --host, -s: [default: ${DEFAULT_HOST}] Host name of service`);
    console.log(`  --data, -d: [default '${DEFAULT_DATA}'] Local turn options`);
}

const help = argv['h'] || argv['help'];
const port = parseInt(argv['port'] || argv['p'] || DEFAULT_PORT);
const host = argv['host'] || argv['s'] || DEFAULT_HOST;
const data = JSON.parse(argv['data'] || argv['d'] || DEFAULT_DATA);

if (help) {
    printHelp();
    process.exit();
}

console.log(`Using host '${host}' and port '${port}' and data '${JSON.stringify(data)}'`);

// Print all errors
main.api.events.error.on(e => console.error(e.message));

main.api.init({
    hostname: host,
    port: port
})
    .then(() => main.api.triggerProactive(data))
    .then((request) => {
        // Print all events
        request.events.on(event => console.log(`Event: `, JSON.stringify(event, null, 4)));
        // Wait for final response
        return request.promise;
    }).then((data) => {
        console.log(`Final response: `, JSON.stringify(data, null, 4));
    }).catch(e => console.error(e.message))
    .then(() => main.api.close());