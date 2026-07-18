import BaseTest from "../test";
import Common from '../common';
// let Main = require('../app');
var fs = require('fs');

/*
* Final wrap up before last shutdown before oobe
* */
class oobeFinal extends BaseTest {

    constructor() {
        super();
        this.exiting = false;
        this.skillList = undefined;
        this.gotSkillList = 1;
        this.isSkillRunning = false;
        this.previousTest = 'begin-test';
        this.nextTest = undefined;
    //////////////////////////////////
        this.logKey = "oobeFinal";
        this.logData = {};
        this.logData['result'] = {"passed": undefined}
        this.logData['time'] = {"testDuration": undefined};
    }

    enter() {
        Common.centerRobot();

        console.log('enter OOBE final');

        this.startTime = new Date().getTime();

        this._skillList( (response) => {
            this.skillList = response;
        });

        Common._showButton('center-button', "450px", "500px", () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));

            Common._setScreenText("SHUTDOWN");
            Common._clearButtonFromScreen(['center-button']);

            this._POWEROFF();
        }, "COMPLETE");

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-315px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "40px";

        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "25px";
        temp2.style.fontSize = "40px";

        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "30px";
        temp3.style.fontSize = "40px";

        Common._setScreenText("SHUTDOWN",
                "Press COMPLETE to save data and shut down robot");
    }

    _skillList(cb){
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
        if(this.gotSkillList > 0 && this.skillList != undefined){
            for(var i = 0; i < this.skillList.skills.length; i++){
                if(this.skillList.skills[i].name.includes("fin-goods-test")){
                    this.isSkillRunning = this.skillList.skills[i].running;
                }
            }
            this.gotSkillList--;
        }
    }

    exit() {
        this.exiting = true;
        console.log('exit OOBE final');

        //clear all variables
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button','center-button']);
        this.exiting = false;
    }

    _POWEROFF(){
        var running_on_robot = false;
        if (fs.existsSync('/var/jibo/identity.json')) {
            running_on_robot = true;
        }
        if (running_on_robot) {
            if(this.isSkillRunning) {
                console.log('stopping skill');
                var body = {"skill": "fin-goods-test"};
                var request = new XMLHttpRequest();
                request.open("POST", "http://localhost:8585/skill/terminate", true);
                body = JSON.stringify(body);
                request.send(body);
                require('child_process').spawn('poweroff');
            } else {
                Common._setScreenText("Skill not running through system manager",
                        "Please shut down skill manually!");
                return;
            }
        }

    }

    update() {
        if(this.exiting){
            return;
        }

        this._isFinTestRunning();
    }
}

module.exports = oobeFinal;
