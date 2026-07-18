"use strict"

// our runtime
var jibo = require('jibo'),
    projectRoot = require('./project-root'),
    currentTest = undefined,
    intervalId = undefined,
    testClasses = [
        require('./tests/beginTest'),
        require('./tests/centerTest'),
        require('./tests/touchscreenTest'),
        require('./tests/displayTest'),
        require('./tests/headTouchTest'),
        require('./tests/ledTest'),
        require('./tests/freeAirTest'),
        require('./tests/stallCWTest'),
        require('./tests/stallCCWTest'),
        require('./tests/fullBodyTest'),
        require('./tests/batteryTest')
    ];

let testIndex = -1;

/**
* Entry point for diagnostic app
**/
export function start() {
    testIndex = -1;
    startNextTest();
}

/**
 * Start a specific test (shutting down existing test if applicable)
 **/
export function startNextTest() {
    // exit old test
    stopCurrentTest();

    ++testIndex;
    if (testIndex >= testClasses.length)
        return;

    //wait a bit to clear any touch events, just to be safe
    setTimeout(() => {
        // create new test
        currentTest = new testClasses[testIndex]();

        // enter new test
        if (currentTest) {
            currentTest.readPersistentData();
            currentTest.enter();

            intervalId = setInterval(function() {
                if (currentTest) {
                    currentTest.update();
                }
            }, 33);
        }
    }, 15);
}

/**
 * Stop the current test
 **/
export function stopCurrentTest() {
    // exit current test
    if (currentTest) {

        if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
        }

        currentTest.writePersistentData();
        currentTest.exit();
    }
}

/**
 * Optionally handle a user tapping or mouse-clicking on the screen
 **/
export function clickScreen() {
    if (currentTest !== undefined) {
        currentTest.click();
    }
}

jibo.init(() => {
    projectRoot.init( function(){
        start();
    })
});

export default {};
