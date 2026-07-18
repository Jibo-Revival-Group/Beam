import BaseTest from "../test";
import Common from '../common';
let Main = require('../app');

/*
* Test touchscreen
* */
let t1ConfirmButton = document.getElementById('touchscreen1');
let t2ConfirmButton = document.getElementById('touchscreen2');
let t3ConfirmButton = document.getElementById('touchscreen3');
let t4ConfirmButton = document.getElementById('touchscreen4');
let t5ConfirmButton = document.getElementById('touchscreen5');
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');

class TouchScreenTest extends BaseTest {

    constructor() {
        super();
        this.finishedTest = false;
        this.imageListIndex = 0;
        this.N = 0;
        /////////////////////////////////////////
        this.logKey = "touchscreenTest";
        this.logData = {};
        this.logData['buttons'] = {'successArray':[undefined, undefined, undefined, undefined, undefined]};
        this.logData['result'] = {'passed': undefined};
        this.logData['time'] = {"testDuration": undefined};
    }

    enter() {
        Common.centerRobot();

        console.log('enter touchscreen test');

        this.startTime = new Date().getTime();

        Common._showButton('touchscreen1', "1150px", "600px", () => {
            this._touchScreenButtonPressed(t1ConfirmButton, 0);
        });
        Common._showButton('touchscreen2', "50px", "600px", () => {
            this._touchScreenButtonPressed(t2ConfirmButton, 1);
        });
        Common._showButton('touchscreen3', "1150px", "50px", () => {
            this._touchScreenButtonPressed(t3ConfirmButton, 2);
        });
        Common._showButton('touchscreen4', "50px", "50px", () => {
            this._touchScreenButtonPressed(t4ConfirmButton, 3);
        });
        Common._showButton('touchscreen5', "600px", "300px", () => {
            this._touchScreenButtonPressed(t5ConfirmButton, 4);
        });
        
        let nextCallback = () => {
            console.log('next test');
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            Common._setPassFailButtons(successButton, failureButton, "clear");
            Main.startNextTest();
        };
        Common._showButton('success-button', "800px", "400px", () => {
            Common._setPassFailButtons(successButton, failureButton, "success");
            this.logData['result'].passed = true;
            Common._showButton('next-button', "100px", "300px", nextCallback);
        });
        Common._showButton('failure-button', "275px", "400px", () => {
            Common._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
            Common._showButton('next-button', "100px", "300px", nextCallback);
        });
        Common._showButton('center-button', "540px", '600px', () => {
            Common._showButton('touchscreen1', "1150px", "600px");
            Common._showButton('touchscreen2', "50px", "600px");
            Common._showButton('touchscreen3', "1150px", "50px");
            Common._showButton('touchscreen4', "50px", "50px");
            Common._showButton('touchscreen5', "600px", "300px");
            
            this._touchScreenButtonReset(t1ConfirmButton, 0);
            this._touchScreenButtonReset(t2ConfirmButton, 1);
            this._touchScreenButtonReset(t3ConfirmButton, 2);
            this._touchScreenButtonReset(t4ConfirmButton, 3);
            this._touchScreenButtonReset(t5ConfirmButton, 4);

            Common._setPassFailButtons(successButton, failureButton, "clear");

            Common._clearButtonFromScreen(['next-button']);
        }, 'REDO');

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

        Common._setScreenText("TEST 2: TOUCH SCREEN",
                            "Press all 5 circles.  Choose FAIL if circle",
                            "does not change color, or if it takes more",
                            "than 2 attempts to change.");
    }

    _clear5(){
        Common._clearButtonFromScreen(['touchscreen1','touchscreen2','touchscreen3',
                                    'touchscreen4', 'touchscreen5']);
    }

    exit() {
        console.log("exit touchscreen test");
        Common._setScreenText("");
        Common._clearButtonFromScreen(['touchscreen1','touchscreen2','touchscreen3',
                                    'touchscreen4', 'touchscreen5','next-button',
                                    'success-button', 'failure-button']);
    }

    _touchScreenButtonPressed(button, index) {
        button.classList.remove('untouched');
        button.classList.add('touched');
        this.logData['buttons'].successArray[index] = true;
    }

    _touchScreenButtonReset(button, index){
        button.classList.add('untouched');
        button.classList.remove('touched');
        this.logData['buttons'].successArray[index] = false;
    }

    //perform test in here
    update() {
    }
}

module.exports = TouchScreenTest;
