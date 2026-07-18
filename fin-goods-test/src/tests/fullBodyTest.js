import BaseTest from "../test";
import Common from '../common';
let path = require('path');
let projectRoot = require('../project-root');
let jibo = require('jibo');
let Main = require('../app');
import bts from '../bts';

/*
* full body test
* */
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');

class fullBodyTest extends BaseTest {

    constructor() {
        super();
        ////////////////////////////////////////
        this.logKey = "fullBodyTest";
        this.logData = {};
        this.logData['result'] =         {"passed": undefined};
        this.logData['time'] =     {"testDuration": undefined};
    }

    enter() {
        Common.centerRobot();

        console.log('enter full body test');

        this.startTime = new Date().getTime();

        Common._showButton('success-button', "800px", "360px", () => {
            Common._setPassFailButtons(successButton, failureButton, "success");
            this.logData['result'].passed = true;
        });
        Common._showButton('failure-button', "400px", "360px", () => {
            Common._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
        });
        Common._showButton('center-button', '540px', '500px', () => {
            this.root = jibo.bt.create( bts['fullBodyAnimation']);
            this.root.start();
            Common._setPassFailButtons(successButton, failureButton, "clear");
        }, 'SPIN');
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

        Common._setScreenText("TEST 9: FULL BODY TEST","Press SPIN to animate robot",
                            "Press FAIL if anything abnormal, PASS otherwise");
    }

    exit() {
        console.log('exit full body test');
        if (this.root) {
            this.root.stop();
            this.root = null;
        }
        //clear all variables
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button','success-button','failure-button', "center-button"]);
    }

    update() {
        //only update if test has started
        if(this.root){
            this.root.update();
        }
    }
}

module.exports = fullBodyTest;
