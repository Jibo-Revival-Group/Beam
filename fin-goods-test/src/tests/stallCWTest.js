import BaseTest from "../test";
import Common from '../common';
let projectRoot = require('../project-root');
const path = require('path');
let jibo = require('jibo');
let Main = require('../app');
import bts from '../bts';

/*
* stall CW test
* */
var audioContext = new AudioContext();
var buffer = null;

let neckPassButton = document.getElementById('success-button');
let neckFailButton = document.getElementById('failure-button');
let torsoPassButton = document.getElementById('success-button-2');
let torsoFailButton = document.getElementById('failure-button-2');
let pelvisPassButton = document.getElementById('success-button-3');
let pelvisFailButton = document.getElementById('failure-button-3');

class StallCWTest extends BaseTest {

    constructor() {
        super();

        this.initializeAudio("/audio/FX_Bleep.mp3");

        this.startedTest = false;
        this.velThresh = .25
        this.playSound = [true,true,true];

        this.bodyData = "";
        /////////////////////
        this.logKey = "stallCWTest";
        this.logData = {};
        this.logData['neck'] = {"curArray":[], "velArray":[]};
        this.logData['torso'] = {"curArray":[], "velArray":[]};
        this.logData['pelvis'] = {"curArray":[], "velArray":[]};
        this.logData['time'] = {"testDuration": undefined};
        this.logData['result'] = {"stallCWTestNeckObservation": undefined,
                                "stallCWTestTorsoObservation": undefined,
                                "stallCWTestPelvisObservation": undefined};

        this.logData['faults'] = {"stallCWTestNeckFault": undefined,
                                  "stallCWTestTorsoFault": undefined,
                                  "stallCWTestPelvisFault": undefined}
    }

    _warmUp(){
        console.log("body warmup");
        this.root = jibo.bt.create( bts['WarmUpMovements']);
        this.root.start();
        if(!this.startedTest){
            this.startedTest = true;
        }
    }

    enter() {
        Common.centerRobot();

        console.log("enter stall CW test");

        this.startTime = new Date().getTime();
        this.logData['result'].stallCWTestNeckObservation = false;
        this.logData['result'].stallCWTestTorsoObservation = false;
        this.logData['result'].stallCWTestPelvisObservation = false;
        this.axisSocket = new WebSocket("ws://localhost:8282/axis_state");

        this._warmUp();

        //neck spin
        Common._showButton('neck-button', "900px", "250px", () => {
            this.playSound[0] = true;
            this._setSpinLogic(true, 'neck');
        });
        //torso spin
        Common._showButton('torso-button', "900px", "400px", () => {
            this.playSound[1] = true;
            this._setSpinLogic(true, 'torso');
        });
        //pelvis spin
        Common._showButton('pelvis-button', "900px", "550px", () => {
            this.playSound[2] = true;
            this._setSpinLogic(true, 'pelvis');
        });

        //neck pass
        Common._showButton('success-button', "600px", "250px", () => {
            Common._setPassFailButtons(neckPassButton, neckFailButton, "success");
            this.logData['result'].stallCWTestNeckObservation = true;
        });
        //neck fail
        Common._showButton('failure-button', "300px", "250px", () => {
            Common._setPassFailButtons(neckPassButton, neckFailButton, "failure");
            this.logData['result'].stallCWTestNeckObservation = false;
        });
        //torso pass
        Common._showButton('success-button-2', "600px", "400px", () => {
            Common._setPassFailButtons(torsoPassButton, torsoFailButton, "success");
            this.logData['result'].stallCWTestTorsoObservation = true;
        });
        //torso fail
        Common._showButton('failure-button-2', "300px", "400px", () => {
            Common._setPassFailButtons(torsoPassButton, torsoFailButton, "failure");
            this.logData['result'].stallCWTestTorsoObservation = false;
        });
        //pelvis pass
        Common._showButton('success-button-3', "600px", "550px", () => {
            Common._setPassFailButtons(pelvisPassButton, pelvisFailButton, "success");
            this.logData['result'].stallCWTestPelvisObservation = true;
        });
        //pelvis fail
        Common._showButton('failure-button-3', "300px", "550px", () => {
            Common._setPassFailButtons(pelvisPassButton, pelvisFailButton, "failure");
            this.logData['result'].stallCWTestPelvisObservation = false;
        });

        Common._showButton('next-button', '100px', '300px', () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            if(this.bodyData){
                this.logData['faults'].stallCWTestNeckFault = (this.bodyData.neck.fault_status);
                this.logData['faults'].stallCWTestTorsoFault = (this.bodyData.torso.fault_status);
                this.logData['faults'].stallCWTestPelvisFault = (this.bodyData.pelvis.fault_status);
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
        temp3.style.marginTop = "20px";
        temp3.style.marginRight = "50px";
        temp3.style.fontSize = "40px";

        let temp4 = document.getElementById('test-label4');
        temp4.style.marginTop = "20px";
        temp4.style.marginRight = "50px";
        temp4.style.fontSize = "40px";

        Common._setScreenText("TEST 7: STALL DETECTION CLOCKWISE",
                            "Select a segment to test.  Grab and hold segment until",
                            "you hear a tone.  Choose FAIL if segment does not",
                            "behave normally.");

        //collect callback of bodyData
        this.testAPI( (response) => {
            this.bodyData = response;
        });
    }

    initializeAudio(audioStr){
        this.bufferSource = null;
        let request = new XMLHttpRequest();
        let url = path.normalize(global.__dirname + audioStr);
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            // Decode asynchronously
            audioContext.decodeAudioData(request.response, function(_buffer) {
                buffer = _buffer;
            });
        }
        request.send();
    }

    //API to collect body data and parse
    testAPI(cb){
        this.axisSocket.onmessage = function(event){
            cb(JSON.parse(event.data));
        };
    }

    exit() {
        console.log("exit stall CW test");
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
        if(this.root){
            this.root.stop();
            this.root = null;
        }
        this.root = jibo.bt.create( bts[body + '-spin-360-' + "CW"]);
        this.root.start();
        //indicate test has started to allow root updating
        if(!this.startedTest){
            this.startedTest = true;
        }
    }

    _playSoundAndLog(index){
        if(this.playSound[index]){
            this._stop();
            this._play();
            this.playSound[index] = false;
        }
    }

    _stop(){
        if (!this.bufferSource) {
            return;
        }
        this.bufferSource.disconnect();
        this.bufferSource = null;
    }

    _play(){
        if (!buffer) {
            console.log("Audio buffer not loaded yet...")
            return;
        }
        this.bufferSource = audioContext.createBufferSource();
        this.bufferSource.buffer = buffer;
        this.bufferSource.connect(audioContext.destination);
        this.bufferSource.start(0);
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

        if(this.bodyData){
            if(this.bodyData.neck.fault_status & 0x02){
                if(this.playSound[0]){
                    this._playSoundAndLog(0);
                    this.playSound[0] = false;
                }
            }
            if(this.bodyData.torso.fault_status & 0x02){
                if(this.playSound[1]){
                    this._playSoundAndLog(1);
                    this.playSound[1] = false;
                }
            }
            if(this.bodyData.pelvis.fault_status & 0x02){
                if(this.playSound[2]){
                    this._playSoundAndLog(2);
                    this.playSound[2] = false;

                }
            }
        }

        ////////////////////////////////////////////////////////

        //only update if test has started
        if(this.startedTest){
            this.root.update();
        }
    }
}

module.exports = StallCWTest;
