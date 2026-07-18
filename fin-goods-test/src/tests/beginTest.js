import BaseTest from "../test";
import Common from '../common';
var childProcess = require('child_process');
let Main = require('../app');
let projectRoot = require('../project-root');
let path = require('path');
let fs = require('fs');
let jibo = require('jibo');


/*
* Landing page for beginning of test
* */
class BeginTest extends BaseTest {

    constructor() {
        super();

        this.exiting = false;

        this.onRobot = false;
        /////////////////////////////

    }

    _getinformationrmation(hostIdentity){
        var hostname = hostIdentity;
        var curDate = new Date().toUTCString();
        //logging for simulator mode
        this.logKey = "robotInformation";
        this.logData = {};

        this.logData['information'] =     {'date': undefined,
                                         'serial_number': undefined,
                                         'name': undefined,
                                        'cpuid': undefined,
                                     'wifi_mac': undefined};

        if(hostname === "simulator"){
            this.logData['information'].serial_number = "hostname.serial_number";
            this.logData['information'].name = "hostname.name";
            this.logData['information'].cpuid = "hostname.cpuid";
            this.logData['information'].wifi_mac = "hostname.wifi_mac";
            //logging on the robot
        } else {
            if(hostname.serial_number){
                this.logData['information'].serial_number = hostname.serial_number;
            }
            else{
                this.logData['information'].serial_number = hostname.guid;
            }
            this.logData['information'].name = hostname.name;
            this.logData['information'].cpuid = hostname.cpuid;
            this.logData['information'].wifi_mac = hostname.wifi_mac;
        }
        this.logData['information'].date = curDate;

        this.writePersistentData();
    }

    enter() {

        jibo.system.index(() => {
            Common._showButton('center-button', '450px', '400px', () => {

                this._measureValues(this.onRobot);

                this.logKey = "beginTest";
                this.logData = {};
                this.logData['time'] = { "duration": undefined};

                this.curTime = new Date().getTime();
                this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
                //start next test
                this.writePersistentData();

                Main.startNextTest();
            }, 'BEGIN TEST');
            Common._clearButtonFromScreen(['next-button','back-button','neck-button',
                                          'torso-button','pelvis-button']);
            //Listening to API
            this.testAPI( (result) => {
                this.axisData = result;
            });
          });
        //remove log file if it exists
        if(fs.existsSync(path.resolve(projectRoot.get(), 'styles/'+'finGoodsSkill.log'))){
            let logPath = path.resolve(projectRoot.get(),'styles/'+'finGoodsSkill.log')
            childProcess.execSync('rm ' + logPath);
        }

        Common.centerRobot();

        console.log('enter begin test');

        this.startTime = new Date().getTime();
        let idPath = '/var/jibo/identity.json';
        if (fs.existsSync(idPath)) {
            this.onRobot = true;
            this._getinformationrmation(require(idPath));
        } else{
            this._getinformationrmation("simulator");
        }

        let axisURI = "ws://localhost:8282";
        this.axisStateSocket = new WebSocket(axisURI + "/axis_state");
        // this.axisCommandSocket = new WebSocket(axisURI + "/axis_command");
        Common.resetLED();

        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-275px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "50px";

        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "50px";
        temp2.style.marginRight = "50px";
        temp2.style.fontSize = "50px";

        Common._setScreenText("Jibo Finished Goods: Built in Test",
                                "Plug in Power Adapter and press BEGIN TEST to start");

    }

    //function to listen to Body Service axis state
    testAPI(cb){
        this.axisStateSocket.onmessage = function(event) {
            cb(JSON.parse(event.data));
        };
    }

    _measureValues(onRobot){
        this.logKey = "indexTest";
        this.logData = {};
        this.logData['result'] = {"passed": undefined};
        this.logData['indexStatus'] =  { "neckIndexStatus": undefined,
                                       "pelvisIndexStatus": undefined,
                                        "torsoIndexStatus": undefined};

        if (onRobot) {

            let tempNeck = this.axisData.neck.status & 0x01;
            let tempPelvis = this.axisData.pelvis.status & 0x01;
            let tempTorso = this.axisData.torso.status & 0x01;
            if( tempNeck && tempPelvis && tempTorso){
                console.log('indexed');
                this.logData['result'].passed = true;
            }
            else{
                console.log('failed');
                this.logData['result'].passed = false;
            }
            //logging for neck status
            console.log('robot');
            this.logData['indexStatus'].neckIndexStatus = tempNeck;
            this.logData['indexStatus'].pelvisIndexStatus = tempPelvis;
            this.logData['indexStatus'].torsoIndexStatus = tempTorso;
            //RUNNING IN SIMLATOR
        } else {
            //if simulator, mark index and thermistor as true
            this.logData['indexResult'].passed = true;
            this.logData['indexStatus'].neckIndexStatus = "tempNeck";
            this.logData['indexStatus'].pelvisIndexStatus = "tempPelvis";
            this.logData['indexStatus'].torsoIndexStatus = "tempTorso";
        }
        //log index values
        this.writePersistentData();
    }

    exit() {
        this.exiting = true;
        console.log('exit begin-test');
        //clear all variables
        Common._setScreenText("");
        Common._clearButtonFromScreen(['next-button', 'center-button']);

        this.axisStateSocket.close();
    }

    update() {
        if(this.exiting){
            return;
        }
    }
}

module.exports = BeginTest;
