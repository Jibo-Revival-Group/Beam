import BaseTest from "../test";
import Common from '../common';
let Main = require('../app');

/*
* Test display quality with image cycle
* */

let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');
let centerButton = document.getElementById('center-button');

class displayTest extends BaseTest {

    constructor() {
        super();
        this.finishedTest = false;

        this.imageListIndex = 0;

        this.endScreen = true;

        this.imageList = [  "images/blue.png",
                            "images/red.png",
                            "images/green.png",
                            "images/black.png",
                            "images/white.png",
                            "images/25FromBlack.png",
                            "images/25FromWhite.png",
                            "images/3PxBorder.png"]
    //////////////////////////////////////////
        this.logKey = "displayTest";
        this.logData = {};
        this.logData['result'] = {"passed": undefined};
        this.logData['time'] = {"testDuration": undefined};
    }

    enter() {
        Common.centerRobot();

        console.log('enter display test');
        
        this.startTime = new Date().getTime();
        
        let centerFullCallback = () => {
            Common._clearButtonFromScreen(['center-button']);
            //if reset flag is set, start test over again
            if(this.finishedTest) {
                this.imageListIndex = 0;
                this.finishedTest = false;
                Common._setScreenText("");
                Common._clearButtonFromScreen(['next-button', 'success-button', 'failure-button']);
                Common._setPassFailButtons(successButton, failureButton, "clear");
                Common._addButtonListener('container', centerFullCallback);
            }
            if(this.imageListIndex < this.imageList.length){
                this.endScreen = false;
                //clear next button and screen text
                Common._clearButtonFromScreen(['next-button']);
                Common._setScreenText("");
                centerButton.innerHTML = "Next";
                Common._setShowBackground(true, this.imageList[this.imageListIndex]);
                this.imageListIndex++;
            } else {
                this.endScreen = true;
                Common._setScreenText("TEST 3: DISPLAY QUALITY TEST",
                                    "Choose FAIL if images were not sharp and clear");
                Common._setShowBackground(false,this.imageList[0]);
                centerButton.innerHTML = "Redo";
                this.finishedTest = true;
                let nextCallback = () => {
                    //log time
                    this.curTime = new Date().getTime();
                    this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
                    Common._setPassFailButtons(successButton, failureButton, "clear");
                    Main.startNextTest();
                };
                Common._showButton('success-button', "800px", "300px", () => {
                    Common._setPassFailButtons(successButton, failureButton, "success");
                    this.logData['result'].passed = true;
                    Common._showButton('next-button', '50px', '300px', nextCallback);
                });
                Common._showButton('failure-button', "275px", "300px", () => {
                    Common._setPassFailButtons(successButton, failureButton, "failure");
                    this.logData['result'].passed = false;
                    Common._showButton('next-button', '50px', '300px', nextCallback);
                });
                Common._showButton('center-button', "500px", "500px", centerFullCallback, "REDO");
                Common._removeButtonListener('container');
            }
        };

        Common._showButton('center-button', '540px', '400px', centerFullCallback, 'TEST');
        Common._addButtonListener('container', centerFullCallback);

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

        Common._setScreenText("TEST 3: DISPLAY TEST",
                            "Press TEST to begin. Observe screen and look for",
                            "bad pixels, irregular lines or distortion",
                            "Tap the screen to advance.");
    }

    exit() {
        console.log("exit display test");
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button','center-button',
                'success-button','failure-button']);
        Common._removeButtonListener('container');
    }

    //perform test in here
    update() {
        if (this.exiting) {
            return;
        }
    }
}

module.exports = displayTest;