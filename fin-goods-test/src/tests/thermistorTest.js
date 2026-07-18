import BaseTest from "../test";
import Common from '../common';
let Main = require('../app');

/*
* Test thermistor value
* */

class ThermistorTest extends BaseTest {

    constructor() {
        super();
        this.exiting = false;
        this.batteryVoltage = undefined;
        
        this.testVoltageOnUpdate = false;
        this.finishedTest = false;
    ///////////////////////////////////////////
        this.logKey = "thermistorTest";
        this.logData = {};
        this.logData['measurement'] = {"thermistor": undefined};
        this.logData['result'] = {"passed": undefined};
        this.logData['time'] = {"testDuration": undefined};
    }

    enter() {
        Common.centerRobot();

        console.log('enter Thermistor test');

        this.startTime = new Date().getTime();

        Common._showButton('center-button', '475px', '200px', () => {
            Common._clearButtonFromScreen(['center-button']);
            Common._setScreenText("Testing battery now...");
            
            this.testVoltageOnUpdate = true;
        }, 'MEASURE');

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-300px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "40px";

        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "20px";
        temp2.style.marginRight = "50px";
        temp2.style.fontSize = "40px";

        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "30px";
        temp3.style.marginRight = "50px";
        temp3.style.fontSize = "40px";

        Common._setScreenText("TEST 2: THERMISTOR",
            "Press MEASURE to measure thermistor value");
    }

    exit() {
        this.exiting = true;
        console.log("exit Thermistor test");
        Common._setScreenText("");
        Common._clearButtonFromScreen(['center-button']);
        
        this.finishedTest = false;
        this.batteryVoltage = undefined;
    }

    //perform test in here
    update() {
        if (this.exiting) {
            return;
        }
        
        if (this.testVoltageOnUpdate) {
            this.testVoltageOnUpdate = false;
            //if battery voltage hasn't been read, read it and set value
            if(this.batteryVoltage == undefined){
                this.batteryVoltage = 10.0;
            }

            this.finishedTest = true;
            Common._setScreenText("","","Thermistor voltage: " + this.batteryVoltage.toFixed(2) + "V");

            this.logData['measurement'].thermistor = this.batteryVoltage;
            if(this.batteryVoltage > -20.0 && this.batteryVoltage < 60.0){
                this.logData['result'].passed = true;
            }
            else{
                this.logData['result'].passed = false;
            }
   
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));

            Main.startNextTest();
        }
    }
}

module.exports = ThermistorTest;
