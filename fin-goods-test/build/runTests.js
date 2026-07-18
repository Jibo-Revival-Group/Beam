'use strict';

function run() {

    // debug?
    let debugFlag = false;
    if (process.argv.indexOf('-d') > -1) {
        debugFlag = true;
    }

    let options = {
        path: "tests/index.js",
        electron: require('electron-prebuilt'),
        debug: debugFlag
    };

    // @FIXME- this doesn't spit any of the test progress to stdout/console window and when
    // we try to use redirectOutputToConsole (on Windows) it crashes because it can't require('electron').
    let floss = require("floss");
    //floss.Renderer.prototype.redirectOutputToConsole();

    floss.run(options, function(error) {
        if(debugFlag) {
            // if running in debug mode, no error will be returned so just bail here...
            return;
        }

        if (error) {
            console.log(error);
        }
        else {
            console.log("No errors detected.");
        }
    });
}

run();
