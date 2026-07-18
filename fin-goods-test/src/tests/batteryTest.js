import BaseTest from "../test";
import Common from '../common';
const jibo = require('jibo');
var fs = require('fs');

/*
* Test battery voltage
* */

// let centerButton = document.getElementById('center-button');
// let nextButton = document.getElementById('next-button');

class BatteryTest extends BaseTest {

    constructor() {
        super();
        this.cBPressed = false;
        this.exiting = false;
        this.batteryVoltages = [];

        this.pAdaptMeasured = false;
        this.batteryMeasured = false;
        this.countdownDone = false;

        this.powerAdapterUnplugged = false;
        this.failCount = 0;
        this.passCount = 0;
        this.skillList = undefined;
        this.gotSkillList = 1;
        this.isSkillRunning = 0;

        this.prevBatVolt = 0;

        this.updateCount = 150;
        this.shutdownCount = 95;
        this.plugAdapterAgain = false;
        this.generatedLogs = false;

        this.finishedTest = false;

        this.rawLogFile = undefined;

    ///////////////////////////////////////////
        this.logKey = "batteryTest";
        this.logData = {};
        this.logData['measurement'] = {"batteryVoltage": undefined,
                                    "adapterVoltage": undefined,
                                    "chargeCurrent": undefined};

        this.logData['result'] = {"batteryVoltage": false,
                                    "adapterVoltage": false};


    }

    enter() {
        Common.centerRobot();

        console.log('enter battery test');

        this.startTime = new Date().getTime();

        this._skillList( (response) => {
            this.skillList = response;
        });

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-300px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "50px";

        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "25px";
        temp2.style.marginRight = "50px";
        temp2.style.fontSize = "50px";

        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "25px";
        temp3.style.marginRight = "50px";
        temp3.style.fontSize = "100px";

        let temp4 = document.getElementById('test-label4');
        temp4.style.marginTop = "25px";
        temp4.style.marginRight = "50px";
        temp4.style.fontSize = "50px";

        //remove power adapter state, step 0
        Common._setScreenText("TEST 10: BATTERY VOLTAGE","","",
                            "Step 1. Remove Power Adapter");
                            // "Adapter in: " + jibo.system.isBatteryCharging(),
                            // "Voltage: " + jibo.system.getSystemVoltage());
    }

    _skillList(cb){
        console.log('SKILL LIST');
        var request = new XMLHttpRequest();
        request.open("GET", "http://localhost:8585/skill/list", true);
        // var _this = this;
        request.onreadystatechange = function() {
            if(request.readyState == 4 && request.status == 200){
                var list = JSON.parse(request.responseText);
                // console.log(list);
                cb(list);
            }
        };
        request.send();
    }

    _isFinTestRunning(){
        console.log('RUNNING');
        if(this.gotSkillList > 0 && this.skillList != undefined){
            for(var i = 0; i < this.skillList.skills.length; i++){
                if(this.skillList.skills[i].name.includes("fin-goods-test")){
                    this.isSkillRunning = this.skillList.skills[i].running;
                }
            }
            this.gotSkillList--;
        }
    }

    _POWEROFF(){
        console.log('POWEROFF');
        var running_on_robot = false;
        if (fs.existsSync('/var/jibo/identity.json')) {
            if(this.isSkillRunning) {
                console.log('stopping skill');
                var body = {"command": "fin-goods-test"};
                var request = new XMLHttpRequest();
                request.open("POST", "http://localhost:8779/terminate", true);
                body = JSON.stringify(body);
                request.send(body);
            } else {
                Common._setScreenText("Skill not running through system manager",
                        "Please shut down skill manually!");
                return;
            }
        }
    }

