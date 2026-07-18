"use strict";

/**
 * Base class for all diagnostic tests
 */
let fs = require('fs');
let path = require('path');
// let Common = require('./common');

let statsPath = path.join(global.__dirname, "/styles/finGoodsSkill.log");

class BaseTest {

    constructor() {
        // log data
        this.logKey = undefined;
        this.logData = undefined;
    }

    // Required (start test)
    enter() {
        throw "Implement enter";
    }

    // Required (do your clean up here)
    exit() {
        throw "Implement exit";
    }

    // Optionally do stuff in an update interval
    update() {
       // throw "Implement update";
    }

    // Optionally handle a user tapping or mouse-clicking the screen
    click() {

    }

    // logging stuff...
    //
    // attempt to read persistent data if logKey is defined; this is automatically called *before* enter!
    readPersistentData() {
        if (!this.logKey || (!fs.existsSync(statsPath))) {
            return; // nothing to read
        }

        try {
            // Load stats file
            let data = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

            if(data.hasOwnProperty(this.logKey)) {
                this.logData = data[this.logKey];
            }
        }
        catch(error) {
            console.log("\nError parsing \"" + statsPath + "\". " + error + "\n");
        }
    }

    // write out the persistent data if logKey is defined; this is automatically called *before* exit
    writePersistentData() {
        if (!this.logKey) {
            return; // nothing flagged to write anything
        }

        let data = {};
        if (fs.existsSync(statsPath)) {
            // read in old one first
            data = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        }
        data[this.logKey] = ((this.logData !== undefined) ? this.logData : {});


        try{
            fs.writeFileSync(statsPath, JSON.stringify(data, null, '    '), 'utf8');
        } catch(error) {
            console.log("\nError writing \"" + statsPath + "\". " + error + "\n");
        }
    }
}

export default BaseTest;
