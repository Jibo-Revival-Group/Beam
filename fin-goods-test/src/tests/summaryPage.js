import BaseTest from "../test";
import Common from '../common';
let Main = require('../app');
var fs = require('fs');

/*
* Summary page
* */

class summaryPage extends BaseTest {

    constructor() {
        super();
        this.exiting = false;
        this.rawLogFile = undefined;

    //////////////////////////////////
        this.logKey = "summaryPage";
        this.logData = {};
        this.logData['result'] = {"passed": false}
        this.logData['time'] = {"testDuration": undefined};
    }

    enter() {
        Common.centerRobot();

        console.log('enter summary page');

        this.startTime = new Date().getTime();

        this.rawLogFile =JSON.parse(fs.readFileSync('styles/finGoodsSkill.log'));

        Common._showButton('next-button', "100px", "300px", () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            Main.startNextTest();
        });
        Common._clearButtonFromScreen(['center-button']);

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-315px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "40px";

        let temp5 = document.getElementById('test-label5');
        temp5.innerHTML = "";

        Common._setScreenText("SUMMARY = PASS OR REWORK");

        let test0 = 0; let test1 = 0; let test2 = 0;
        let test3 = 0; let test4 = 0; let test5 = 0;
        let test6_1 = 0; let test6_2 = 0; let test6_3 = 0;
        let test7_1 = 0; let test7_2 = 0; let test7_3 = 0;
        let test8_1 = 0; let test8_2 = 0; let test8_3 = 0;
        let test9 = 0; let test10_1 = 0; let test10_2 = 0;

        if(this.rawLogFile['beginTest'] != undefined){
            test0 = this.rawLogFile['beginTest'].indexResult.passed;
            if(!test0){
                temp5.innerHTML += "<p>" + "0. Index: " + 'FAIL' + "</p>";
            }
        }else{
            test0 = false;
        }

        if(this.rawLogFile['indexTest'] != undefined){
            test1 = this.rawLogFile['indexTest'].result.passed;
            if(!test1){
                temp5.innerHTML += "<p>" + "1. Centered: " + 'FAIL' + "</p>";
            }
        }else{
            test1 = false;
        }

        if(this.rawLogFile['touchscreenTest'] != undefined){
            test2 = this.rawLogFile['touchscreenTest'].result.passed;
            if(!test2){
                temp5.innerHTML +="<p>" + "2. Touchscreen: " + 'FAIL' + "</p>";
            }
        }else{
            test2 = false;
        }
        if(this.rawLogFile['displayTest'] != undefined){
            test3 = this.rawLogFile['displayTest'].result.passed;
            if(!test3){
                temp5.innerHTML += "<p>" + "3. Display: " + 'FAIL' + "</p>";
            }
        }else{
            test3 = false;
        }
        if(this.rawLogFile['touchpadsTest'] != undefined){
            test4 = this.rawLogFile['touchpadsTest'].result.passed;
            if(!test4){
                temp5.innerHTML += "<p>" + "4. Head Sensors: " + 'FAIL' + "</p>";
            }
        }else{
            test4 = false;
        }
        if(this.rawLogFile['ledTest'] != undefined){
            test5 = this.rawLogFile['ledTest'].result.passed;
            if(!test5){
                temp5.innerHTML += "<p>" + "5. LED Ring: " + 'FAIL' + "</p>";
            }
        }else{
            test5 = false;
        }
        if(this.rawLogFile['bodiesTest'] != undefined){
            test6_1 = this.rawLogFile['bodiesTest'].result.resultArray[0];
            test6_2 = this.rawLogFile['bodiesTest'].result.resultArray[1];
            test6_3 = this.rawLogFile['bodiesTest'].result.resultArray[2];
            if(!test6_1){
                temp5.innerHTML += "<p>" + "6.1. Free Air Head: " + 'FAIL' + "</p>";
            }
            if(!test6_2){
                temp5.innerHTML += "<p>" + "6.2. Free Air Torso: " + 'FAIL' + "</p>";
            }
            if(!test6_3){
                temp5.innerHTML += "<p>" + "6.3. Free Air Pelvis: " + 'FAIL' + "</p>";
            }
        }else{
            test6_1 = false;
            test6_2 = false;
            test6_3 = false;
        }
        if(this.rawLogFile['stallCWTest'] != undefined){
            test7_1 = this.rawLogFile['stallCWTest'].result.resultArray[0];
            test7_2 = this.rawLogFile['stallCWTest'].result.resultArray[1];
            test7_3 = this.rawLogFile['stallCWTest'].result.resultArray[2];
            if(!test7_1){
                temp5.innerHTML += "<p>" + "7.1. Stall Head CW: " + 'FAIL' + "</p>";
            }
            if(!test7_2){
                temp5.innerHTML += "<p>" + "7.2. Stall Torso CW: " + 'FAIL' + "</p>";
            }
            if(!test7_3){
                temp5.innerHTML += "<p>" + "7.3. Stall Pelvis CW: " + 'FAIL' + "</p>";
            }
        }else{
            test7_1 = false;
            test7_2 = false;
            test7_3 = false;
        }
        if(this.rawLogFile['stallCCWTest'] != undefined){
            test8_1 = this.rawLogFile['stallCCWTest'].result.resultArray[0];
            test8_2 = this.rawLogFile['stallCCWTest'].result.resultArray[1];
            test8_3 = this.rawLogFile['stallCCWTest'].result.resultArray[2];
            if(!test8_1){
                temp5.innerHTML += "<p>" + "8.1. Stall Head CCW: " + 'FAIL' + "</p>";
            }
            if(!test8_2){
                temp5.innerHTML += "<p>" + "8.2. Stall Torso CCW: " + 'FAIL' + "</p>";
            }
            if(!test8_3){
                temp5.innerHTML += "<p>" + "8.3. Stall Pelvis CCW: " + 'FAIL' + "</p>";
            }
        }else{
            test8_1 = false;
            test8_2 = false;
            test8_3 = false;
        }
        if(this.rawLogFile['fullBodyTest'] != undefined){
            test9 = this.rawLogFile['fullBodyTest'].result.passed;
            if(!test9){
                temp5.innerHTML += "<p>" + "9. Full Body Test: " + 'FAIL' + "</p>";
            }
        }
        else{
            test9 = false;
        }

        if(this.rawLogFile['batteryTest'] != undefined){
            test10_1 = this.rawLogFile['batteryTest'].result.pAdapt;
            test10_2 = this.rawLogFile['batteryTest'].result.battery;

            if(!test10_1){
                temp5.innerHTML += "<p>" + "10.1 PAdapt: " + 'FAIL'  + "</p>";
            }
            if(!test10_2){
                temp5.innerHTML += "<p>" + "10.2 Battery: " + 'FAIL'  + "</p>";

            }
        }else{
            test10_1 = false;
            test10_2 = false;
        }

        if(temp5.innerHTML.length == 0){
            console.log('BiT passed');
            temp5.innerHTML = "PASSED";
            this.logData['result'] = true;
        }
    }


    exit() {
        console.log('exit summary page');

        //clear all variables
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button']);
        document.getElementById('test-label5').innerHTML = "";
        document.getElementById('test-label5').style.Display = "none";
    }

    update() {
    }
}

module.exports = summaryPage;