    _generateLog(){
        if(this.generatedLogs){
            return;
        }
        this.rawLogFile =JSON.parse(fs.readFileSync('styles/finGoodsSkill.log'));
        console.log('generate logs');
        this.logKey = "testResults"
        this.logData = {};
        this.logData['result'] = {
                                "neckIndexStatus": undefined,
                                "torsoIndexStatus": undefined,
                                "pelvisIndexStatus": undefined,

                                "centerTest": undefined,
                                "touchscreenTest": undefined,
                                "displayTest": undefined,
                                "headTouchTest": undefined,
                                "ledTest": undefined,

                                "freeAirTestNeckObservation": undefined,
                                "freeAirTestTorsoObservation": undefined,
                                "freeAirTestPelvisObservation": undefined,
                                "freeAirTestNeckFault": undefined,
                                "freeAirTestTorsoFault": undefined,
                                "freeAirTestPelvisFault": undefined,

                                "stallCWTestNeckObservation": undefined,
                                "stallCWTestTorsoObservation": undefined,
                                "stallCWTestPelvisObservation": undefined,
                                "stallCWTestNeckFault": undefined,
                                "stallCWTestTorsoFault": undefined,
                                "stallCWTestPelvisFault": undefined,

                                "stallCCWTestNeckObservation": undefined,
                                "stallCCWTestTorsoObservation": undefined,
                                "stallCCWTestPelvisObservation": undefined,
                                "stallCCWTestNeckFault": undefined,
                                "stallCCWTestTorsoFault": undefined,
                                "stallCCWTestPelvisFault": undefined,

                                "fullBodyTest": undefined,

                                "batteryTestAdapterVoltage": undefined,
                                "batteryTestBatteryVoltage": undefined,
                                "batteryTestChargeCurrent": undefined,

                                "overallPasses": undefined,
                                "overallFails": undefined
                            };

        let test0_0 = 0; let test0_1 = 0; let test0_2 = 0;
        let test1 = 0; let test2 = 0;
        let test3 = 0; let test4 = 0; let test5 = 0;

        let test6_1 = 0; let test6_2 = 0; let test6_3 = 0;
        let test6_4 = 0; let test6_5 = 0; let test6_6 = 0;

        let test7_1 = 0; let test7_2 = 0; let test7_3 = 0;
        let test7_4 = 0; let test7_5 = 0; let test7_6 = 0;

        let test8_1 = 0; let test8_2 = 0; let test8_3 = 0;
        let test8_4 = 0; let test8_5 = 0; let test8_6 = 0;

        let test9 = 0;
        let test10_1 = 0; let test10_2 = 0; let test10_3 = 0;


        if(this.rawLogFile['indexTest'] != undefined){
            test0_0 = this.rawLogFile['indexTest'].indexStatus.neckIndexStatus;
            if(test0_0){
                console.log('neckIndexStatus in beginning pass');
                this.passCount++;
                this.logData['result'].neckIndexStatus = true;
            }else{
                console.log('neckIndexStatus in beginning fail');
                this.failCount++;
                this.logData['result'].neckIndexStatus = false;
            }
            test0_1 = this.rawLogFile['indexTest'].indexStatus.torsoIndexStatus;
            if(test0_1){
                console.log('torsoIndexStatus in beginning pass');
                this.passCount++;
                this.logData['result'].torsoIndexStatus = true;
            }else{
                console.log('torsoIndexStatus in beginning fail');
                this.failCount++;
                this.logData['result'].torsoIndexStatus = false;
            }
            test0_2 = this.rawLogFile['indexTest'].indexStatus.pelvisIndexStatus;
            if(test0_2){
                console.log('pelvisIndexStatus in beginning pass');
                this.passCount++;
                this.logData['result'].pelvisIndexStatus = true;
            }else{
                console.log('pelvisIndexStatus in beginning fail');
                this.failCount++;
                this.logData['result'].pelvisIndexStatus = false;
            }
        }

        if(this.rawLogFile['centerTest'] != undefined){
            test1 = this.rawLogFile['centerTest'].result.passed;
            if(test1){
                console.log('centered pass');
                this.passCount++;
                this.logData['result'].centerTest = true;
            }else{
                console.log('centered fail');
                this.failCount++;
                this.logData['result'].centerTest = false;
            }
        }

        if(this.rawLogFile['touchscreenTest'] != undefined){
            test2 = this.rawLogFile['touchscreenTest'].result.passed;
            if(test2){
                console.log('toucscreen pass');
                this.passCount++;
                this.logData['result'].touchscreenTest = true;
            }else{
                console.log('toucscreen fail');
                this.failCount++;
                this.logData['result'].touchscreenTest = false;
            }
        }

        if(this.rawLogFile['displayTest'] != undefined){
            test3 = this.rawLogFile['displayTest'].result.passed;
            if(test3){
                console.log('display pass');
                this.passCount++;
                this.logData['result'].displayTest = true;
            }else{
                console.log('display fail');
                this.failCount++;
                this.logData['result'].displayTest = false;
            }
        }

        if(this.rawLogFile['headTouchTest'] != undefined){
            test4 = this.rawLogFile['headTouchTest'].result.passed;
            if(test4){
                console.log('headTouchTest pass');
                this.passCount++;
                this.logData['result'].headTouchTest = true;
            }else{
                console.log('headTouchTest fail');
                this.failCount++;
                this.logData['result'].headTouchTest = false;
            }
        }

        if(this.rawLogFile['ledTest'] != undefined){
            test5 = this.rawLogFile['ledTest'].result.passed;
            if(test5){
                console.log('led pass');
                this.passCount++;
                this.logData['result'].ledTest = true;
            }else{
                console.log('led fail');
                this.failCount++;
                this.logData['result'].ledTest = false;
            }
        }

        if(this.rawLogFile['freeAirTest'] != undefined){
            test6_1 = this.rawLogFile['freeAirTest'].result.freeAirTestNeckObservation;
            if(test6_1){
                console.log('bodiesTestHead pass');
                this.passCount++;
                this.logData['result'].freeAirTestNeckObservation = true;
            }else{
                console.log('bodiesTestHead fail');
                this.failCount++;
                this.logData['result'].freeAirTestNeckObservation = false;
            }

            test6_2 = this.rawLogFile['freeAirTest'].result.freeAirTestTorsoObservation;
            if(test6_2){
                console.log('bodiesTestTorso pass');
                this.passCount++;
                this.logData['result'].freeAirTestTorsoObservation = true;
            }else{
                console.log('bodiesTestTorso fail');
                this.failCount++;
                this.logData['result'].freeAirTestTorsoObservation = false;
            }

            test6_3 = this.rawLogFile['freeAirTest'].result.freeAirTestPelvisObservation;
            if(test6_3){
                console.log('bodiesTestPelvis pass');
                this.passCount++;
                this.logData['result'].freeAirTestPelvisObservation = true;
            }else{
                console.log('bodiesTestPelvis fail');
                this.failCount++;
                this.logData['result'].freeAirTestPelvisObservation = false;
            }

            test6_4 = this.rawLogFile['freeAirTest'].faults.freeAirTestNeckFault;
            this.logData['result'].freeAirTestNeckFault = test6_4;

            test6_5 = this.rawLogFile['freeAirTest'].faults.freeAirTestTorsoFault;
            this.logData['result'].freeAirTestTorsoFault = test6_5;

            test6_6 = this.rawLogFile['freeAirTest'].faults.freeAirTestPelvisFault;
            this.logData['result'].freeAirTestPelvisFault = test6_6;
        }

        if(this.rawLogFile['stallCWTest'] != undefined){
            test7_1 = this.rawLogFile['stallCWTest'].result.stallCWTestNeckObservation;
            if(test7_1){
                console.log('stallCWTestHead pass');
                this.passCount++;
                this.logData['result'].stallCWTestNeckObservation = true;
            }else{
                console.log('stallCWTestHead fail');
                this.failCount++;
                this.logData['result'].stallCWTestNeckObservation = false;
            }

            test7_2 = this.rawLogFile['stallCWTest'].result.stallCWTestTorsoObservation;
            if(test7_2){
                console.log('stallCWTestTorso pass');
                this.passCount++;
                this.logData['result'].stallCWTestTorsoObservation = true;
            }else{
                console.log('stallCWTestTorso fail');
                this.failCount++;
                this.logData['result'].stallCWTestTorsoObservation = false;
            }

            test7_3 = this.rawLogFile['stallCWTest'].result.stallCWTestPelvisObservation;
            if(test7_3){
                console.log('stallCWTestPelvis pass');
                this.passCount++;
                this.logData['result'].stallCWTestPelvisObservation = true;
            }else{
                console.log('stallCWTestPelvis fail');
                this.failCount++;
                this.logData['result'].stallCWTestPelvisObservation = false;
            }

            test7_4 = this.rawLogFile['stallCWTest'].faults.stallCWTestNeckFault;
            this.logData['result'].stallCWTestNeckFault = test7_4;

            test7_5 = this.rawLogFile['stallCWTest'].faults.stallCWTestTorsoFault;
            this.logData['result'].stallCWTestTorsoFault = test7_5;

            test7_6 = this.rawLogFile['stallCWTest'].faults.stallCWTestPelvisFault;
            this.logData['result'].stallCWTestPelvisFault = test7_6;

        }

        if(this.rawLogFile['stallCCWTest'] != undefined){
            test8_1 = this.rawLogFile['stallCCWTest'].result.stallCCWTestNeckObservation;
            if(test8_1){
                console.log('stallCCWTestHead pass');
                this.passCount++;
                this.logData['result'].stallCCWTestNeckObservation = true;
            }else{
                console.log('stallCCWTestHead fail');
                this.failCount++;
                this.logData['result'].stallCCWTestNeckObservation = false;
            }

            test8_2 = this.rawLogFile['stallCCWTest'].result.stallCCWTestTorsoObservation;
            if(test8_2){
                console.log('stallCCWTestPelvis pass');
                this.passCount++;
                this.logData['result'].stallCCWTestTorsoObservation = true;
            }else{
                console.log('stallCCWTestPelvis fail');
                this.failCount++;
                this.logData['result'].stallCCWTestTorsoObservation = false;
            }

            test8_3 = this.rawLogFile['stallCCWTest'].result.stallCCWTestPelvisObservation;
            if(test8_3){
                console.log('stallCCWTestPelvis pass');
                this.passCount++;
                this.logData['result'].stallCCWTestPelvisObservation = true;
            }else{
                console.log('stallCCWTestTorso fail');
                this.failCount++;
                this.logData['result'].stallCCWTestPelvisObservation = false;
            }

            test8_4 = this.rawLogFile['stallCCWTest'].faults.stallCCWTestNeckFault;
            this.logData['result'].stallCCWTestNeckFault = test8_4;

            test8_5 = this.rawLogFile['stallCCWTest'].faults.stallCCWTestTorsoFault;
            this.logData['result'].stallCCWTestTorsoFault = test8_5;

            test8_6 = this.rawLogFile['stallCCWTest'].faults.stallCCWTestPelvisFault;
            this.logData['result'].stallCCWTestPelvisFault = test8_6;
        }

        if(this.rawLogFile['fullBodyTest'] != undefined){
            test9 = this.rawLogFile['fullBodyTest'].result.passed;
            if(test9){
                console.log('fullBodyTest pass');
                this.passCount++;
                this.logData['result'].fullBodyTest = true;
            }else{
                console.log('fullBodyTest fail');
                this.failCount++;
                this.logData['result'].fullBodyTest = false;
            }
        }

        if(this.rawLogFile['batteryTest'] != undefined){
            test10_1 = this.rawLogFile['batteryTest'].result.adapterVoltage;
            if(test10_1){
                console.log('batteryTestpAdapt pass');
                this.passCount++;
                this.logData['result'].batteryTestAdapterVoltage = true;
            }else{
                console.log('batteryTestpAdapt fail');
                this.failCount++;
                this.logData['result'].batteryTestAdapterVoltage = false;
            }

            test10_2 = this.rawLogFile['batteryTest'].result.batteryVoltage;
            if(test10_2){
                console.log('batteryTestBattery pass');
                this.passCount++;
                this.logData['result'].batteryTestBatteryVoltage = true;
            }else{
                console.log('batteryTestBattery fail');
                this.failCount++;
                this.logData['result'].batteryTestBatteryVoltage = false;
            }

            test10_3 = this.rawLogFile['batteryTest'].measurement.chargeCurrent;
            this.logData['result'].batteryTestChargeCurrent = test10_3;
        }

        //WRITE ALL ABOVE DATA TO LOG
        this.writePersistentData();

        this.logKey = "overallResults";
        this.logData = {};
        this.logData['overallResult'] = {"overallPassFail": undefined,
                                        "overallPasses": undefined,
                                        "overallFails": undefined}

        this.logData['overallResult'].overallPasses = this.passCount;
        this.logData['overallResult'].overallFails = this.failCount;
        if(this.failCount == 0){
            console.log('BiT passed');
            this.logData['overallResult'].overallPassFail = true;
        }
        else{
            this.logData['overallResult'].overallPassFail = false;
        }
        this.generatedLogs = true;
        this.writePersistentData();
    }

