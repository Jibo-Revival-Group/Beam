import BaseTest from "../test";
import Common from '../common';
let Main = require('../app');
// let fs = require('fs');

/*
* No diagnostic test
* */
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');

class centerTest extends BaseTest {

    constructor() {
        super();
        ////////////////////////////////////////
        this.logKey = "centerTest";
        this.logData = {};
        this.logData['result'] =         {"passed": undefined};
        this.logData['time'] =     {"testDuration": undefined};
    }

    enter() {
        Common.centerRobot();

        console.log('enter index test');

        this.startTime = new Date().getTime();

        Common._showButton('success-button', "800px", "360px", () => {
            Common._setPassFailButtons(successButton, failureButton, "success");
            this.logData['result'].passed = true;
        });
        Common._showButton('failure-button', "400px", "360px", () => {
            Common._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
        });
        Common._showButton('next-button', "100px", "300px", () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            Common._setPassFailButtons(successButton, failureButton, "clear");
            Main.startNextTest();
        });

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-300px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "50px";

        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "25px";
        temp2.style.fontSize = "50px";

        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "30px";
        temp3.style.fontSize = "50px";

        Common._setScreenText("TEST 1: CENTER TEST","Confirm if robot is centered");
    }

    exit() {
        console.log('exit index test');

        //clear all variables
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button','success-button','failure-button']);
    }

    update() {
    }
}

module.exports = centerTest;