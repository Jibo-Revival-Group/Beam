import BaseTest from "../test";
import Common from '../common';
let path = require('path');
let projectRoot = require('../project-root');
let jibo = require('jibo');
let Main = require('../app');
import bts from '../bts';


/*
* Body test
* */

let neckPassButton = document.getElementById('success-button');
let neckFailButton = document.getElementById('failure-button');
let torsoPassButton = document.getElementById('success-button-2');
let torsoFailButton = document.getElementById('failure-button-2');
let pelvisPassButton = document.getElementById('success-button-3');
let pelvisFailButton = document.getElementById('failure-button-3');

class freeAirTest extends BaseTest {

    constructor() {
        super();

        this.startedTest = false;
        this.velThresh = .25;

        this.bodyData = "";

///////////////////////////////////
        this.logKey = "freeAirTest";
        this.logData = {};
        this.logData['neck'] = {"curArray":[], "velArray":[]};
        this.logData['torso'] = {"curArray":[], "velArray":[]};
        this.logData['pelvis'] = {"curArray":[], "velArray":[]};
        this.logData['time'] = {"testDuration": undefined};
        this.logData['result'] = {"freeAirTestNeckObservation": undefined,
                                "freeAirTestTorsoObservation": undefined,
                                "freeAirTestPelvisObservation": undefined};

        this.logData['faults'] = {"freeAirTestNeckFault": undefined,
                                  "freeAirTestTorsoFault": undefined,
                                  "freeAirTestPelvisFault": undefined}
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

        console.log("enter bodies test");

        this.startTime = new Date().getTime();
        this.logData['result'].freeAirTestNeckObservation = false;
        this.logData['result'].freeAirTestTorsoObservation = false;
        this.logData['result'].freeAirTestPelvisObservation = false;
        this.axisSocket = new WebSocket("ws://localhost:8282/axis_state");

        this._warmUp();

        //neck spin
        Common._showButton('neck-button', "900px", "250px", () => {
            this._setSpinLogic(true, 'neck');
        });
        //torso spin
        Common._showButton('torso-button', "900px", "400px", () => {
            this._setSpinLogic(true, 'torso');
        });
        //pelvis spin
        Common._showButton('pelvis-button', "900px", "550px", () => {
            this._setSpinLogic(true, 'pelvis');
        });

        //neck pass
        Common._showButton('success-button', "600px", "250px", () => {
            Common._setPassFailButtons(neckPassButton, neckFailButton, "success");
            this.logData['result'].freeAirTestNeckObservation = true;
        });
        //neck fail
        Common._showButton('failure-button', "300px", "250px", () => {
            Common._setPassFailButtons(neckPassButton, neckFailButton, "failure");
            this.logData['result'].freeAirTestNeckObservation = false;
        });
        //torso pass
        Common._showButton('success-button-2', "600px", "400px", () => {
            Common._setPassFailButtons(torsoPassButton, torsoFailButton, "success");
            this.logData['result'].freeAirTestTorsoObservation = true;
        });
        //torso fail
        Common._showButton('failure-button-2', "300px", "400px", () => {
            Common._setPassFailButtons(torsoPassButton, torsoFailButton, "failure");
            this.logData['result'].freeAirTestTorsoObservation = false;
        });
        //pelvis pass
        Common._showButton('success-button-3', "600px", "550px", () => {
            Common._setPassFailButtons(pelvisPassButton, pelvisFailButton, "success");
            this.logData['result'].freeAirTestPelvisObservation = true;
        });
        //pelvis fail
        Common._showButton('failure-button-3', "300px", "550px", () => {
            Common._setPassFailButtons(pelvisPassButton, pelvisFailButton, "failure");
            this.logData['result'].freeAirTestPelvisObservation = false;
        });

        Common._showButton('next-button', '100px', '300px', () => {
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            if(this.bodyData){
                this.logData['faults'].freeAirTestNeckFault = (this.bodyData.neck.fault_status);
                this.logData['faults'].freeAirTestTorsoFault = (this.bodyData.torso.fault_status);
                this.logData['faults'].freeAirTestPelvisFault = (this.bodyData.pelvis.fault_status);
            }
            Main.startNextTest();
        });

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

        Common._setScreenText("TEST 6: FREE-AIR ROTATION",
                            "Select a body segment to begin test.  Choose FAIL if body",
                            "movement is erratic.");

        //collect callback of bodyData
        this.testAPI( (response) => {
            this.bodyData = response;
        });
    }

    //API to collect body data and parse
    testAPI(cb){
        this.axisSocket.onmessage = function(event){
            cb(JSON.parse(event.data));
        };
    }

    exit() {
        console.log("exit bodies test");
        if(this.root){
            this.root.stop();
            this.root = null;
        }
        Common._setScreenText("");

        Common._clearButtonFromScreen(['neck-button','pelvis-button','torso-button',
                                    'success-button', 'failure-button',
                                    'success-button-2', 'failure-button-2',
                                    'success-button-3', 'success-button-3',
                                     'next-button']);

        Common._setPassFailButtons(neckPassButton, neckFailButton, "clear");
        Common._setPassFailButtons(torsoPassButton, torsoFailButton, "clear");
        Common._setPassFailButtons(pelvisPassButton, pelvisFailButton, "clear");
        this.startedTest = false;
    }

     _setSpinLogic(bodyButton, body){
        this.root = jibo.bt.create( bts[body + '-spin-both']);
        this.root.start();

        //indicate test has started to allow root updating
        if(!this.startedTest){
            this.startedTest = true;
        }
    }

    update() {
        ///////////////////

        //Logging logic
        /////////////////////////////////////////////////////////
        if(this.bodyData.neck != undefined && this.bodyData.neck.vel > this.velThresh){
            this.logData['neck'].curArray.push(this.bodyData.neck.cur.toFixed(5));
            this.logData['neck'].velArray.push(this.bodyData.neck.vel.toFixed(5));
        }

        if(this.bodyData.torso != undefined && this.bodyData.torso.vel > this.velThresh){
            this.logData['torso'].curArray.push(this.bodyData.torso.cur.toFixed(5));
            this.logData['torso'].velArray.push(this.bodyData.torso.vel.toFixed(5));
        }

        if(this.bodyData.pelvis != undefined && this.bodyData.pelvis.vel > this.velThresh){
            this.logData['pelvis'].curArray.push(this.bodyData.pelvis.cur.toFixed(5));
            this.logData['pelvis'].velArray.push(this.bodyData.pelvis.vel.toFixed(5));
        }
        ////////////////////////////////////////////////////////

        //only update if test has started
        if(this.startedTest){
            this.root.update();
        }
    }
}

module.exports = freeAirTest;