    exit() {
        this.exiting = true;
        console.log("exit battery test");
        Common._setScreenText("");

        this.finishedTest = false;
        this.batteryVoltage = undefined;
    }

    //perform test in here
    update() {
        if (this.exiting) {
            return;
        }

        this._isFinTestRunning();

        // measure the power adapter voltage once
        // in the first step before adapter is unplugged

        if(!this.pAdaptMeasured){
            var pAdaptV = jibo.system.getSystemVoltage().toFixed(2);

            //check within acceptable range
            if(pAdaptV >= 16.2 && pAdaptV <= 19.8){
                this.logData['result'].adapterVoltage = true;
                this.logData['measurement'].adapterVoltage = pAdaptV;
                console.log('passed step 1');
            }
            else{
                this.logData['result'].adapterVoltage = false;
                this.logData['measurement'].adapterVoltage = pAdaptV;
                console.log('failed step 1');
            }
            this.pAdaptMeasured = true;
        }

        //step 1, power adapter unplugged

        if(!jibo.system.pluggedIn && this.pAdaptMeasured){

            this.powerAdapterUnplugged = true;

            if (this.updateCount) {
                this.updateCount--;
            }else{
                //after countdown, display plug in again
                this.plugAdapterAgain = true;
            }

            //countdown to allow time to log enough battery data
            Common._setScreenText("TEST 10: BATTERY VOLTAGE", "",
                                (parseInt(this.updateCount / 30) + 1), "");

            //only log voltage if different than last time
            if(jibo.system.getSystemVoltage() != this.prevBatVolt){
                this.batteryVoltages.push(jibo.system.getSystemVoltage());
                this.prevBatVolt = jibo.system.getSystemVoltage();
            }
        }

        //step 2, power adapter was unplugged and timer went by to allow sampling
        //of battery voltages
        if(this.plugAdapterAgain){
            this.batteryVoltage = jibo.system.getSystemVoltage();
            this.countdownDone = true;
            Common._setScreenText("TEST 10: BATTERY VOLTAGE","","",
                        "Step 2. Insert Power Adapter");
        }

        //ready to measure battery
        if(jibo.system.pluggedIn && this.countdownDone){
            //check if battery voltage is within range
            if(!this.batteryMeasured){
                var batteryV = Math.min.apply(null, this.batteryVoltages);

                if(batteryV >= 14.0 && batteryV <= 15.2){
                    this.logData['result'].batteryVoltage = true;
                    this.logData['measurement'].batteryVoltage = batteryV.toFixed(2);
                    console.log('passed step 2');
                }
                else{
                    this.logData['result'].batteryVoltage = false;
                    this.logData['measurement'].batteryVoltage = batteryV.toFixed(2);
                    console.log('failed step 2');
                }
                this.logData['measurement'].chargeCurrent = jibo.system.batteryChargeRate.toFixed(2);

                //only measure once
                this.batteryMeasured = true;
            }
            //log time
            // this.shutdownCount = 100;
            // this.finishedLogging = false;
            if(this.shutdownCount == 0 && !this.finishedLogging){
                this.curTime = new Date().getTime();
                if(!this.generatedLogs){
                    this.logData['duration'] = {"testDuration": undefined};
                    this.logData['duration'].testDuration = (Math.abs(this.curTime - this.startTime));
                    this.writePersistentData();
                }
                this._generateLog();
                this._POWEROFF();
            }
            else{
                Common._setScreenText("SHUTDOWN IN:", "",
                                    (parseInt(this.shutdownCount / 30) + 1), "");
                this.shutdownCount--;
            }
        }
    }
}

module.exports = BatteryTest;
