import BaseTest from "../test";
import Common from '../common';
const jibo = require('jibo');
let Main = require('../app');

/*
* Test touch sensors
* */
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');

class headTouchTest extends BaseTest {

    constructor() {
        super();
        this.finishedTest = false;
        this.testing = false;
    ////////////////////////////////////////////////////////
        this.logKey = "headTouchTest";
        this.logData = {};
        this.logData['result'] = {"passed": undefined};
        this.logData['time'] = {"testDuration": undefined};
        this.logData['touchpads'] = {"isActivated":[undefined, undefined, undefined,
                                                      undefined, undefined, undefined]}
    }

    enter() {
        Common.centerRobot();

        console.log('enter touchpads test');

        this.startTime = new Date().getTime();

        this.touchpads = document.getElementById('touchpads');

        Common._showButton('touchpad-3', '1025px', '250px');
        Common._showButton('touchpad-4', '1025px', '375px');
        Common._showButton('touchpad-5', '1025px', '500px');
        Common._showButton('touchpad-0', '900px', '250px');
        Common._showButton('touchpad-1', '900px', '375px');
        Common._showButton('touchpad-2', '900px', '500px');

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
        Common._showButton('failure-button', "275px", "500px", () => {
            Common._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
            Common._showButton('next-button', "100px", "300px", nextCallback);
        });
        Common._showButton('center-button', '575px', '400px', () => {
            this.testing = true;
            Common._setPassFailButtons(successButton, failureButton, "clear");
            Common._showButton('center-button', '500px', '400px', null, 'REDO');
            Common._showButton('next-button', '6000px', '500px');
            for (let i = 0; i <6; i++) {
                this._touchpadControl(document.getElementById('touchpad-'+i), i, "reset");
            }
        }, 'TEST');

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-300px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "40px";

        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "25px";
        temp2.style.marginRight = "50px";
        temp2.style.fontSize = "40px";

        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "30px";
        temp3.style.marginRight = "50px";
        temp3.style.fontSize = "40px";

        Common._setScreenText("TEST 4: HEAD TOUCH SENSORS",
                            "Rub hands along back of head several times.  Choose FAIL",
                            "if any sensor does not activate");
    }

    exit() {
        console.log('exit touchpads test');

        this.touchpads.style.display = "none";
        document.getElementById('test-label1').style.marginTop = "0px";
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button','center-button','success-button','failure-button']);
    }

    _touchpadControl(button, index, mode){
        button.classList.remove('activated', 'reset');
        if(mode === "activated"){
            button.classList.add('activated');
            this.logData['touchpads'].isActivated[index] = index + ": " + true;
        }
        if(mode === "reset"){
            button.classList.add('reset');
            this.logData['touchpads'].isActivated[index] = index + ": " + false;
        }
    }

    //perform test in here
    update() {
        if(this.testing){
            for(let i = 0; i<6; i++){
                if(jibo.system.bs.touchState.pad_state[i]){
                    this._touchpadControl(document.getElementById('touchpad-'+i), i, "activated");
                }
            }
        }
    }
}

module.exports = headTouchTest;
