import BaseTest from "../test";
import Common from '../common';
let jibo = require('jibo');
let Main = require('../app');
let path = require('path');
let projectRoot = require('../project-root');
import bts from '../bts';

/*
* Test LED ring
* */

let centerButton = document.getElementById('center-button');
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');

class LEDTest extends BaseTest {

    constructor() {
        super();
        this.finishedTest = false;

        this.ledListIndex = 0;
    ////////////////////////////////////////////////////
        this.logKey = "ledTest";
        this.logData = {};
        this.logData['time'] = {"testDuration": undefined};
        this.logData['result'] = {"passed": undefined};

        this.ledList = [["RED",[1,0,0], "linear-gradient(to bottom, #ff0000, #b40000)"],
                        ["GREEN",[0,1,0],"linear-gradient(to bottom, #00ff00, #00b400)"],
                        ["BLUE",[0,0,1], "linear-gradient(to bottom, #0000ff, #0000b4)"],
                        ["WHITE", [1,1,1],"linear-gradient(to bottom, #ffffff, #b4b4b4)"]]
    }

    _warmUp(){
        console.log("body warmup");
        this.root = jibo.bt.create(bts['WarmUpMovements']);
        this.root.start();
        if(!this.startedTest){
            this.startedTest = true;
        }
    }

    enter() {
        Common.centerRobot();

        console.log('enter LED test');

        this.startTime = new Date().getTime();

        this._warmUp();

        Common._showButton('center-button', '540px', '500px', () => {
            //if reset flag is set, start test over again
            if(this.finishedTest == true){
                this.ledListIndex = 0;
                this.finishedTest = false;
                //clear screen text and next button
                Common._setScreenText("");
                Common._clearButtonFromScreen(['next-button','success-button','failure-button']);
                Common._setPassFailButtons(successButton, failureButton, "clear");
            }
            if(this.ledListIndex < this.ledList.length) {
                //SPIN
                this.root = jibo.bt.create(bts['head-CCW-pelvis-CW']);
                this.root.start();
                //clear next button and screen text
                Common._setScreenText("TEST 5: LIGHT RING","Inspect light ring");
                Common._showButton('center-button', "540px", "500px", null, this.ledList[this.ledListIndex][0]);
                document.getElementById('center-button').style.backgroundImage =
                                        this.ledList[this.ledListIndex][2];
                //set LED to color from above list
                Common.setLED(this.ledList[this.ledListIndex][1]);
                this.ledListIndex++;
            } else {
                Common.resetLED();
                document.getElementById('center-button').style.backgroundImage =
                            "linear-gradient(to bottom, #28a6fa, #2280ba)";
                Common._setScreenText("TEST 6: LIGHT RING",
                                    "Choose FAIL if any LEDs did not illuminate");
                //finished cycling through image display
                centerButton.innerHTML = "REDO";
                //set flag that test cycle finished, in case redo
                this.finishedTest = true;
                let nextCallback = () => {
                    //log time
                    this.curTime = new Date().getTime();
                    this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
                    Common._setPassFailButtons(successButton, failureButton, "clear");
                    Main.startNextTest();
                };
                Common._showButton('success-button', "275px", "300px", () => {
                    Common._setPassFailButtons(successButton, failureButton, "success");
                    this.logData['result'].passed = true;
                    Common._showButton('next-button', "100px", "300px", nextCallback);
                });
                Common._showButton('failure-button', "800px", "300px", () => {
                    Common._setPassFailButtons(successButton, failureButton, "failure");
                    this.logData['result'].passed = false;
                    Common._showButton('next-button', "100px", "300px", nextCallback);
                });
            }
        }, 'TEST');

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-280px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "50px";

        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "25px";
        temp2.style.marginRight = "50px";
        temp2.style.fontSize = "50px";

        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "25px";
        temp3.style.marginRight = "50px";
        temp3.style.fontSize = "50px";

        let temp4 = document.getElementById('test-label4');
        temp4.style.marginTop = "25px";
        temp4.style.marginRight = "50px";
        temp4.style.fontSize = "50px";

        Common._setScreenText("TEST 5: LIGHT RING",
                            "Press TEST to begin.  Cycle through each color and",
                            "visually inspect light ring.  Choose FAIL if any",
                            "LEDs do not illuminate correctly.");
    }

    exit() {
        console.log("exit LED test");
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button','center-button',
                                'success-button','failure-button']);
    }

    //perform test in here
    update() {
        if (this.exiting) {
            return;
        }
    }
}

module.exports = LEDTest;
