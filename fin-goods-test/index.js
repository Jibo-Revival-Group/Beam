(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.finGoodsTest = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
// our runtime
var jibo = require('jibo'), projectRoot = require('./project-root'), currentTest = undefined, intervalId = undefined, testClasses = [
    require('./tests/beginTest'),
    require('./tests/centerTest'),
    require('./tests/touchscreenTest'),
    require('./tests/displayTest'),
    require('./tests/headTouchTest'),
    require('./tests/ledTest'),
    require('./tests/freeAirTest'),
    require('./tests/stallCWTest'),
    require('./tests/stallCCWTest'),
    require('./tests/fullBodyTest'),
    require('./tests/batteryTest')
];
let testIndex = -1;
/**
* Entry point for diagnostic app
**/
function start() {
    testIndex = -1;
    startNextTest();
}
exports.start = start;
/**
 * Start a specific test (shutting down existing test if applicable)
 **/
function startNextTest() {
    // exit old test
    stopCurrentTest();
    ++testIndex;
    if (testIndex >= testClasses.length)
        return;
    //wait a bit to clear any touch events, just to be safe
    setTimeout(() => {
        // create new test
        currentTest = new testClasses[testIndex]();
        // enter new test
        if (currentTest) {
            currentTest.readPersistentData();
            currentTest.enter();
            intervalId = setInterval(function () {
                if (currentTest) {
                    currentTest.update();
                }
            }, 33);
        }
    }, 15);
}
exports.startNextTest = startNextTest;
/**
 * Stop the current test
 **/
function stopCurrentTest() {
    // exit current test
    if (currentTest) {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
        currentTest.writePersistentData();
        currentTest.exit();
    }
}
exports.stopCurrentTest = stopCurrentTest;
/**
 * Optionally handle a user tapping or mouse-clicking on the screen
 **/
function clickScreen() {
    if (currentTest !== undefined) {
        currentTest.click();
    }
}
exports.clickScreen = clickScreen;
jibo.init(() => {
    projectRoot.init(function () {
        start();
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};

},{"./project-root":24,"./tests/batteryTest":26,"./tests/beginTest":27,"./tests/centerTest":28,"./tests/displayTest":29,"./tests/freeAirTest":30,"./tests/fullBodyTest":31,"./tests/headTouchTest":32,"./tests/ledTest":33,"./tests/stallCCWTest":34,"./tests/stallCWTest":35,"./tests/touchscreenTest":36,"jibo":undefined}],2:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['5f1e2143-a1ff-4c4d-a55e-b8d162efdaf3'],
            'options': {}
        },
        'meta': { 'version': 1 },
        '5f1e2143-a1ff-4c4d-a55e-b8d162efdaf3': function () {
            return {
                'id': '5f1e2143-a1ff-4c4d-a55e-b8d162efdaf3',
                'name': 'Warm up for Animation',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'bodyWarmup.keys',
                    'config': animation => {
                    }
                }
            };
        }
    };
};
},{}],3:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [
                12,
                2,
                26,
                23,
                36
            ],
            'decorators': [],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ListenEmbedded',
                'options': {
                    'rule': 'hey_jibo',
                    'onResult': () => {
                        let options = {
                            returnSpeakers: false,
                            timeout: 6000
                        };
                        return options;
                    },
                    'undefined': listener => {
                        listener.on('hey-jibo', (asrResult, speakerIds) => {
                            notepad.speechResult = true;
                            blackboard.setLabel('heard you say hey jibo');
                        });
                    }
                }
            };
        },
        '12': function () {
            return {
                'id': '12',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        blackboard.setLabel('Say hey jibo');
                        notepad.speechResult = false;
                    }
                }
            };
        },
        '23': function () {
            return {
                'id': '23',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        blackboard.setLabel('Now say whatever you want');
                        notepad.textIndependent = false;
                    }
                }
            };
        },
        '26': function () {
            return {
                'id': '26',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 1000;
                    }
                }
            };
        },
        '27': function () {
            return {
                'id': '27',
                'parent': 29,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'decorators': [28],
                'options': {
                    'exec': () => {
                        blackboard.setLabel('didn\'t hear anything for text-independent speech');
                    }
                }
            };
        },
        '28': function () {
            return {
                'id': '28',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': () => {
                        return !notepad.NLresult;
                    }
                }
            };
        },
        '29': {
            'id': '29',
            'parent': 36,
            'asset-pack': 'core',
            'class': 'Switch',
            'children': [
                27,
                38
            ],
            'options': {}
        },
        '36': {
            'id': '36',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                39,
                29
            ],
            'decorators': [37],
            'options': {}
        },
        '37': function () {
            return {
                'id': '37',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return true;
                    }
                }
            };
        },
        '38': function () {
            return {
                'id': '38',
                'parent': 29,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        notepad.NLresult = false;
                    }
                }
            };
        },
        '39': function () {
            return {
                'id': '39',
                'parent': 36,
                'asset-pack': 'core',
                'class': 'ListenJs',
                'options': {
                    'getOptions': () => {
                        let options = {
                            heyJibo: false,
                            detectEnd: false,
                            returnSpeakers: false,
                            incremental: true,
                            timeout: 6000,
                            bargein: false,
                            speakerName: ''
                        };
                        return options;
                    },
                    'getRule': callback => {
                        callback('TopGrammar = $* Hello World $*;');
                    },
                    'onResult': listener => {
                        listener.on('cloud', (asrResult, speakerIds) => {
                            blackboard.setLabel(asrResult.Input);
                            notepad.NLresult = true;
                        });
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [
                5,
                6
            ],
            'decorators': [],
            'options': {}
        },
        '5': function () {
            return {
                'id': '5',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        notepad.position = {
                            x: 0.5,
                            y: 0.1,
                            z: 0.3
                        };
                    }
                }
            };
        },
        '6': {
            'id': '6',
            'parent': 1,
            'class': 'Sequence',
            'children': [
                7,
                9
            ],
            'decorators': [8],
            'options': {}
        },
        '7': function () {
            return {
                'id': '7',
                'name': 'follow my voice',
                'parent': 6,
                'asset-pack': 'core',
                'class': 'LookAt',
                'options': {
                    'getTarget': () => {
                        let jibo = require('jibo');
                        let entity = jibo.lps.getClosestAudibleEntity();
                        let valid = entity !== undefined && entity.confidence >= 0.6;
                        if (valid) {
                            let pos = entity.position;
                            pos = new jibo.animate.THREE.Vector3(pos.x, pos.y, pos.z);
                            pos.normalize();
                            let newZ = pos.z;
                            if (newZ > 0.5) {
                                newZ = 0.5;
                            }
                            if (newZ < 0.2) {
                                newZ = 0.2;
                            }
                            notepad.position = {
                                x: pos.x,
                                y: pos.y,
                                z: newZ
                            };
                            document.getElementById('test-label').innerHTML = `Heard you with ${ entity.confidence } at ${ notepad.position.x.toPrecision(3) }, ${ notepad.position.y.toPrecision(3) }, ${ notepad.position.z.toPrecision(3) }`;
                            return notepad.position;
                        } else {
                            let confid = undefined;
                            if (entity) {
                                confid = entity.confidence;
                            }
                            document.getElementById('test-label').innerHTML = `Conf=${ confid } Can't hear you :(`;
                            return notepad.position;
                        }
                    }
                }
            };
        },
        '8': function () {
            return {
                'id': '8',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return true;
                    }
                }
            };
        },
        '9': function () {
            return {
                'id': '9',
                'name': 'wait a bit',
                'parent': 6,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 1000 + 1000 * Math.random();
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{"jibo":undefined}],5:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [
                5,
                2,
                3,
                4,
                7,
                6
            ],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'name': 'head cycle',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'spin_head.keys',
                    'config': animation => {
                        animation.setSpeed(notepad.animSpeed);
                    }
                }
            };
        },
        '3': function () {
            return {
                'id': '3',
                'name': 'torso cycle',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'spin_torso.keys',
                    'config': animation => {
                        animation.setSpeed(notepad.animSpeed);
                    }
                }
            };
        },
        '4': function () {
            return {
                'id': '4',
                'name': 'pelvis cycle',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'spin_pelvis.keys',
                    'config': animation => {
                        animation.setSpeed(notepad.animSpeed);
                    }
                }
            };
        },
        '5': function () {
            return {
                'id': '5',
                'name': 'get random anim speed',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        notepad.animSpeed = parseFloat(Math.random() * (0.75 - 0.6) + 0.6).toFixed(2);
                        document.getElementById('test-label3').innerHTML = 'anim speed: ' + notepad.animSpeed * 100 + '%';
                    }
                }
            };
        },
        '6': function () {
            return {
                'id': '6',
                'name': 'rest for 30 secs',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        document.getElementById('test-label3').innerHTML = 'resting for 5 secs';
                        return 5000;
                    }
                }
            };
        },
        '7': function () {
            return {
                'id': '7',
                'name': 'twist everything',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'twist.keys',
                    'config': animation => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['5efb4987-d484-4d58-bc50-a2ababd8cb8e'],
            'options': {}
        },
        'meta': { 'version': 1 },
        '5efb4987-d484-4d58-bc50-a2ababd8cb8e': function () {
            return {
                'id': '5efb4987-d484-4d58-bc50-a2ababd8cb8e',
                'name': 'Full body animation of all 3 axes',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'fullBodySpin.keys',
                    'config': animation => {
                    }
                }
            };
        }
    };
};
},{}],7:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['ed8f7d90-1489-47bc-8459-b412c5c03aa1'],
            'options': {}
        },
        'meta': { 'version': 1 },
        'ed8f7d90-1489-47bc-8459-b412c5c03aa1': function () {
            return {
                'id': 'ed8f7d90-1489-47bc-8459-b412c5c03aa1',
                'name': 'Spin head and pelvis opposite directions 360 degrees',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'led-test-animation.keys',
                    'config': animation => {
                    }
                }
            };
        }
    };
};
},{}],8:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '3': {
            'id': '3',
            'asset-pack': 'core',
            'class': 'Parallel',
            'children': [
                19,
                16
            ],
            'decorators': [],
            'options': { 'succeedOnOne': false }
        },
        '16': {
            'id': '16',
            'parent': 3,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                18,
                17
            ],
            'decorators': [23],
            'options': {}
        },
        '17': function () {
            return {
                'id': '17',
                'name': 'Choose place to look',
                'parent': 16,
                'asset-pack': 'core',
                'class': 'LookAt',
                'options': {
                    'getTarget': () => {
                        let x = 1;
                        let y = 1 - 2 * Math.random();
                        let z = 0.7 + 0.5 * (1 - 2 * Math.random());
                        return {
                            x: x,
                            y: y,
                            z: z
                        };
                    }
                }
            };
        },
        '18': function () {
            return {
                'id': '18',
                'name': 'Pause for a bit',
                'parent': 16,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 1000 + 2000 * Math.random();
                    }
                }
            };
        },
        '19': {
            'id': '19',
            'parent': 3,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                21,
                20
            ],
            'decorators': [22],
            'options': {}
        },
        '20': {
            'id': '20',
            'parent': 19,
            'asset-pack': 'core',
            'class': 'Blink',
            'options': {}
        },
        '21': function () {
            return {
                'id': '21',
                'name': 'Pause for a bit',
                'parent': 19,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 2000 + 2500 * Math.random();
                    }
                }
            };
        },
        '22': function () {
            return {
                'id': '22',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return true;
                    }
                }
            };
        },
        '23': function () {
            return {
                'id': '23',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return true;
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],9:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'name': 'sequence of blinks and lookAts that will run an idle for ~4 mins',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                5,
                7
            ],
            'options': {}
        },
        '3': {
            'id': '3',
            'name': 'look at random spots',
            'parent': 7,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                8,
                134
            ],
            'decorators': [4],
            'options': {}
        },
        '4': function () {
            return {
                'id': '4',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return notepad.running;
                    }
                }
            };
        },
        '5': function () {
            return {
                'id': '5',
                'name': 'initialize our variables',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        notepad.running = true;
                        notepad.resting = false;
                        notepad.cycleLength = 240;
                        notepad.hrStart = process.hrtime();
                        notepad.hrRestStart = 0;
                    }
                }
            };
        },
        '7': {
            'id': '7',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Parallel',
            'children': [
                38,
                21,
                10,
                23,
                3
            ],
            'options': { 'succeedOnOne': false }
        },
        '8': function () {
            return {
                'id': '8',
                'parent': 3,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 1500 + 1500 * Math.random();
                    }
                }
            };
        },
        '10': {
            'id': '10',
            'name': 'blink randomly',
            'parent': 7,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                15,
                16
            ],
            'decorators': [11],
            'options': {}
        },
        '11': function () {
            return {
                'id': '11',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return notepad.running;
                    }
                }
            };
        },
        '15': function () {
            return {
                'id': '15',
                'parent': 10,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 2000 + 1500 * Math.random();
                    }
                }
            };
        },
        '16': {
            'id': '16',
            'parent': 10,
            'asset-pack': 'core',
            'class': 'Blink',
            'options': {}
        },
        '17': function () {
            return {
                'id': '17',
                'parent': 134,
                'asset-pack': 'core',
                'class': 'LookAt',
                'options': {
                    'getTarget': () => {
                        let x = 1 - 2 * Math.random();
                        let y = 1 - 2 * Math.random();
                        let z = 0.7 + 0.5 * (1 - 2 * Math.random());
                        return {
                            x: x,
                            y: y,
                            z: z
                        };
                    }
                }
            };
        },
        '18': function () {
            return {
                'id': '18',
                'parent': 21,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'decorators': [],
                'options': {
                    'exec': () => {
                        let timeDiff = process.hrtime(notepad.hrStart);
                        document.getElementById('test-label3').innerHTML = 'animating time: ' + timeDiff[0] + 's';
                        if (timeDiff[0] >= notepad.cycleLength) {
                            notepad.running = false;
                        }
                    }
                }
            };
        },
        '21': {
            'id': '21',
            'name': 'update timer',
            'parent': 7,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [18],
            'decorators': [22],
            'options': {}
        },
        '22': function () {
            return {
                'id': '22',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return notepad.running;
                    }
                }
            };
        },
        '23': {
            'id': '23',
            'name': 'color LED randomly',
            'parent': 7,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                28,
                29
            ],
            'decorators': [24],
            'options': {}
        },
        '24': function () {
            return {
                'id': '24',
                'parent': 13,
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return notepad.running;
                    }
                }
            };
        },
        '28': function () {
            return {
                'id': '28',
                'parent': 23,
                'asset-pack': 'core',
                'class': 'TimeoutJs',
                'options': {
                    'getTime': () => {
                        return 1000 + 1000 * Math.random();
                    }
                }
            };
        },
        '29': function () {
            return {
                'id': '29',
                'parent': 23,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        let r = Math.floor(Math.random() * 256) / 255;
                        let g = Math.floor(Math.random() * 256) / 255;
                        let b = Math.floor(Math.random() * 256) / 255;
                        jibo.animate.setLEDColor([
                            r,
                            g,
                            b
                        ]);
                    }
                }
            };
        },
        '38': {
            'id': '38',
            'name': 'resting',
            'parent': 7,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                118,
                68
            ],
            'decorators': [67],
            'options': {}
        },
        '67': function () {
            return {
                'id': '67',
                'asset-pack': 'core',
                'class': 'StartOnCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return !notepad.running && !notepad.resting;
                    }
                }
            };
        },
        '68': function () {
            return {
                'id': '68',
                'parent': 38,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'decorators': [119],
                'options': {
                    'exec': () => {
                        let restTimeDiff = process.hrtime(notepad.hrRestStart);
                        document.getElementById('test-label3').innerHTML = 'resting time: ' + restTimeDiff[0] + 's';
                        if (restTimeDiff[0] >= notepad.cycleLength) {
                            notepad.resting = false;
                        }
                    }
                }
            };
        },
        '118': function () {
            return {
                'id': '118',
                'parent': 38,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': () => {
                        notepad.resting = true;
                        notepad.hrRestStart = process.hrtime();
                    }
                }
            };
        },
        '119': function () {
            return {
                'id': '119',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': () => {
                    },
                    'conditional': () => {
                        return notepad.resting;
                    }
                }
            };
        },
        '120': {
            'id': '120',
            'parent': 128,
            'asset-pack': 'core',
            'class': 'PlayAudio',
            'options': { 'audioPath': 'FX_Bleep.mp3' }
        },
        '124': {
            'id': '124',
            'parent': 128,
            'asset-pack': 'core',
            'class': 'PlayAudio',
            'options': { 'audioPath': 'FX_Blip.mp3' }
        },
        '128': {
            'id': '128',
            'parent': 134,
            'asset-pack': 'core',
            'class': 'Random',
            'children': [
                124,
                129,
                120
            ],
            'options': {}
        },
        '129': {
            'id': '129',
            'parent': 128,
            'asset-pack': 'core',
            'class': 'PlayAudio',
            'options': { 'audioPath': 'FX_Bloop.mp3' }
        },
        '134': {
            'id': '134',
            'parent': 3,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                128,
                17
            ],
            'options': {}
        },
        'meta': { 'version': 1 }
    };
};
},{}],10:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [
                4,
                6
            ],
            'decorators': [],
            'options': {}
        },
        '4': function () {
            return {
                'id': '4',
                'name': 'Play a greeting',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'greeting.keys',
                    'config': animation => {
                    }
                }
            };
        },
        '6': {
            'id': '6',
            'name': 'Bawhoop',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'PlayAudio',
            'options': { 'audioPath': 'FX_Bawhoop.mp3' }
        },
        'meta': { 'version': 1 }
    };
};
},{}],11:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [2],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'name': 'Spin neck 360 degrees CCW',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'neck360CCW.keys',
                    'config': animation => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],12:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [2],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'name': 'Spin neck 360 degrees CW',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'neck360CW.keys',
                    'config': animation => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],13:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['e483e04b-ca55-435c-9c69-554b5f41702f'],
            'options': {}
        },
        'meta': { 'version': 1 },
        'e483e04b-ca55-435c-9c69-554b5f41702f': function () {
            return {
                'id': 'e483e04b-ca55-435c-9c69-554b5f41702f',
                'name': 'Spin neck 360 degrees both ways',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'neck360Both.keys',
                    'config': animation => {
                    }
                }
            };
        }
    };
};
},{}],14:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [2],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'name': 'Spin pelvis 360 degrees CCW',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'pelvis360CCW.keys',
                    'config': animation => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],15:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [2],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'name': 'Spin pelvis 360 degrees CW',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'pelvis360CW.keys',
                    'config': animation => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],16:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['68c6530e-38a2-484e-bc3d-b199fb16b825'],
            'options': {}
        },
        'meta': { 'version': 1 },
        '68c6530e-38a2-484e-bc3d-b199fb16b825': function () {
            return {
                'id': '68c6530e-38a2-484e-bc3d-b199fb16b825',
                'name': 'Spin pelvis 360 degrees both ways',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'pelvis360Both.keys',
                    'config': animation => {
                    }
                }
            };
        }
    };
};
},{}],17:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [2],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'name': 'Spin torso 360 degrees CCW',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'torso360CCW.keys',
                    'config': animation => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],18:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [2],
            'options': {}
        },
        '2': function () {
            return {
                'id': '2',
                'name': 'Spin torso 360 degrees CW',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'torso360CW.keys',
                    'config': animation => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{}],19:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': ['ad03cf77-8f2c-4b6d-9bbe-9129e1cc01d2'],
            'options': {}
        },
        'meta': { 'version': 1 },
        'ad03cf77-8f2c-4b6d-9bbe-9129e1cc01d2': function () {
            return {
                'id': 'ad03cf77-8f2c-4b6d-9bbe-9129e1cc01d2',
                'name': 'Spin torso 360 degrees both ways',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'PlayAnimation',
                'options': {
                    'animPath': 'torso360Both.keys',
                    'config': animation => {
                    }
                }
            };
        }
    };
};
},{}],20:[function(require,module,exports){
'use strict';
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'class': 'Sequence',
            'children': [11],
            'decorators': [],
            'options': {}
        },
        '11': function () {
            return {
                'id': '11',
                'name': 'follow me with a continuous look at!',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'LookAt',
                'options': {
                    'getTarget': () => {
                        let jibo = require('jibo');
                        let entity = jibo.lps.getClosestVisualEntity();
                        let position = {
                            x: 0.5,
                            y: 0.1,
                            z: 0.4
                        };
                        if (entity && entity.parts.length > 0) {
                            let raysData = entity.parts[0].value.rays;
                            if (raysData !== undefined && raysData.length > 0) {
                                document.getElementById('test-label').innerHTML = 'Found you :)';
                                let origin = entity.parts[0].value.rays[0].origin;
                                let dir = entity.parts[0].value.rays[0].dir;
                                position = {
                                    x: dir.x + origin.x,
                                    y: dir.y + origin.y,
                                    z: dir.z + origin.z
                                };
                                document.getElementById('test-label').innerHTML = `Found you at ${ position.x.toPrecision(3) }, ${ position.y.toPrecision(3) }, ${ position.z.toPrecision(3) }`;
                            }
                        } else {
                            document.getElementById('test-label').innerHTML = 'Lost you :(';
                        }
                        return position;
                    },
                    'isContinuous': true,
                    'config': lookAt => {
                    }
                }
            };
        },
        'meta': { 'version': 1 }
    };
};
},{"jibo":undefined}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    "asr-test": require('./behaviors/asr-test'),
    "audio-tracking": require('./behaviors/audio-tracking'),
    "body": require('./behaviors/body'),
    "fullBodyAnimation": require('./behaviors/fullBodyAnimation'),
    "head-CCW-pelvis-CW": require('./behaviors/head-CCW-pelvis-CW'),
    "idle": require('./behaviors/idle'),
    "lifecycle": require('./behaviors/lifecycle'),
    "main": require('./behaviors/main'),
    "neck-spin-360-CW": require('./behaviors/neck-spin-360-CW'),
    "neck-spin-360-CCW": require('./behaviors/neck-spin-360-CCW'),
    "neck-spin-both": require('./behaviors/neck-spin-both'),
    "pelvis-spin-360-CCW": require('./behaviors/pelvis-spin-360-CCW'),
    "pelvis-spin-360-CW": require('./behaviors/pelvis-spin-360-CW'),
    "pelvis-spin-both": require('./behaviors/pelvis-spin-both'),
    "torso-spin-360-CCW": require('./behaviors/torso-spin-360-CCW'),
    "torso-spin-360-CW": require('./behaviors/torso-spin-360-CW'),
    "torso-spin-both": require('./behaviors/torso-spin-both'),
    "tracking": require('./behaviors/tracking'),
    "WarmUpMovements": require('./behaviors/WarmUpMovements')
};

},{"./behaviors/WarmUpMovements":2,"./behaviors/asr-test":3,"./behaviors/audio-tracking":4,"./behaviors/body":5,"./behaviors/fullBodyAnimation":6,"./behaviors/head-CCW-pelvis-CW":7,"./behaviors/idle":8,"./behaviors/lifecycle":9,"./behaviors/main":10,"./behaviors/neck-spin-360-CCW":11,"./behaviors/neck-spin-360-CW":12,"./behaviors/neck-spin-both":13,"./behaviors/pelvis-spin-360-CCW":14,"./behaviors/pelvis-spin-360-CW":15,"./behaviors/pelvis-spin-both":16,"./behaviors/torso-spin-360-CCW":17,"./behaviors/torso-spin-360-CW":18,"./behaviors/torso-spin-both":19,"./behaviors/tracking":20}],22:[function(require,module,exports){
"use strict";
let jibo = require('jibo');
function getListenerWrapper(callback) {
    return (ev) => {
        callback();
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return false;
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * Helper method to set robot to 0-position and clear out the LED
     **/
    centerRobot() {
        // index position
        let animUtils = jibo.animate.centerRobot();
        this.resetLED();
    },
    resetLED() {
        jibo.animate.setLEDColor([0, 0, 0]);
    },
    setLED(rbgArray) {
        jibo.animate.setLEDColor(rbgArray);
    },
    //function to neatly set test label 1,2,3 text
    _setScreenText(mess1, mess2 = "", mess3 = "", mess4 = "") {
        document.getElementById('test-label1').innerHTML = mess1;
        document.getElementById('test-label2').innerHTML = mess2;
        document.getElementById('test-label3').innerHTML = mess3;
        document.getElementById('test-label4').innerHTML = mess4;
    },
    //remove a button from a screen quickly
    _clearButtonFromScreen(buttonArr) {
        for (var i = 0; i < buttonArr.length; i++) {
            if (buttonArr[i] != null) {
                let button = document.getElementById(buttonArr[i]);
                button.style.display = 'none';
                //clear listeners
                button.onmousedown = button.ontouchstart = null;
            }
        }
    },
    //set button on screen with location, touch callback, and optionally text
    _showButton(button, mR, mT, callback, content = null) {
        let temp = document.getElementById(button);
        temp.style.display = 'block';
        temp.style.marginRight = mR;
        temp.style.marginTop = mT;
        if (callback)
            temp.onmousedown = temp.ontouchstart = getListenerWrapper(callback);
        if (content != null)
            temp.innerHTML = content;
    },
    _addButtonListener(button, callback) {
        let temp = document.getElementById(button);
        temp.onmousedown = temp.ontouchstart = getListenerWrapper(callback);
    },
    _removeButtonListener(button) {
        let temp = document.getElementById(button);
        temp.onmousedown = temp.ontouchstart = null;
    },
    //function to neatly set background to test images or clear background
    _setShowBackground(show, source) {
        let bkg = document.getElementById('background');
        bkg.src = source;
        bkg.style.visibility = (show ? 'visible' : 'hidden');
    },
    _setPassFailButtons(pB, fB, mode) {
        pB.classList.remove('success', 'failure', 'clear');
        fB.classList.remove('success', 'failure', 'clear');
        //'success', 'failure', and 'clear' are all recognized classes in the CSS
        pB.classList.add(mode);
        fB.classList.add(mode);
    },
    _setBodySegIndex(body) {
        var index = -1;
        if (body == 'neck') {
            index = 0;
        }
        else if (body == 'torso') {
            index = 1;
        }
        else if (body == 'pelvis') {
            index = 2;
        }
        return index;
    }
};

},{"jibo":undefined}],23:[function(require,module,exports){
"use strict";
const Main = require('./app');
module.exports = Main;

},{"./app":1}],24:[function(require,module,exports){
var jibo = require('jibo'), projectRoot;
module.exports = {
    init(cb) {
        jibo.utils.PathUtils.getProjectRoot(function (_projectRoot) {
            projectRoot = _projectRoot;
            cb();
        });
    },
    get() {
        return projectRoot;
    }
};

},{"jibo":undefined}],25:[function(require,module,exports){
(function (global){
"use strict";
/**
 * Base class for all diagnostic tests
 */
let fs = require('fs');
let path = require('path');
// let Common = require('./common');
let statsPath = path.join(global.__dirname, "/styles/finGoodsSkill.log");
class BaseTest {
    constructor() {
        // log data
        this.logKey = undefined;
        this.logData = undefined;
    }
    // Required (start test)
    enter() {
        throw "Implement enter";
    }
    // Required (do your clean up here)
    exit() {
        throw "Implement exit";
    }
    // Optionally do stuff in an update interval
    update() {
        // throw "Implement update";
    }
    // Optionally handle a user tapping or mouse-clicking the screen
    click() {
    }
    // logging stuff...
    //
    // attempt to read persistent data if logKey is defined; this is automatically called *before* enter!
    readPersistentData() {
        if (!this.logKey || (!fs.existsSync(statsPath))) {
            return; // nothing to read
        }
        try {
            // Load stats file
            let data = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
            if (data.hasOwnProperty(this.logKey)) {
                this.logData = data[this.logKey];
            }
        }
        catch (error) {
            console.log("\nError parsing \"" + statsPath + "\". " + error + "\n");
        }
    }
    // write out the persistent data if logKey is defined; this is automatically called *before* exit
    writePersistentData() {
        if (!this.logKey) {
            return; // nothing flagged to write anything
        }
        let data = {};
        if (fs.existsSync(statsPath)) {
            // read in old one first
            data = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        }
        data[this.logKey] = ((this.logData !== undefined) ? this.logData : {});
        try {
            fs.writeFileSync(statsPath, JSON.stringify(data, null, '    '), 'utf8');
        }
        catch (error) {
            console.log("\nError writing \"" + statsPath + "\". " + error + "\n");
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseTest;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"fs":undefined,"path":undefined}],26:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
const jibo = require('jibo');
var fs = require('fs');
/*
* Test battery voltage
* */
// let centerButton = document.getElementById('center-button');
// let nextButton = document.getElementById('next-button');
class BatteryTest extends test_1.default {
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
        this.logData['measurement'] = { "batteryVoltage": undefined,
            "adapterVoltage": undefined,
            "chargeCurrent": undefined };
        this.logData['result'] = { "batteryVoltage": false,
            "adapterVoltage": false };
    }
    enter() {
        common_1.default.centerRobot();
        console.log('enter battery test');
        this.startTime = new Date().getTime();
        this._skillList((response) => {
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
        common_1.default._setScreenText("TEST 10: BATTERY VOLTAGE", "", "", "Step 1. Remove Power Adapter");
        // "Adapter in: " + jibo.system.isBatteryCharging(),
        // "Voltage: " + jibo.system.getSystemVoltage());
    }
    _skillList(cb) {
        console.log('SKILL LIST');
        var request = new XMLHttpRequest();
        request.open("GET", "http://localhost:8585/skill/list", true);
        // var _this = this;
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var list = JSON.parse(request.responseText);
                // console.log(list);
                cb(list);
            }
        };
        request.send();
    }
    _isFinTestRunning() {
        console.log('RUNNING');
        if (this.gotSkillList > 0 && this.skillList != undefined) {
            for (var i = 0; i < this.skillList.skills.length; i++) {
                if (this.skillList.skills[i].name.includes("fin-goods-test")) {
                    this.isSkillRunning = this.skillList.skills[i].running;
                }
            }
            this.gotSkillList--;
        }
    }
    _POWEROFF() {
        console.log('POWEROFF');
        var running_on_robot = false;
        if (fs.existsSync('/var/jibo/identity.json')) {
            if (this.isSkillRunning) {
                console.log('stopping skill');
                var body = { "command": "fin-goods-test" };
                var request = new XMLHttpRequest();
                request.open("POST", "http://localhost:8779/terminate", true);
                body = JSON.stringify(body);
                request.send(body);
            }
            else {
                common_1.default._setScreenText("Skill not running through system manager", "Please shut down skill manually!");
                return;
            }
        }
    }
    _generateLog() {
        if (this.generatedLogs) {
            return;
        }
        this.rawLogFile = JSON.parse(fs.readFileSync('styles/finGoodsSkill.log'));
        console.log('generate logs');
        this.logKey = "testResults";
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
        let test0_0 = 0;
        let test0_1 = 0;
        let test0_2 = 0;
        let test1 = 0;
        let test2 = 0;
        let test3 = 0;
        let test4 = 0;
        let test5 = 0;
        let test6_1 = 0;
        let test6_2 = 0;
        let test6_3 = 0;
        let test6_4 = 0;
        let test6_5 = 0;
        let test6_6 = 0;
        let test7_1 = 0;
        let test7_2 = 0;
        let test7_3 = 0;
        let test7_4 = 0;
        let test7_5 = 0;
        let test7_6 = 0;
        let test8_1 = 0;
        let test8_2 = 0;
        let test8_3 = 0;
        let test8_4 = 0;
        let test8_5 = 0;
        let test8_6 = 0;
        let test9 = 0;
        let test10_1 = 0;
        let test10_2 = 0;
        let test10_3 = 0;
        if (this.rawLogFile['indexTest'] != undefined) {
            test0_0 = this.rawLogFile['indexTest'].indexStatus.neckIndexStatus;
            if (test0_0) {
                console.log('neckIndexStatus in beginning pass');
                this.passCount++;
                this.logData['result'].neckIndexStatus = true;
            }
            else {
                console.log('neckIndexStatus in beginning fail');
                this.failCount++;
                this.logData['result'].neckIndexStatus = false;
            }
            test0_1 = this.rawLogFile['indexTest'].indexStatus.torsoIndexStatus;
            if (test0_1) {
                console.log('torsoIndexStatus in beginning pass');
                this.passCount++;
                this.logData['result'].torsoIndexStatus = true;
            }
            else {
                console.log('torsoIndexStatus in beginning fail');
                this.failCount++;
                this.logData['result'].torsoIndexStatus = false;
            }
            test0_2 = this.rawLogFile['indexTest'].indexStatus.pelvisIndexStatus;
            if (test0_2) {
                console.log('pelvisIndexStatus in beginning pass');
                this.passCount++;
                this.logData['result'].pelvisIndexStatus = true;
            }
            else {
                console.log('pelvisIndexStatus in beginning fail');
                this.failCount++;
                this.logData['result'].pelvisIndexStatus = false;
            }
        }
        if (this.rawLogFile['centerTest'] != undefined) {
            test1 = this.rawLogFile['centerTest'].result.passed;
            if (test1) {
                console.log('centered pass');
                this.passCount++;
                this.logData['result'].centerTest = true;
            }
            else {
                console.log('centered fail');
                this.failCount++;
                this.logData['result'].centerTest = false;
            }
        }
        if (this.rawLogFile['touchscreenTest'] != undefined) {
            test2 = this.rawLogFile['touchscreenTest'].result.passed;
            if (test2) {
                console.log('toucscreen pass');
                this.passCount++;
                this.logData['result'].touchscreenTest = true;
            }
            else {
                console.log('toucscreen fail');
                this.failCount++;
                this.logData['result'].touchscreenTest = false;
            }
        }
        if (this.rawLogFile['displayTest'] != undefined) {
            test3 = this.rawLogFile['displayTest'].result.passed;
            if (test3) {
                console.log('display pass');
                this.passCount++;
                this.logData['result'].displayTest = true;
            }
            else {
                console.log('display fail');
                this.failCount++;
                this.logData['result'].displayTest = false;
            }
        }
        if (this.rawLogFile['headTouchTest'] != undefined) {
            test4 = this.rawLogFile['headTouchTest'].result.passed;
            if (test4) {
                console.log('headTouchTest pass');
                this.passCount++;
                this.logData['result'].headTouchTest = true;
            }
            else {
                console.log('headTouchTest fail');
                this.failCount++;
                this.logData['result'].headTouchTest = false;
            }
        }
        if (this.rawLogFile['ledTest'] != undefined) {
            test5 = this.rawLogFile['ledTest'].result.passed;
            if (test5) {
                console.log('led pass');
                this.passCount++;
                this.logData['result'].ledTest = true;
            }
            else {
                console.log('led fail');
                this.failCount++;
                this.logData['result'].ledTest = false;
            }
        }
        if (this.rawLogFile['freeAirTest'] != undefined) {
            test6_1 = this.rawLogFile['freeAirTest'].result.freeAirTestNeckObservation;
            if (test6_1) {
                console.log('bodiesTestHead pass');
                this.passCount++;
                this.logData['result'].freeAirTestNeckObservation = true;
            }
            else {
                console.log('bodiesTestHead fail');
                this.failCount++;
                this.logData['result'].freeAirTestNeckObservation = false;
            }
            test6_2 = this.rawLogFile['freeAirTest'].result.freeAirTestTorsoObservation;
            if (test6_2) {
                console.log('bodiesTestTorso pass');
                this.passCount++;
                this.logData['result'].freeAirTestTorsoObservation = true;
            }
            else {
                console.log('bodiesTestTorso fail');
                this.failCount++;
                this.logData['result'].freeAirTestTorsoObservation = false;
            }
            test6_3 = this.rawLogFile['freeAirTest'].result.freeAirTestPelvisObservation;
            if (test6_3) {
                console.log('bodiesTestPelvis pass');
                this.passCount++;
                this.logData['result'].freeAirTestPelvisObservation = true;
            }
            else {
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
        if (this.rawLogFile['stallCWTest'] != undefined) {
            test7_1 = this.rawLogFile['stallCWTest'].result.stallCWTestNeckObservation;
            if (test7_1) {
                console.log('stallCWTestHead pass');
                this.passCount++;
                this.logData['result'].stallCWTestNeckObservation = true;
            }
            else {
                console.log('stallCWTestHead fail');
                this.failCount++;
                this.logData['result'].stallCWTestNeckObservation = false;
            }
            test7_2 = this.rawLogFile['stallCWTest'].result.stallCWTestTorsoObservation;
            if (test7_2) {
                console.log('stallCWTestTorso pass');
                this.passCount++;
                this.logData['result'].stallCWTestTorsoObservation = true;
            }
            else {
                console.log('stallCWTestTorso fail');
                this.failCount++;
                this.logData['result'].stallCWTestTorsoObservation = false;
            }
            test7_3 = this.rawLogFile['stallCWTest'].result.stallCWTestPelvisObservation;
            if (test7_3) {
                console.log('stallCWTestPelvis pass');
                this.passCount++;
                this.logData['result'].stallCWTestPelvisObservation = true;
            }
            else {
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
        if (this.rawLogFile['stallCCWTest'] != undefined) {
            test8_1 = this.rawLogFile['stallCCWTest'].result.stallCCWTestNeckObservation;
            if (test8_1) {
                console.log('stallCCWTestHead pass');
                this.passCount++;
                this.logData['result'].stallCCWTestNeckObservation = true;
            }
            else {
                console.log('stallCCWTestHead fail');
                this.failCount++;
                this.logData['result'].stallCCWTestNeckObservation = false;
            }
            test8_2 = this.rawLogFile['stallCCWTest'].result.stallCCWTestTorsoObservation;
            if (test8_2) {
                console.log('stallCCWTestPelvis pass');
                this.passCount++;
                this.logData['result'].stallCCWTestTorsoObservation = true;
            }
            else {
                console.log('stallCCWTestPelvis fail');
                this.failCount++;
                this.logData['result'].stallCCWTestTorsoObservation = false;
            }
            test8_3 = this.rawLogFile['stallCCWTest'].result.stallCCWTestPelvisObservation;
            if (test8_3) {
                console.log('stallCCWTestPelvis pass');
                this.passCount++;
                this.logData['result'].stallCCWTestPelvisObservation = true;
            }
            else {
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
        if (this.rawLogFile['fullBodyTest'] != undefined) {
            test9 = this.rawLogFile['fullBodyTest'].result.passed;
            if (test9) {
                console.log('fullBodyTest pass');
                this.passCount++;
                this.logData['result'].fullBodyTest = true;
            }
            else {
                console.log('fullBodyTest fail');
                this.failCount++;
                this.logData['result'].fullBodyTest = false;
            }
        }
        if (this.rawLogFile['batteryTest'] != undefined) {
            test10_1 = this.rawLogFile['batteryTest'].result.adapterVoltage;
            if (test10_1) {
                console.log('batteryTestpAdapt pass');
                this.passCount++;
                this.logData['result'].batteryTestAdapterVoltage = true;
            }
            else {
                console.log('batteryTestpAdapt fail');
                this.failCount++;
                this.logData['result'].batteryTestAdapterVoltage = false;
            }
            test10_2 = this.rawLogFile['batteryTest'].result.batteryVoltage;
            if (test10_2) {
                console.log('batteryTestBattery pass');
                this.passCount++;
                this.logData['result'].batteryTestBatteryVoltage = true;
            }
            else {
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
        this.logData['overallResult'] = { "overallPassFail": undefined,
            "overallPasses": undefined,
            "overallFails": undefined };
        this.logData['overallResult'].overallPasses = this.passCount;
        this.logData['overallResult'].overallFails = this.failCount;
        if (this.failCount == 0) {
            console.log('BiT passed');
            this.logData['overallResult'].overallPassFail = true;
        }
        else {
            this.logData['overallResult'].overallPassFail = false;
        }
        this.generatedLogs = true;
        this.writePersistentData();
    }
    exit() {
        this.exiting = true;
        console.log("exit battery test");
        common_1.default._setScreenText("");
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
        if (!this.pAdaptMeasured) {
            var pAdaptV = jibo.system.getSystemVoltage().toFixed(2);
            //check within acceptable range
            if (pAdaptV >= 16.2 && pAdaptV <= 19.8) {
                this.logData['result'].adapterVoltage = true;
                this.logData['measurement'].adapterVoltage = pAdaptV;
                console.log('passed step 1');
            }
            else {
                this.logData['result'].adapterVoltage = false;
                this.logData['measurement'].adapterVoltage = pAdaptV;
                console.log('failed step 1');
            }
            this.pAdaptMeasured = true;
        }
        //step 1, power adapter unplugged
        if (!jibo.system.pluggedIn && this.pAdaptMeasured) {
            this.powerAdapterUnplugged = true;
            if (this.updateCount) {
                this.updateCount--;
            }
            else {
                //after countdown, display plug in again
                this.plugAdapterAgain = true;
            }
            //countdown to allow time to log enough battery data
            common_1.default._setScreenText("TEST 10: BATTERY VOLTAGE", "", (parseInt(this.updateCount / 30) + 1), "");
            //only log voltage if different than last time
            if (jibo.system.getSystemVoltage() != this.prevBatVolt) {
                this.batteryVoltages.push(jibo.system.getSystemVoltage());
                this.prevBatVolt = jibo.system.getSystemVoltage();
            }
        }
        //step 2, power adapter was unplugged and timer went by to allow sampling
        //of battery voltages
        if (this.plugAdapterAgain) {
            this.batteryVoltage = jibo.system.getSystemVoltage();
            this.countdownDone = true;
            common_1.default._setScreenText("TEST 10: BATTERY VOLTAGE", "", "", "Step 2. Insert Power Adapter");
        }
        //ready to measure battery
        if (jibo.system.pluggedIn && this.countdownDone) {
            //check if battery voltage is within range
            if (!this.batteryMeasured) {
                var batteryV = Math.min.apply(null, this.batteryVoltages);
                if (batteryV >= 14.0 && batteryV <= 15.2) {
                    this.logData['result'].batteryVoltage = true;
                    this.logData['measurement'].batteryVoltage = batteryV.toFixed(2);
                    console.log('passed step 2');
                }
                else {
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
            if (this.shutdownCount == 0 && !this.finishedLogging) {
                this.curTime = new Date().getTime();
                if (!this.generatedLogs) {
                    this.logData['duration'] = { "testDuration": undefined };
                    this.logData['duration'].testDuration = (Math.abs(this.curTime - this.startTime));
                    this.writePersistentData();
                }
                this._generateLog();
                this._POWEROFF();
            }
            else {
                common_1.default._setScreenText("SHUTDOWN IN:", "", (parseInt(this.shutdownCount / 30) + 1), "");
                this.shutdownCount--;
            }
        }
    }
}
module.exports = BatteryTest;

},{"../common":22,"../test":25,"fs":undefined,"jibo":undefined}],27:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
var childProcess = require('child_process');
let Main = require('../app');
let projectRoot = require('../project-root');
let path = require('path');
let fs = require('fs');
let jibo = require('jibo');
/*
* Landing page for beginning of test
* */
class BeginTest extends test_1.default {
    constructor() {
        super();
        this.exiting = false;
        this.onRobot = false;
        /////////////////////////////
    }
    _getinformationrmation(hostIdentity) {
        var hostname = hostIdentity;
        var curDate = new Date().toUTCString();
        //logging for simulator mode
        this.logKey = "robotInformation";
        this.logData = {};
        this.logData['information'] = { 'date': undefined,
            'serial_number': undefined,
            'name': undefined,
            'cpuid': undefined,
            'wifi_mac': undefined };
        if (hostname === "simulator") {
            this.logData['information'].serial_number = "hostname.serial_number";
            this.logData['information'].name = "hostname.name";
            this.logData['information'].cpuid = "hostname.cpuid";
            this.logData['information'].wifi_mac = "hostname.wifi_mac";
        }
        else {
            if (hostname.serial_number) {
                this.logData['information'].serial_number = hostname.serial_number;
            }
            else {
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
            common_1.default._showButton('center-button', '450px', '400px', () => {
                this._measureValues(this.onRobot);
                this.logKey = "beginTest";
                this.logData = {};
                this.logData['time'] = { "duration": undefined };
                this.curTime = new Date().getTime();
                this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
                //start next test
                this.writePersistentData();
                Main.startNextTest();
            }, 'BEGIN TEST');
            common_1.default._clearButtonFromScreen(['next-button', 'back-button', 'neck-button',
                'torso-button', 'pelvis-button']);
            //Listening to API
            this.testAPI((result) => {
                this.axisData = result;
            });
        });
        //remove log file if it exists
        if (fs.existsSync(path.resolve(projectRoot.get(), 'styles/' + 'finGoodsSkill.log'))) {
            let logPath = path.resolve(projectRoot.get(), 'styles/' + 'finGoodsSkill.log');
            childProcess.execSync('rm ' + logPath);
        }
        common_1.default.centerRobot();
        console.log('enter begin test');
        this.startTime = new Date().getTime();
        let idPath = '/var/jibo/identity.json';
        if (fs.existsSync(idPath)) {
            this.onRobot = true;
            this._getinformationrmation(require(idPath));
        }
        else {
            this._getinformationrmation("simulator");
        }
        let axisURI = "ws://localhost:8282";
        this.axisStateSocket = new WebSocket(axisURI + "/axis_state");
        // this.axisCommandSocket = new WebSocket(axisURI + "/axis_command");
        common_1.default.resetLED();
        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-275px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "50px";
        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "50px";
        temp2.style.marginRight = "50px";
        temp2.style.fontSize = "50px";
        common_1.default._setScreenText("Jibo Finished Goods: Built in Test", "Plug in Power Adapter and press BEGIN TEST to start");
    }
    //function to listen to Body Service axis state
    testAPI(cb) {
        this.axisStateSocket.onmessage = function (event) {
            cb(JSON.parse(event.data));
        };
    }
    _measureValues(onRobot) {
        this.logKey = "indexTest";
        this.logData = {};
        this.logData['result'] = { "passed": undefined };
        this.logData['indexStatus'] = { "neckIndexStatus": undefined,
            "pelvisIndexStatus": undefined,
            "torsoIndexStatus": undefined };
        if (onRobot) {
            let tempNeck = this.axisData.neck.status & 0x01;
            let tempPelvis = this.axisData.pelvis.status & 0x01;
            let tempTorso = this.axisData.torso.status & 0x01;
            if (tempNeck && tempPelvis && tempTorso) {
                console.log('indexed');
                this.logData['result'].passed = true;
            }
            else {
                console.log('failed');
                this.logData['result'].passed = false;
            }
            //logging for neck status
            console.log('robot');
            this.logData['indexStatus'].neckIndexStatus = tempNeck;
            this.logData['indexStatus'].pelvisIndexStatus = tempPelvis;
            this.logData['indexStatus'].torsoIndexStatus = tempTorso;
        }
        else {
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
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['next-button', 'center-button']);
        this.axisStateSocket.close();
    }
    update() {
        if (this.exiting) {
            return;
        }
    }
}
module.exports = BeginTest;

},{"../app":1,"../common":22,"../project-root":24,"../test":25,"child_process":undefined,"fs":undefined,"jibo":undefined,"path":undefined}],28:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
let Main = require('../app');
// let fs = require('fs');
/*
* No diagnostic test
* */
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');
class centerTest extends test_1.default {
    constructor() {
        super();
        ////////////////////////////////////////
        this.logKey = "centerTest";
        this.logData = {};
        this.logData['result'] = { "passed": undefined };
        this.logData['time'] = { "testDuration": undefined };
    }
    enter() {
        common_1.default.centerRobot();
        console.log('enter index test');
        this.startTime = new Date().getTime();
        common_1.default._showButton('success-button', "800px", "360px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "success");
            this.logData['result'].passed = true;
        });
        common_1.default._showButton('failure-button', "400px", "360px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
        });
        common_1.default._showButton('next-button', "100px", "300px", () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            common_1.default._setPassFailButtons(successButton, failureButton, "clear");
            Main.startNextTest();
        });
        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-300px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "50px";
        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "25px";
        temp2.style.fontSize = "50px";
        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "30px";
        temp3.style.fontSize = "50px";
        common_1.default._setScreenText("TEST 1: CENTER TEST", "Confirm if robot is centered");
    }
    exit() {
        console.log('exit index test');
        //clear all variables
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['next-button', 'success-button', 'failure-button']);
    }
    update() {
    }
}
module.exports = centerTest;

},{"../app":1,"../common":22,"../test":25}],29:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
let Main = require('../app');
/*
* Test display quality with image cycle
* */
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');
let centerButton = document.getElementById('center-button');
class displayTest extends test_1.default {
    constructor() {
        super();
        this.finishedTest = false;
        this.imageListIndex = 0;
        this.endScreen = true;
        this.imageList = ["images/blue.png",
            "images/red.png",
            "images/green.png",
            "images/black.png",
            "images/white.png",
            "images/25FromBlack.png",
            "images/25FromWhite.png",
            "images/3PxBorder.png"];
        //////////////////////////////////////////
        this.logKey = "displayTest";
        this.logData = {};
        this.logData['result'] = { "passed": undefined };
        this.logData['time'] = { "testDuration": undefined };
    }
    enter() {
        common_1.default.centerRobot();
        console.log('enter display test');
        this.startTime = new Date().getTime();
        let centerFullCallback = () => {
            common_1.default._clearButtonFromScreen(['center-button']);
            //if reset flag is set, start test over again
            if (this.finishedTest) {
                this.imageListIndex = 0;
                this.finishedTest = false;
                common_1.default._setScreenText("");
                common_1.default._clearButtonFromScreen(['next-button', 'success-button', 'failure-button']);
                common_1.default._setPassFailButtons(successButton, failureButton, "clear");
                common_1.default._addButtonListener('container', centerFullCallback);
            }
            if (this.imageListIndex < this.imageList.length) {
                this.endScreen = false;
                //clear next button and screen text
                common_1.default._clearButtonFromScreen(['next-button']);
                common_1.default._setScreenText("");
                centerButton.innerHTML = "Next";
                common_1.default._setShowBackground(true, this.imageList[this.imageListIndex]);
                this.imageListIndex++;
            }
            else {
                this.endScreen = true;
                common_1.default._setScreenText("TEST 3: DISPLAY QUALITY TEST", "Choose FAIL if images were not sharp and clear");
                common_1.default._setShowBackground(false, this.imageList[0]);
                centerButton.innerHTML = "Redo";
                this.finishedTest = true;
                let nextCallback = () => {
                    //log time
                    this.curTime = new Date().getTime();
                    this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
                    common_1.default._setPassFailButtons(successButton, failureButton, "clear");
                    Main.startNextTest();
                };
                common_1.default._showButton('success-button', "800px", "300px", () => {
                    common_1.default._setPassFailButtons(successButton, failureButton, "success");
                    this.logData['result'].passed = true;
                    common_1.default._showButton('next-button', '50px', '300px', nextCallback);
                });
                common_1.default._showButton('failure-button', "275px", "300px", () => {
                    common_1.default._setPassFailButtons(successButton, failureButton, "failure");
                    this.logData['result'].passed = false;
                    common_1.default._showButton('next-button', '50px', '300px', nextCallback);
                });
                common_1.default._showButton('center-button', "500px", "500px", centerFullCallback, "REDO");
                common_1.default._removeButtonListener('container');
            }
        };
        common_1.default._showButton('center-button', '540px', '400px', centerFullCallback, 'TEST');
        common_1.default._addButtonListener('container', centerFullCallback);
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
        common_1.default._setScreenText("TEST 3: DISPLAY TEST", "Press TEST to begin. Observe screen and look for", "bad pixels, irregular lines or distortion", "Tap the screen to advance.");
    }
    exit() {
        console.log("exit display test");
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['next-button', 'center-button',
            'success-button', 'failure-button']);
        common_1.default._removeButtonListener('container');
    }
    //perform test in here
    update() {
        if (this.exiting) {
            return;
        }
    }
}
module.exports = displayTest;

},{"../app":1,"../common":22,"../test":25}],30:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
let path = require('path');
let projectRoot = require('../project-root');
let jibo = require('jibo');
let Main = require('../app');
const bts_1 = require('../bts');
/*
* Body test
* */
let neckPassButton = document.getElementById('success-button');
let neckFailButton = document.getElementById('failure-button');
let torsoPassButton = document.getElementById('success-button-2');
let torsoFailButton = document.getElementById('failure-button-2');
let pelvisPassButton = document.getElementById('success-button-3');
let pelvisFailButton = document.getElementById('failure-button-3');
class freeAirTest extends test_1.default {
    constructor() {
        super();
        this.startedTest = false;
        this.velThresh = .25;
        this.bodyData = "";
        ///////////////////////////////////
        this.logKey = "freeAirTest";
        this.logData = {};
        this.logData['neck'] = { "curArray": [], "velArray": [] };
        this.logData['torso'] = { "curArray": [], "velArray": [] };
        this.logData['pelvis'] = { "curArray": [], "velArray": [] };
        this.logData['time'] = { "testDuration": undefined };
        this.logData['result'] = { "freeAirTestNeckObservation": undefined,
            "freeAirTestTorsoObservation": undefined,
            "freeAirTestPelvisObservation": undefined };
        this.logData['faults'] = { "freeAirTestNeckFault": undefined,
            "freeAirTestTorsoFault": undefined,
            "freeAirTestPelvisFault": undefined };
    }
    _warmUp() {
        console.log("body warmup");
        this.root = jibo.bt.create(bts_1.default['WarmUpMovements']);
        this.root.start();
        if (!this.startedTest) {
            this.startedTest = true;
        }
    }
    enter() {
        common_1.default.centerRobot();
        console.log("enter bodies test");
        this.startTime = new Date().getTime();
        this.logData['result'].freeAirTestNeckObservation = false;
        this.logData['result'].freeAirTestTorsoObservation = false;
        this.logData['result'].freeAirTestPelvisObservation = false;
        this.axisSocket = new WebSocket("ws://localhost:8282/axis_state");
        this._warmUp();
        //neck spin
        common_1.default._showButton('neck-button', "900px", "250px", () => {
            this._setSpinLogic(true, 'neck');
        });
        //torso spin
        common_1.default._showButton('torso-button', "900px", "400px", () => {
            this._setSpinLogic(true, 'torso');
        });
        //pelvis spin
        common_1.default._showButton('pelvis-button', "900px", "550px", () => {
            this._setSpinLogic(true, 'pelvis');
        });
        //neck pass
        common_1.default._showButton('success-button', "600px", "250px", () => {
            common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "success");
            this.logData['result'].freeAirTestNeckObservation = true;
        });
        //neck fail
        common_1.default._showButton('failure-button', "300px", "250px", () => {
            common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "failure");
            this.logData['result'].freeAirTestNeckObservation = false;
        });
        //torso pass
        common_1.default._showButton('success-button-2', "600px", "400px", () => {
            common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "success");
            this.logData['result'].freeAirTestTorsoObservation = true;
        });
        //torso fail
        common_1.default._showButton('failure-button-2', "300px", "400px", () => {
            common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "failure");
            this.logData['result'].freeAirTestTorsoObservation = false;
        });
        //pelvis pass
        common_1.default._showButton('success-button-3', "600px", "550px", () => {
            common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "success");
            this.logData['result'].freeAirTestPelvisObservation = true;
        });
        //pelvis fail
        common_1.default._showButton('failure-button-3', "300px", "550px", () => {
            common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "failure");
            this.logData['result'].freeAirTestPelvisObservation = false;
        });
        common_1.default._showButton('next-button', '100px', '300px', () => {
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            if (this.bodyData) {
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
        common_1.default._setScreenText("TEST 6: FREE-AIR ROTATION", "Select a body segment to begin test.  Choose FAIL if body", "movement is erratic.");
        //collect callback of bodyData
        this.testAPI((response) => {
            this.bodyData = response;
        });
    }
    //API to collect body data and parse
    testAPI(cb) {
        this.axisSocket.onmessage = function (event) {
            cb(JSON.parse(event.data));
        };
    }
    exit() {
        console.log("exit bodies test");
        if (this.root) {
            this.root.stop();
            this.root = null;
        }
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['neck-button', 'pelvis-button', 'torso-button',
            'success-button', 'failure-button',
            'success-button-2', 'failure-button-2',
            'success-button-3', 'success-button-3',
            'next-button']);
        common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "clear");
        common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "clear");
        common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "clear");
        this.startedTest = false;
    }
    _setSpinLogic(bodyButton, body) {
        this.root = jibo.bt.create(bts_1.default[body + '-spin-both']);
        this.root.start();
        //indicate test has started to allow root updating
        if (!this.startedTest) {
            this.startedTest = true;
        }
    }
    update() {
        ///////////////////
        //Logging logic
        /////////////////////////////////////////////////////////
        if (this.bodyData.neck != undefined && this.bodyData.neck.vel > this.velThresh) {
            this.logData['neck'].curArray.push(this.bodyData.neck.cur.toFixed(5));
            this.logData['neck'].velArray.push(this.bodyData.neck.vel.toFixed(5));
        }
        if (this.bodyData.torso != undefined && this.bodyData.torso.vel > this.velThresh) {
            this.logData['torso'].curArray.push(this.bodyData.torso.cur.toFixed(5));
            this.logData['torso'].velArray.push(this.bodyData.torso.vel.toFixed(5));
        }
        if (this.bodyData.pelvis != undefined && this.bodyData.pelvis.vel > this.velThresh) {
            this.logData['pelvis'].curArray.push(this.bodyData.pelvis.cur.toFixed(5));
            this.logData['pelvis'].velArray.push(this.bodyData.pelvis.vel.toFixed(5));
        }
        ////////////////////////////////////////////////////////
        //only update if test has started
        if (this.startedTest) {
            this.root.update();
        }
    }
}
module.exports = freeAirTest;

},{"../app":1,"../bts":21,"../common":22,"../project-root":24,"../test":25,"jibo":undefined,"path":undefined}],31:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
let path = require('path');
let projectRoot = require('../project-root');
let jibo = require('jibo');
let Main = require('../app');
const bts_1 = require('../bts');
/*
* full body test
* */
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');
class fullBodyTest extends test_1.default {
    constructor() {
        super();
        ////////////////////////////////////////
        this.logKey = "fullBodyTest";
        this.logData = {};
        this.logData['result'] = { "passed": undefined };
        this.logData['time'] = { "testDuration": undefined };
    }
    enter() {
        common_1.default.centerRobot();
        console.log('enter full body test');
        this.startTime = new Date().getTime();
        common_1.default._showButton('success-button', "800px", "360px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "success");
            this.logData['result'].passed = true;
        });
        common_1.default._showButton('failure-button', "400px", "360px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
        });
        common_1.default._showButton('center-button', '540px', '500px', () => {
            this.root = jibo.bt.create(bts_1.default['fullBodyAnimation']);
            this.root.start();
            common_1.default._setPassFailButtons(successButton, failureButton, "clear");
        }, 'SPIN');
        common_1.default._showButton('next-button', "100px", "300px", () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            common_1.default._setPassFailButtons(successButton, failureButton, "clear");
            Main.startNextTest();
        });
        let temp1 = document.getElementById('test-label1');
        temp1.style.marginTop = "-300px";
        temp1.style.marginRight = "50px";
        temp1.style.fontSize = "50px";
        let temp2 = document.getElementById('test-label2');
        temp2.style.marginTop = "25px";
        temp2.style.fontSize = "50px";
        let temp3 = document.getElementById('test-label3');
        temp3.style.marginTop = "30px";
        temp3.style.fontSize = "50px";
        common_1.default._setScreenText("TEST 9: FULL BODY TEST", "Press SPIN to animate robot", "Press FAIL if anything abnormal, PASS otherwise");
    }
    exit() {
        console.log('exit full body test');
        if (this.root) {
            this.root.stop();
            this.root = null;
        }
        //clear all variables
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['next-button', 'success-button', 'failure-button', "center-button"]);
    }
    update() {
        //only update if test has started
        if (this.root) {
            this.root.update();
        }
    }
}
module.exports = fullBodyTest;

},{"../app":1,"../bts":21,"../common":22,"../project-root":24,"../test":25,"jibo":undefined,"path":undefined}],32:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
const jibo = require('jibo');
let Main = require('../app');
/*
* Test touch sensors
* */
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');
class headTouchTest extends test_1.default {
    constructor() {
        super();
        this.finishedTest = false;
        this.testing = false;
        ////////////////////////////////////////////////////////
        this.logKey = "headTouchTest";
        this.logData = {};
        this.logData['result'] = { "passed": undefined };
        this.logData['time'] = { "testDuration": undefined };
        this.logData['touchpads'] = { "isActivated": [undefined, undefined, undefined,
                undefined, undefined, undefined] };
    }
    enter() {
        common_1.default.centerRobot();
        console.log('enter touchpads test');
        this.startTime = new Date().getTime();
        this.touchpads = document.getElementById('touchpads');
        common_1.default._showButton('touchpad-3', '1025px', '250px');
        common_1.default._showButton('touchpad-4', '1025px', '375px');
        common_1.default._showButton('touchpad-5', '1025px', '500px');
        common_1.default._showButton('touchpad-0', '900px', '250px');
        common_1.default._showButton('touchpad-1', '900px', '375px');
        common_1.default._showButton('touchpad-2', '900px', '500px');
        let nextCallback = () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            common_1.default._setPassFailButtons(successButton, failureButton, "clear");
            Main.startNextTest();
        };
        common_1.default._showButton('success-button', "275px", "300px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "success");
            this.logData['result'].passed = true;
            common_1.default._showButton('next-button', "100px", "300px", nextCallback);
        });
        common_1.default._showButton('failure-button', "275px", "500px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
            common_1.default._showButton('next-button', "100px", "300px", nextCallback);
        });
        common_1.default._showButton('center-button', '575px', '400px', () => {
            this.testing = true;
            common_1.default._setPassFailButtons(successButton, failureButton, "clear");
            common_1.default._showButton('center-button', '500px', '400px', null, 'REDO');
            common_1.default._showButton('next-button', '6000px', '500px');
            for (let i = 0; i < 6; i++) {
                this._touchpadControl(document.getElementById('touchpad-' + i), i, "reset");
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
        common_1.default._setScreenText("TEST 4: HEAD TOUCH SENSORS", "Rub hands along back of head several times.  Choose FAIL", "if any sensor does not activate");
    }
    exit() {
        console.log('exit touchpads test');
        this.touchpads.style.display = "none";
        document.getElementById('test-label1').style.marginTop = "0px";
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['next-button', 'center-button', 'success-button', 'failure-button']);
    }
    _touchpadControl(button, index, mode) {
        button.classList.remove('activated', 'reset');
        if (mode === "activated") {
            button.classList.add('activated');
            this.logData['touchpads'].isActivated[index] = index + ": " + true;
        }
        if (mode === "reset") {
            button.classList.add('reset');
            this.logData['touchpads'].isActivated[index] = index + ": " + false;
        }
    }
    //perform test in here
    update() {
        if (this.testing) {
            for (let i = 0; i < 6; i++) {
                if (jibo.system.bs.touchState.pad_state[i]) {
                    this._touchpadControl(document.getElementById('touchpad-' + i), i, "activated");
                }
            }
        }
    }
}
module.exports = headTouchTest;

},{"../app":1,"../common":22,"../test":25,"jibo":undefined}],33:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
let jibo = require('jibo');
let Main = require('../app');
let path = require('path');
let projectRoot = require('../project-root');
const bts_1 = require('../bts');
/*
* Test LED ring
* */
let centerButton = document.getElementById('center-button');
let successButton = document.getElementById('success-button');
let failureButton = document.getElementById('failure-button');
class LEDTest extends test_1.default {
    constructor() {
        super();
        this.finishedTest = false;
        this.ledListIndex = 0;
        ////////////////////////////////////////////////////
        this.logKey = "ledTest";
        this.logData = {};
        this.logData['time'] = { "testDuration": undefined };
        this.logData['result'] = { "passed": undefined };
        this.ledList = [["RED", [1, 0, 0], "linear-gradient(to bottom, #ff0000, #b40000)"],
            ["GREEN", [0, 1, 0], "linear-gradient(to bottom, #00ff00, #00b400)"],
            ["BLUE", [0, 0, 1], "linear-gradient(to bottom, #0000ff, #0000b4)"],
            ["WHITE", [1, 1, 1], "linear-gradient(to bottom, #ffffff, #b4b4b4)"]];
    }
    _warmUp() {
        console.log("body warmup");
        this.root = jibo.bt.create(bts_1.default['WarmUpMovements']);
        this.root.start();
        if (!this.startedTest) {
            this.startedTest = true;
        }
    }
    enter() {
        common_1.default.centerRobot();
        console.log('enter LED test');
        this.startTime = new Date().getTime();
        this._warmUp();
        common_1.default._showButton('center-button', '540px', '500px', () => {
            //if reset flag is set, start test over again
            if (this.finishedTest == true) {
                this.ledListIndex = 0;
                this.finishedTest = false;
                //clear screen text and next button
                common_1.default._setScreenText("");
                common_1.default._clearButtonFromScreen(['next-button', 'success-button', 'failure-button']);
                common_1.default._setPassFailButtons(successButton, failureButton, "clear");
            }
            if (this.ledListIndex < this.ledList.length) {
                //SPIN
                this.root = jibo.bt.create(bts_1.default['head-CCW-pelvis-CW']);
                this.root.start();
                //clear next button and screen text
                common_1.default._setScreenText("TEST 5: LIGHT RING", "Inspect light ring");
                common_1.default._showButton('center-button', "540px", "500px", null, this.ledList[this.ledListIndex][0]);
                document.getElementById('center-button').style.backgroundImage =
                    this.ledList[this.ledListIndex][2];
                //set LED to color from above list
                common_1.default.setLED(this.ledList[this.ledListIndex][1]);
                this.ledListIndex++;
            }
            else {
                common_1.default.resetLED();
                document.getElementById('center-button').style.backgroundImage =
                    "linear-gradient(to bottom, #28a6fa, #2280ba)";
                common_1.default._setScreenText("TEST 6: LIGHT RING", "Choose FAIL if any LEDs did not illuminate");
                //finished cycling through image display
                centerButton.innerHTML = "REDO";
                //set flag that test cycle finished, in case redo
                this.finishedTest = true;
                let nextCallback = () => {
                    //log time
                    this.curTime = new Date().getTime();
                    this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
                    common_1.default._setPassFailButtons(successButton, failureButton, "clear");
                    Main.startNextTest();
                };
                common_1.default._showButton('success-button', "275px", "300px", () => {
                    common_1.default._setPassFailButtons(successButton, failureButton, "success");
                    this.logData['result'].passed = true;
                    common_1.default._showButton('next-button', "100px", "300px", nextCallback);
                });
                common_1.default._showButton('failure-button', "800px", "300px", () => {
                    common_1.default._setPassFailButtons(successButton, failureButton, "failure");
                    this.logData['result'].passed = false;
                    common_1.default._showButton('next-button', "100px", "300px", nextCallback);
                });
            }
        }, 'TEST');
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
        common_1.default._setScreenText("TEST 5: LIGHT RING", "Press TEST to begin.  Cycle through each color and", "visually inspect light ring.  Choose FAIL if any", "LEDs do not illuminate correctly.");
    }
    exit() {
        console.log("exit LED test");
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['next-button', 'center-button',
            'success-button', 'failure-button']);
    }
    //perform test in here
    update() {
        if (this.exiting) {
            return;
        }
    }
}
module.exports = LEDTest;

},{"../app":1,"../bts":21,"../common":22,"../project-root":24,"../test":25,"jibo":undefined,"path":undefined}],34:[function(require,module,exports){
(function (global){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
let projectRoot = require('../project-root');
const path = require('path');
let jibo = require('jibo');
let Main = require('../app');
const bts_1 = require('../bts');
/*
* stall CCWtest
* */
var audioContext = new AudioContext();
var buffer = null;
let neckPassButton = document.getElementById('success-button');
let neckFailButton = document.getElementById('failure-button');
let torsoPassButton = document.getElementById('success-button-2');
let torsoFailButton = document.getElementById('failure-button-2');
let pelvisPassButton = document.getElementById('success-button-3');
let pelvisFailButton = document.getElementById('failure-button-3');
class StallCCWTest extends test_1.default {
    constructor() {
        super();
        this.initializeAudio("/audio/FX_Bleep.mp3");
        this.startedTest = false;
        this.velThresh = .25;
        this.playSound = [true, true, true];
        this.bodyData = "";
        /////////////////////
        this.logKey = "stallCCWTest";
        this.logData = {};
        this.logData['neck'] = { "curArray": [], "velArray": [] };
        this.logData['torso'] = { "curArray": [], "velArray": [] };
        this.logData['pelvis'] = { "curArray": [], "velArray": [] };
        this.logData['time'] = { "testDuration": undefined };
        this.logData['result'] = { "stallCCWTestNeckObservation": undefined,
            "stallCCWTestTorsoObservation": undefined,
            "stallCCWTestPelvisObservation": undefined };
        this.logData['faults'] = { "stallCCWTestNeckFault": undefined,
            "stallCCWTestTorsoFault": undefined,
            "stallCCWTestPelvisFault": undefined };
    }
    _warmUp() {
        console.log("body warmup");
        this.root = jibo.bt.create(bts_1.default['WarmUpMovements']);
        this.root.start();
        if (!this.startedTest) {
            this.startedTest = true;
        }
    }
    enter() {
        common_1.default.centerRobot();
        console.log("enter stall CCW test");
        this.startTime = new Date().getTime();
        this.logData['result'].stallCCWTestNeckObservation = false;
        this.logData['result'].stallCCWTestTorsoObservation = false;
        this.logData['result'].stallCCWTestPelvisObservation = false;
        this.axisSocket = new WebSocket("ws://localhost:8282/axis_state");
        this._warmUp();
        //neck spin
        common_1.default._showButton('neck-button', "900px", "250px", () => {
            this.playSound[0] = true;
            this._setSpinLogic(true, 'neck');
        });
        //torso spin
        common_1.default._showButton('torso-button', "900px", "400px", () => {
            this.playSound[1] = true;
            this._setSpinLogic(true, 'torso');
        });
        //pelvis spin
        common_1.default._showButton('pelvis-button', "900px", "550px", () => {
            this.playSound[2] = true;
            this._setSpinLogic(true, 'pelvis');
        });
        //neck pass
        common_1.default._showButton('success-button', "600px", "250px", () => {
            common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "success");
            this.logData['result'].stallCCWTestNeckObservation = true;
        });
        //neck fail
        common_1.default._showButton('failure-button', "300px", "250px", () => {
            common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "failure");
            this.logData['result'].stallCCWTestNeckObservation = false;
        });
        //torso pass
        common_1.default._showButton('success-button-2', "600px", "400px", () => {
            common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "success");
            this.logData['result'].stallCCWTestTorsoObservation = true;
        });
        //torso fail
        common_1.default._showButton('failure-button-2', "300px", "400px", () => {
            common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "failure");
            this.logData['result'].stallCCWTestTorsoObservation = false;
        });
        //pelvis pass
        common_1.default._showButton('success-button-3', "600px", "550px", () => {
            common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "success");
            this.logData['result'].stallCCWTestPelvisObservation = true;
        });
        //pelvis fail
        common_1.default._showButton('failure-button-3', "300px", "550px", () => {
            common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "failure");
            this.logData['result'].stallCCWTestPelvisObservation = false;
        });
        common_1.default._showButton('next-button', '100px', '300px', () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            if (this.bodyData) {
                this.logData['faults'].stallCCWTestNeckFault = (this.bodyData.neck.fault_status);
                this.logData['faults'].stallCCWTestTorsoFault = (this.bodyData.torso.fault_status);
                this.logData['faults'].stallCCWTestPelvisFault = (this.bodyData.pelvis.fault_status);
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
        common_1.default._setScreenText("TEST 8: STALL DETECTION COUNTER-CLOCKWISE", "Select a segment to test.  Grab and hold segment until", "you hear a tone.  Choose FAIL if segment does not", "behave normally.");
        //collect callback of bodyData
        this.testAPI((response) => {
            this.bodyData = response;
        });
    }
    initializeAudio(audioStr) {
        this.bufferSource = null;
        let request = new XMLHttpRequest();
        let url = path.normalize(global.__dirname + audioStr);
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            // Decode asynchronously
            audioContext.decodeAudioData(request.response, function (_buffer) {
                buffer = _buffer;
            });
        };
        request.send();
    }
    //API to collect body data and parse
    testAPI(cb) {
        this.axisSocket.onmessage = function (event) {
            cb(JSON.parse(event.data));
        };
    }
    exit() {
        console.log("exit stall CCW test");
        if (this.root) {
            this.root.stop();
            this.root = null;
        }
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['neck-button', 'pelvis-button', 'torso-button',
            'success-button', 'failure-button',
            'success-button-2', 'failure-button-2',
            'success-button-3', 'failure-button-3',
            'next-button']);
        common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "clear");
        common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "clear");
        common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "clear");
        this.startedTest = false;
    }
    _setSpinLogic(bodyButton, body) {
        if (this.root) {
            this.root.stop();
            this.root = null;
        }
        this.root = jibo.bt.create(bts_1.default[body + '-spin-360-' + "CCW"]);
        this.root.start();
        //indicate test has started to allow root updating
        if (!this.startedTest) {
            this.startedTest = true;
        }
    }
    _playSoundAndLog(index) {
        if (this.playSound[index]) {
            this._stop();
            this._play();
            this.playSound[index] = false;
        }
    }
    _stop() {
        if (!this.bufferSource) {
            return;
        }
        this.bufferSource.disconnect();
        this.bufferSource = null;
    }
    _play() {
        if (!buffer) {
            console.log("Audio buffer not loaded yet...");
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
        if (this.bodyData.neck != undefined && this.bodyData.neck.vel > this.velThresh) {
            this.logData['neck'].curArray.push(this.bodyData.neck.cur.toFixed(5));
            this.logData['neck'].velArray.push(this.bodyData.neck.vel.toFixed(5));
        }
        if (this.bodyData.torso != undefined && this.bodyData.torso.vel > this.velThresh) {
            this.logData['torso'].curArray.push(this.bodyData.torso.cur.toFixed(5));
            this.logData['torso'].velArray.push(this.bodyData.torso.vel.toFixed(5));
        }
        if (this.bodyData.pelvis != undefined && this.bodyData.pelvis.vel > this.velThresh) {
            this.logData['pelvis'].curArray.push(this.bodyData.pelvis.cur.toFixed(5));
            this.logData['pelvis'].velArray.push(this.bodyData.pelvis.vel.toFixed(5));
        }
        if (this.bodyData) {
            if (this.bodyData.neck.fault_status & 0x02) {
                if (this.playSound[0]) {
                    this._playSoundAndLog(0);
                    this.playSound[0] = false;
                }
            }
            if (this.bodyData.torso.fault_status & 0x02) {
                if (this.playSound[1]) {
                    this._playSoundAndLog(1);
                    this.playSound[1] = false;
                }
            }
            if (this.bodyData.pelvis.fault_status & 0x02) {
                if (this.playSound[2]) {
                    this._playSoundAndLog(2);
                    this.playSound[2] = false;
                }
            }
        }
        ////////////////////////////////////////////////////////
        //only update if test has started
        if (this.startedTest) {
            this.root.update();
        }
    }
}
module.exports = StallCCWTest;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../app":1,"../bts":21,"../common":22,"../project-root":24,"../test":25,"jibo":undefined,"path":undefined}],35:[function(require,module,exports){
(function (global){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
let projectRoot = require('../project-root');
const path = require('path');
let jibo = require('jibo');
let Main = require('../app');
const bts_1 = require('../bts');
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
class StallCWTest extends test_1.default {
    constructor() {
        super();
        this.initializeAudio("/audio/FX_Bleep.mp3");
        this.startedTest = false;
        this.velThresh = .25;
        this.playSound = [true, true, true];
        this.bodyData = "";
        /////////////////////
        this.logKey = "stallCWTest";
        this.logData = {};
        this.logData['neck'] = { "curArray": [], "velArray": [] };
        this.logData['torso'] = { "curArray": [], "velArray": [] };
        this.logData['pelvis'] = { "curArray": [], "velArray": [] };
        this.logData['time'] = { "testDuration": undefined };
        this.logData['result'] = { "stallCWTestNeckObservation": undefined,
            "stallCWTestTorsoObservation": undefined,
            "stallCWTestPelvisObservation": undefined };
        this.logData['faults'] = { "stallCWTestNeckFault": undefined,
            "stallCWTestTorsoFault": undefined,
            "stallCWTestPelvisFault": undefined };
    }
    _warmUp() {
        console.log("body warmup");
        this.root = jibo.bt.create(bts_1.default['WarmUpMovements']);
        this.root.start();
        if (!this.startedTest) {
            this.startedTest = true;
        }
    }
    enter() {
        common_1.default.centerRobot();
        console.log("enter stall CW test");
        this.startTime = new Date().getTime();
        this.logData['result'].stallCWTestNeckObservation = false;
        this.logData['result'].stallCWTestTorsoObservation = false;
        this.logData['result'].stallCWTestPelvisObservation = false;
        this.axisSocket = new WebSocket("ws://localhost:8282/axis_state");
        this._warmUp();
        //neck spin
        common_1.default._showButton('neck-button', "900px", "250px", () => {
            this.playSound[0] = true;
            this._setSpinLogic(true, 'neck');
        });
        //torso spin
        common_1.default._showButton('torso-button', "900px", "400px", () => {
            this.playSound[1] = true;
            this._setSpinLogic(true, 'torso');
        });
        //pelvis spin
        common_1.default._showButton('pelvis-button', "900px", "550px", () => {
            this.playSound[2] = true;
            this._setSpinLogic(true, 'pelvis');
        });
        //neck pass
        common_1.default._showButton('success-button', "600px", "250px", () => {
            common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "success");
            this.logData['result'].stallCWTestNeckObservation = true;
        });
        //neck fail
        common_1.default._showButton('failure-button', "300px", "250px", () => {
            common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "failure");
            this.logData['result'].stallCWTestNeckObservation = false;
        });
        //torso pass
        common_1.default._showButton('success-button-2', "600px", "400px", () => {
            common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "success");
            this.logData['result'].stallCWTestTorsoObservation = true;
        });
        //torso fail
        common_1.default._showButton('failure-button-2', "300px", "400px", () => {
            common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "failure");
            this.logData['result'].stallCWTestTorsoObservation = false;
        });
        //pelvis pass
        common_1.default._showButton('success-button-3', "600px", "550px", () => {
            common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "success");
            this.logData['result'].stallCWTestPelvisObservation = true;
        });
        //pelvis fail
        common_1.default._showButton('failure-button-3', "300px", "550px", () => {
            common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "failure");
            this.logData['result'].stallCWTestPelvisObservation = false;
        });
        common_1.default._showButton('next-button', '100px', '300px', () => {
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            if (this.bodyData) {
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
        common_1.default._setScreenText("TEST 7: STALL DETECTION CLOCKWISE", "Select a segment to test.  Grab and hold segment until", "you hear a tone.  Choose FAIL if segment does not", "behave normally.");
        //collect callback of bodyData
        this.testAPI((response) => {
            this.bodyData = response;
        });
    }
    initializeAudio(audioStr) {
        this.bufferSource = null;
        let request = new XMLHttpRequest();
        let url = path.normalize(global.__dirname + audioStr);
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            // Decode asynchronously
            audioContext.decodeAudioData(request.response, function (_buffer) {
                buffer = _buffer;
            });
        };
        request.send();
    }
    //API to collect body data and parse
    testAPI(cb) {
        this.axisSocket.onmessage = function (event) {
            cb(JSON.parse(event.data));
        };
    }
    exit() {
        console.log("exit stall CW test");
        if (this.root) {
            this.root.stop();
            this.root = null;
        }
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['neck-button', 'pelvis-button', 'torso-button',
            'success-button', 'failure-button',
            'success-button-2', 'failure-button-2',
            'success-button-3', 'success-button-3',
            'next-button']);
        common_1.default._setPassFailButtons(neckPassButton, neckFailButton, "clear");
        common_1.default._setPassFailButtons(torsoPassButton, torsoFailButton, "clear");
        common_1.default._setPassFailButtons(pelvisPassButton, pelvisFailButton, "clear");
        this.startedTest = false;
    }
    _setSpinLogic(bodyButton, body) {
        if (this.root) {
            this.root.stop();
            this.root = null;
        }
        this.root = jibo.bt.create(bts_1.default[body + '-spin-360-' + "CW"]);
        this.root.start();
        //indicate test has started to allow root updating
        if (!this.startedTest) {
            this.startedTest = true;
        }
    }
    _playSoundAndLog(index) {
        if (this.playSound[index]) {
            this._stop();
            this._play();
            this.playSound[index] = false;
        }
    }
    _stop() {
        if (!this.bufferSource) {
            return;
        }
        this.bufferSource.disconnect();
        this.bufferSource = null;
    }
    _play() {
        if (!buffer) {
            console.log("Audio buffer not loaded yet...");
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
        if (this.bodyData.neck != undefined && this.bodyData.neck.vel > this.velThresh) {
            this.logData['neck'].curArray.push(this.bodyData.neck.cur.toFixed(5));
            this.logData['neck'].velArray.push(this.bodyData.neck.vel.toFixed(5));
        }
        if (this.bodyData.torso != undefined && this.bodyData.torso.vel > this.velThresh) {
            this.logData['torso'].curArray.push(this.bodyData.torso.cur.toFixed(5));
            this.logData['torso'].velArray.push(this.bodyData.torso.vel.toFixed(5));
        }
        if (this.bodyData.pelvis != undefined && this.bodyData.pelvis.vel > this.velThresh) {
            this.logData['pelvis'].curArray.push(this.bodyData.pelvis.cur.toFixed(5));
            this.logData['pelvis'].velArray.push(this.bodyData.pelvis.vel.toFixed(5));
        }
        if (this.bodyData) {
            if (this.bodyData.neck.fault_status & 0x02) {
                if (this.playSound[0]) {
                    this._playSoundAndLog(0);
                    this.playSound[0] = false;
                }
            }
            if (this.bodyData.torso.fault_status & 0x02) {
                if (this.playSound[1]) {
                    this._playSoundAndLog(1);
                    this.playSound[1] = false;
                }
            }
            if (this.bodyData.pelvis.fault_status & 0x02) {
                if (this.playSound[2]) {
                    this._playSoundAndLog(2);
                    this.playSound[2] = false;
                }
            }
        }
        ////////////////////////////////////////////////////////
        //only update if test has started
        if (this.startedTest) {
            this.root.update();
        }
    }
}
module.exports = StallCWTest;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../app":1,"../bts":21,"../common":22,"../project-root":24,"../test":25,"jibo":undefined,"path":undefined}],36:[function(require,module,exports){
"use strict";
const test_1 = require("../test");
const common_1 = require('../common');
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
class TouchScreenTest extends test_1.default {
    constructor() {
        super();
        this.finishedTest = false;
        this.imageListIndex = 0;
        this.N = 0;
        /////////////////////////////////////////
        this.logKey = "touchscreenTest";
        this.logData = {};
        this.logData['buttons'] = { 'successArray': [undefined, undefined, undefined, undefined, undefined] };
        this.logData['result'] = { 'passed': undefined };
        this.logData['time'] = { "testDuration": undefined };
    }
    enter() {
        common_1.default.centerRobot();
        console.log('enter touchscreen test');
        this.startTime = new Date().getTime();
        common_1.default._showButton('touchscreen1', "1150px", "600px", () => {
            this._touchScreenButtonPressed(t1ConfirmButton, 0);
        });
        common_1.default._showButton('touchscreen2', "50px", "600px", () => {
            this._touchScreenButtonPressed(t2ConfirmButton, 1);
        });
        common_1.default._showButton('touchscreen3', "1150px", "50px", () => {
            this._touchScreenButtonPressed(t3ConfirmButton, 2);
        });
        common_1.default._showButton('touchscreen4', "50px", "50px", () => {
            this._touchScreenButtonPressed(t4ConfirmButton, 3);
        });
        common_1.default._showButton('touchscreen5', "600px", "300px", () => {
            this._touchScreenButtonPressed(t5ConfirmButton, 4);
        });
        let nextCallback = () => {
            console.log('next test');
            //log time
            this.curTime = new Date().getTime();
            this.logData['time'].testDuration = (Math.abs(this.curTime - this.startTime));
            common_1.default._setPassFailButtons(successButton, failureButton, "clear");
            Main.startNextTest();
        };
        common_1.default._showButton('success-button', "800px", "400px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "success");
            this.logData['result'].passed = true;
            common_1.default._showButton('next-button', "100px", "300px", nextCallback);
        });
        common_1.default._showButton('failure-button', "275px", "400px", () => {
            common_1.default._setPassFailButtons(successButton, failureButton, "failure");
            this.logData['result'].passed = false;
            common_1.default._showButton('next-button', "100px", "300px", nextCallback);
        });
        common_1.default._showButton('center-button', "540px", '600px', () => {
            common_1.default._showButton('touchscreen1', "1150px", "600px");
            common_1.default._showButton('touchscreen2', "50px", "600px");
            common_1.default._showButton('touchscreen3', "1150px", "50px");
            common_1.default._showButton('touchscreen4', "50px", "50px");
            common_1.default._showButton('touchscreen5', "600px", "300px");
            this._touchScreenButtonReset(t1ConfirmButton, 0);
            this._touchScreenButtonReset(t2ConfirmButton, 1);
            this._touchScreenButtonReset(t3ConfirmButton, 2);
            this._touchScreenButtonReset(t4ConfirmButton, 3);
            this._touchScreenButtonReset(t5ConfirmButton, 4);
            common_1.default._setPassFailButtons(successButton, failureButton, "clear");
            common_1.default._clearButtonFromScreen(['next-button']);
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
        common_1.default._setScreenText("TEST 2: TOUCH SCREEN", "Press all 5 circles.  Choose FAIL if circle", "does not change color, or if it takes more", "than 2 attempts to change.");
    }
    _clear5() {
        common_1.default._clearButtonFromScreen(['touchscreen1', 'touchscreen2', 'touchscreen3',
            'touchscreen4', 'touchscreen5']);
    }
    exit() {
        console.log("exit touchscreen test");
        common_1.default._setScreenText("");
        common_1.default._clearButtonFromScreen(['touchscreen1', 'touchscreen2', 'touchscreen3',
            'touchscreen4', 'touchscreen5', 'next-button',
            'success-button', 'failure-button']);
    }
    _touchScreenButtonPressed(button, index) {
        button.classList.remove('untouched');
        button.classList.add('touched');
        this.logData['buttons'].successArray[index] = true;
    }
    _touchScreenButtonReset(button, index) {
        button.classList.add('untouched');
        button.classList.remove('touched');
        this.logData['buttons'].successArray[index] = false;
    }
    //perform test in here
    update() {
    }
}
module.exports = TouchScreenTest;

},{"../app":1,"../common":22,"../test":25}]},{},[23])(23)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2JlaGF2aW9ycy9XYXJtVXBNb3ZlbWVudHMuYnQiLCJzcmMvYmVoYXZpb3JzL2Fzci10ZXN0LmJ0Iiwic3JjL2JlaGF2aW9ycy9hdWRpby10cmFja2luZy5idCIsInNyYy9iZWhhdmlvcnMvYm9keS5idCIsInNyYy9iZWhhdmlvcnMvZnVsbEJvZHlBbmltYXRpb24uYnQiLCJzcmMvYmVoYXZpb3JzL2hlYWQtQ0NXLXBlbHZpcy1DVy5idCIsInNyYy9iZWhhdmlvcnMvaWRsZS5idCIsInNyYy9iZWhhdmlvcnMvbGlmZWN5Y2xlLmJ0Iiwic3JjL2JlaGF2aW9ycy9tYWluLmJ0Iiwic3JjL2JlaGF2aW9ycy9uZWNrLXNwaW4tMzYwLUNDVy5idCIsInNyYy9iZWhhdmlvcnMvbmVjay1zcGluLTM2MC1DVy5idCIsInNyYy9iZWhhdmlvcnMvbmVjay1zcGluLWJvdGguYnQiLCJzcmMvYmVoYXZpb3JzL3BlbHZpcy1zcGluLTM2MC1DQ1cuYnQiLCJzcmMvYmVoYXZpb3JzL3BlbHZpcy1zcGluLTM2MC1DVy5idCIsInNyYy9iZWhhdmlvcnMvcGVsdmlzLXNwaW4tYm90aC5idCIsInNyYy9iZWhhdmlvcnMvdG9yc28tc3Bpbi0zNjAtQ0NXLmJ0Iiwic3JjL2JlaGF2aW9ycy90b3Jzby1zcGluLTM2MC1DVy5idCIsInNyYy9iZWhhdmlvcnMvdG9yc28tc3Bpbi1ib3RoLmJ0Iiwic3JjL2JlaGF2aW9ycy90cmFja2luZy5idCIsInNyYy9idHMuanMiLCJzcmMvY29tbW9uLmpzIiwic3JjL2luZGV4LnRzIiwic3JjL3Byb2plY3Qtcm9vdC5qcyIsInNyYy90ZXN0LmpzIiwic3JjL3Rlc3RzL2JhdHRlcnlUZXN0LmpzIiwic3JjL3Rlc3RzL2JlZ2luVGVzdC5qcyIsInNyYy90ZXN0cy9jZW50ZXJUZXN0LmpzIiwic3JjL3Rlc3RzL2Rpc3BsYXlUZXN0LmpzIiwic3JjL3Rlc3RzL2ZyZWVBaXJUZXN0LmpzIiwic3JjL3Rlc3RzL2Z1bGxCb2R5VGVzdC5qcyIsInNyYy90ZXN0cy9oZWFkVG91Y2hUZXN0LmpzIiwic3JjL3Rlc3RzL2xlZFRlc3QuanMiLCJzcmMvdGVzdHMvc3RhbGxDQ1dUZXN0LmpzIiwic3JjL3Rlc3RzL3N0YWxsQ1dUZXN0LmpzIiwic3JjL3Rlc3RzL3RvdWNoc2NyZWVuVGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQTtBQUVaLGNBQWM7QUFDZCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQ3RCLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFDdkMsV0FBVyxHQUFHLFNBQVMsRUFDdkIsVUFBVSxHQUFHLFNBQVMsRUFDdEIsV0FBVyxHQUFHO0lBQ1YsT0FBTyxDQUFDLG1CQUFtQixDQUFDO0lBQzVCLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQztJQUM3QixPQUFPLENBQUMseUJBQXlCLENBQUM7SUFDbEMsT0FBTyxDQUFDLHFCQUFxQixDQUFDO0lBQzlCLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztJQUNoQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7SUFDMUIsT0FBTyxDQUFDLHFCQUFxQixDQUFDO0lBQzlCLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQztJQUM5QixPQUFPLENBQUMsc0JBQXNCLENBQUM7SUFDL0IsT0FBTyxDQUFDLHNCQUFzQixDQUFDO0lBQy9CLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQztDQUNqQyxDQUFDO0FBRU4sSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbkI7O0dBRUc7QUFDSDtJQUNJLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNmLGFBQWEsRUFBRSxDQUFDO0FBQ3BCLENBQUM7QUFIZSxhQUFLLFFBR3BCLENBQUE7QUFFRDs7SUFFSTtBQUNKO0lBQ0ksZ0JBQWdCO0lBQ2hCLGVBQWUsRUFBRSxDQUFDO0lBRWxCLEVBQUUsU0FBUyxDQUFDO0lBQ1osRUFBRSxDQUFDLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFDaEMsTUFBTSxDQUFDO0lBRVgsdURBQXVEO0lBQ3ZELFVBQVUsQ0FBQztRQUNQLGtCQUFrQjtRQUNsQixXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUUzQyxpQkFBaUI7UUFDakIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNkLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ2pDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVwQixVQUFVLEdBQUcsV0FBVyxDQUFDO2dCQUNyQixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUNkLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDekIsQ0FBQztZQUNMLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNYLENBQUM7SUFDTCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDWCxDQUFDO0FBekJlLHFCQUFhLGdCQXlCNUIsQ0FBQTtBQUVEOztJQUVJO0FBQ0o7SUFDSSxvQkFBb0I7SUFDcEIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUVkLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxQixVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzNCLENBQUM7UUFFRCxXQUFXLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNsQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztBQUNMLENBQUM7QUFaZSx1QkFBZSxrQkFZOUIsQ0FBQTtBQUVEOztJQUVJO0FBQ0o7SUFDSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM1QixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDeEIsQ0FBQztBQUNMLENBQUM7QUFKZSxtQkFBVyxjQUkxQixDQUFBO0FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNOLFdBQVcsQ0FBQyxJQUFJLENBQUU7UUFDZCxLQUFLLEVBQUUsQ0FBQztJQUNaLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSDtrQkFBZSxFQUFFLENBQUM7OztBQzdGbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FB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O1FBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUU1QyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDbEQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRWxELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUFDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUFDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNsRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFBQyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFFbEQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQUMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUFDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUFDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUVsRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFBQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFBQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFHckQsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQSxDQUFDO1lBQzFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFD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QUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDdkQsQ0FBQztJQUVELHVCQUF1QixDQUFDLE1BQU0sRUFBRSxLQUFLO1FBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN4RCxDQUFDO0lBRUQsc0JBQXNCO0lBQ3RCLE1BQU07SUFDTixDQUFDO0FBQ0wsQ0FBQztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiXG5cbi8vIG91ciBydW50aW1lXG52YXIgamlibyA9IHJlcXVpcmUoJ2ppYm8nKSxcbiAgICBwcm9qZWN0Um9vdCA9IHJlcXVpcmUoJy4vcHJvamVjdC1yb290JyksXG4gICAgY3VycmVudFRlc3QgPSB1bmRlZmluZWQsXG4gICAgaW50ZXJ2YWxJZCA9IHVuZGVmaW5lZCxcbiAgICB0ZXN0Q2xhc3NlcyA9IFtcbiAgICAgICAgcmVxdWlyZSgnLi90ZXN0cy9iZWdpblRlc3QnKSxcbiAgICAgICAgcmVxdWlyZSgnLi90ZXN0cy9jZW50ZXJUZXN0JyksXG4gICAgICAgIHJlcXVpcmUoJy4vdGVzdHMvdG91Y2hzY3JlZW5UZXN0JyksXG4gICAgICAgIHJlcXVpcmUoJy4vdGVzdHMvZGlzcGxheVRlc3QnKSxcbiAgICAgICAgcmVxdWlyZSgnLi90ZXN0cy9oZWFkVG91Y2hUZXN0JyksXG4gICAgICAgIHJlcXVpcmUoJy4vdGVzdHMvbGVkVGVzdCcpLFxuICAgICAgICByZXF1aXJlKCcuL3Rlc3RzL2ZyZWVBaXJUZXN0JyksXG4gICAgICAgIHJlcXVpcmUoJy4vdGVzdHMvc3RhbGxDV1Rlc3QnKSxcbiAgICAgICAgcmVxdWlyZSgnLi90ZXN0cy9zdGFsbENDV1Rlc3QnKSxcbiAgICAgICAgcmVxdWlyZSgnLi90ZXN0cy9mdWxsQm9keVRlc3QnKSxcbiAgICAgICAgcmVxdWlyZSgnLi90ZXN0cy9iYXR0ZXJ5VGVzdCcpXG4gICAgXTtcblxubGV0IHRlc3RJbmRleCA9IC0xO1xuXG4vKipcbiogRW50cnkgcG9pbnQgZm9yIGRpYWdub3N0aWMgYXBwXG4qKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICB0ZXN0SW5kZXggPSAtMTtcbiAgICBzdGFydE5leHRUZXN0KCk7XG59XG5cbi8qKlxuICogU3RhcnQgYSBzcGVjaWZpYyB0ZXN0IChzaHV0dGluZyBkb3duIGV4aXN0aW5nIHRlc3QgaWYgYXBwbGljYWJsZSlcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydE5leHRUZXN0KCkge1xuICAgIC8vIGV4aXQgb2xkIHRlc3RcbiAgICBzdG9wQ3VycmVudFRlc3QoKTtcblxuICAgICsrdGVzdEluZGV4O1xuICAgIGlmICh0ZXN0SW5kZXggPj0gdGVzdENsYXNzZXMubGVuZ3RoKVxuICAgICAgICByZXR1cm47XG5cbiAgICAvL3dhaXQgYSBiaXQgdG8gY2xlYXIgYW55IHRvdWNoIGV2ZW50cywganVzdCB0byBiZSBzYWZlXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIGNyZWF0ZSBuZXcgdGVzdFxuICAgICAgICBjdXJyZW50VGVzdCA9IG5ldyB0ZXN0Q2xhc3Nlc1t0ZXN0SW5kZXhdKCk7XG5cbiAgICAgICAgLy8gZW50ZXIgbmV3IHRlc3RcbiAgICAgICAgaWYgKGN1cnJlbnRUZXN0KSB7XG4gICAgICAgICAgICBjdXJyZW50VGVzdC5yZWFkUGVyc2lzdGVudERhdGEoKTtcbiAgICAgICAgICAgIGN1cnJlbnRUZXN0LmVudGVyKCk7XG5cbiAgICAgICAgICAgIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudFRlc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRlc3QudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzMpO1xuICAgICAgICB9XG4gICAgfSwgMTUpO1xufVxuXG4vKipcbiAqIFN0b3AgdGhlIGN1cnJlbnQgdGVzdFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3BDdXJyZW50VGVzdCgpIHtcbiAgICAvLyBleGl0IGN1cnJlbnQgdGVzdFxuICAgIGlmIChjdXJyZW50VGVzdCkge1xuXG4gICAgICAgIGlmIChpbnRlcnZhbElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgICBpbnRlcnZhbElkID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFRlc3Qud3JpdGVQZXJzaXN0ZW50RGF0YSgpO1xuICAgICAgICBjdXJyZW50VGVzdC5leGl0KCk7XG4gICAgfVxufVxuXG4vKipcbiAqIE9wdGlvbmFsbHkgaGFuZGxlIGEgdXNlciB0YXBwaW5nIG9yIG1vdXNlLWNsaWNraW5nIG9uIHRoZSBzY3JlZW5cbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGlja1NjcmVlbigpIHtcbiAgICBpZiAoY3VycmVudFRlc3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjdXJyZW50VGVzdC5jbGljaygpO1xuICAgIH1cbn1cblxuamliby5pbml0KCgpID0+IHtcbiAgICBwcm9qZWN0Um9vdC5pbml0KCBmdW5jdGlvbigpe1xuICAgICAgICBzdGFydCgpO1xuICAgIH0pXG59KTtcblxuZXhwb3J0IGRlZmF1bHQge307XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbJzVmMWUyMTQzLWExZmYtNGM0ZC1hNTVlLWI4ZDE2MmVmZGFmMyddLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH0sXG4gICAgICAgICc1ZjFlMjE0My1hMWZmLTRjNGQtYTU1ZS1iOGQxNjJlZmRhZjMnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICc1ZjFlMjE0My1hMWZmLTRjNGQtYTU1ZS1iOGQxNjJlZmRhZjMnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1dhcm0gdXAgZm9yIEFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBbmltYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnYW5pbVBhdGgnOiAnYm9keVdhcm11cC5rZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZyc6IGFuaW1hdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYmxhY2tib2FyZCwgbm90ZXBhZCwgcmVzdWx0LCBlbWl0dGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJzEnOiB7XG4gICAgICAgICAgICAnaWQnOiAnMScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnU2VxdWVuY2UnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogW1xuICAgICAgICAgICAgICAgIDEyLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgMjYsXG4gICAgICAgICAgICAgICAgMjMsXG4gICAgICAgICAgICAgICAgMzZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVjb3JhdG9ycyc6IFtdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMic6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzInLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdMaXN0ZW5FbWJlZGRlZCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdydWxlJzogJ2hleV9qaWJvJyxcbiAgICAgICAgICAgICAgICAgICAgJ29uUmVzdWx0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuU3BlYWtlcnM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDYwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGxpc3RlbmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLm9uKCdoZXktamlibycsIChhc3JSZXN1bHQsIHNwZWFrZXJJZHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLnNwZWVjaFJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhY2tib2FyZC5zZXRMYWJlbCgnaGVhcmQgeW91IHNheSBoZXkgamlibycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMTInOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxMicsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ0V4ZWN1dGVTY3JpcHQnLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnZXhlYyc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsYWNrYm9hcmQuc2V0TGFiZWwoJ1NheSBoZXkgamlibycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXBhZC5zcGVlY2hSZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICcyMyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzIzJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnRXhlY3V0ZVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdleGVjJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxhY2tib2FyZC5zZXRMYWJlbCgnTm93IHNheSB3aGF0ZXZlciB5b3Ugd2FudCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXBhZC50ZXh0SW5kZXBlbmRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICcyNic6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzI2JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnVGltZW91dEpzJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldFRpbWUnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICcyNyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzI3JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMjksXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ0V4ZWN1dGVTY3JpcHQnLFxuICAgICAgICAgICAgICAgICdkZWNvcmF0b3JzJzogWzI4XSxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2V4ZWMnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibGFja2JvYXJkLnNldExhYmVsKCdkaWRuXFwndCBoZWFyIGFueXRoaW5nIGZvciB0ZXh0LWluZGVwZW5kZW50IHNwZWVjaCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzI4JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMjgnLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdDYXNlJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmRpdGlvbmFsJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFub3RlcGFkLk5McmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzI5Jzoge1xuICAgICAgICAgICAgJ2lkJzogJzI5JyxcbiAgICAgICAgICAgICdwYXJlbnQnOiAzNixcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1N3aXRjaCcsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbXG4gICAgICAgICAgICAgICAgMjcsXG4gICAgICAgICAgICAgICAgMzhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICczNic6IHtcbiAgICAgICAgICAgICdpZCc6ICczNicsXG4gICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICAzOSxcbiAgICAgICAgICAgICAgICAyOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWNvcmF0b3JzJzogWzM3XSxcbiAgICAgICAgICAgICdvcHRpb25zJzoge31cbiAgICAgICAgfSxcbiAgICAgICAgJzM3JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMzcnLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdXaGlsZUNvbmRpdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdpbml0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnY29uZGl0aW9uYWwnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICczOCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzM4JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMjksXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ0V4ZWN1dGVTY3JpcHQnLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnZXhlYyc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVwYWQuTkxyZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICczOSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzM5JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMzYsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ0xpc3RlbkpzJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldE9wdGlvbnMnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZXlKaWJvOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRlY3RFbmQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblNwZWFrZXJzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA2MDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhcmdlaW46IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWFrZXJOYW1lOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnZ2V0UnVsZSc6IGNhbGxiYWNrID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCdUb3BHcmFtbWFyID0gJCogSGVsbG8gV29ybGQgJCo7Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdvblJlc3VsdCc6IGxpc3RlbmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLm9uKCdjbG91ZCcsIChhc3JSZXN1bHQsIHNwZWFrZXJJZHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibGFja2JvYXJkLnNldExhYmVsKGFzclJlc3VsdC5JbnB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXBhZC5OTHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICA1LFxuICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVjb3JhdG9ycyc6IFtdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnNSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzUnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdFeGVjdXRlU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2V4ZWMnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLnBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IDAuNSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwLjEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgejogMC4zXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzYnOiB7XG4gICAgICAgICAgICAnaWQnOiAnNicsXG4gICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbXG4gICAgICAgICAgICAgICAgNyxcbiAgICAgICAgICAgICAgICA5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlY29yYXRvcnMnOiBbOF0sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICc3JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnNycsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnZm9sbG93IG15IHZvaWNlJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogNixcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnTG9va0F0JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldFRhcmdldCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBqaWJvID0gcmVxdWlyZSgnamlibycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IGppYm8ubHBzLmdldENsb3Nlc3RBdWRpYmxlRW50aXR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdmFsaWQgPSBlbnRpdHkgIT09IHVuZGVmaW5lZCAmJiBlbnRpdHkuY29uZmlkZW5jZSA+PSAwLjY7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gZW50aXR5LnBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcyA9IG5ldyBqaWJvLmFuaW1hdGUuVEhSRUUuVmVjdG9yMyhwb3MueCwgcG9zLnksIHBvcy56KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3Mubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1ogPSBwb3MuejtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3WiA+IDAuNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdaID0gMC41O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3WiA8IDAuMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdaID0gMC4yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLnBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBwb3MueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogcG9zLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IG5ld1pcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsJykuaW5uZXJIVE1MID0gYEhlYXJkIHlvdSB3aXRoICR7IGVudGl0eS5jb25maWRlbmNlIH0gYXQgJHsgbm90ZXBhZC5wb3NpdGlvbi54LnRvUHJlY2lzaW9uKDMpIH0sICR7IG5vdGVwYWQucG9zaXRpb24ueS50b1ByZWNpc2lvbigzKSB9LCAkeyBub3RlcGFkLnBvc2l0aW9uLnoudG9QcmVjaXNpb24oMykgfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdGVwYWQucG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb25maWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWQgPSBlbnRpdHkuY29uZmlkZW5jZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwnKS5pbm5lckhUTUwgPSBgQ29uZj0keyBjb25maWQgfSBDYW4ndCBoZWFyIHlvdSA6KGA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vdGVwYWQucG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnOCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzgnLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdXaGlsZUNvbmRpdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdpbml0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnY29uZGl0aW9uYWwnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICc5JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnOScsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnd2FpdCBhIGJpdCcsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDYsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1RpbWVvdXRKcycsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdnZXRUaW1lJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDEwMDAgKyAxMDAwICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICA1LFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgMyxcbiAgICAgICAgICAgICAgICA0LFxuICAgICAgICAgICAgICAgIDcsXG4gICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdvcHRpb25zJzoge31cbiAgICAgICAgfSxcbiAgICAgICAgJzInOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcyJyxcbiAgICAgICAgICAgICAgICAnbmFtZSc6ICdoZWFkIGN5Y2xlJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICdzcGluX2hlYWQua2V5cycsXG4gICAgICAgICAgICAgICAgICAgICdjb25maWcnOiBhbmltYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uLnNldFNwZWVkKG5vdGVwYWQuYW5pbVNwZWVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICczJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMycsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAndG9yc28gY3ljbGUnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdQbGF5QW5pbWF0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FuaW1QYXRoJzogJ3NwaW5fdG9yc28ua2V5cycsXG4gICAgICAgICAgICAgICAgICAgICdjb25maWcnOiBhbmltYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uLnNldFNwZWVkKG5vdGVwYWQuYW5pbVNwZWVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICc0JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnNCcsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAncGVsdmlzIGN5Y2xlJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICdzcGluX3BlbHZpcy5rZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZyc6IGFuaW1hdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24uc2V0U3BlZWQobm90ZXBhZC5hbmltU3BlZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzUnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICc1JyxcbiAgICAgICAgICAgICAgICAnbmFtZSc6ICdnZXQgcmFuZG9tIGFuaW0gc3BlZWQnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdFeGVjdXRlU2NyaXB0JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2V4ZWMnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLmFuaW1TcGVlZCA9IHBhcnNlRmxvYXQoTWF0aC5yYW5kb20oKSAqICgwLjc1IC0gMC42KSArIDAuNikudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMycpLmlubmVySFRNTCA9ICdhbmltIHNwZWVkOiAnICsgbm90ZXBhZC5hbmltU3BlZWQgKiAxMDAgKyAnJSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnNic6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzYnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ3Jlc3QgZm9yIDMwIHNlY3MnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdUaW1lb3V0SnMnLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnZ2V0VGltZSc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMycpLmlubmVySFRNTCA9ICdyZXN0aW5nIGZvciA1IHNlY3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDUwMDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnNyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzcnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ3R3aXN0IGV2ZXJ5dGhpbmcnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdQbGF5QW5pbWF0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FuaW1QYXRoJzogJ3R3aXN0LmtleXMnLFxuICAgICAgICAgICAgICAgICAgICAnY29uZmlnJzogYW5pbWF0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFsnNWVmYjQ5ODctZDQ4NC00ZDU4LWJjNTAtYTJhYmFiZDhjYjhlJ10sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfSxcbiAgICAgICAgJzVlZmI0OTg3LWQ0ODQtNGQ1OC1iYzUwLWEyYWJhYmQ4Y2I4ZSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzVlZmI0OTg3LWQ0ODQtNGQ1OC1iYzUwLWEyYWJhYmQ4Y2I4ZScsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnRnVsbCBib2R5IGFuaW1hdGlvbiBvZiBhbGwgMyBheGVzJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICdmdWxsQm9keVNwaW4ua2V5cycsXG4gICAgICAgICAgICAgICAgICAgICdjb25maWcnOiBhbmltYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFsnZWQ4ZjdkOTAtMTQ4OS00N2JjLTg0NTktYjQxMmM1YzAzYWExJ10sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfSxcbiAgICAgICAgJ2VkOGY3ZDkwLTE0ODktNDdiYy04NDU5LWI0MTJjNWMwM2FhMSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJ2VkOGY3ZDkwLTE0ODktNDdiYy04NDU5LWI0MTJjNWMwM2FhMScsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnU3BpbiBoZWFkIGFuZCBwZWx2aXMgb3Bwb3NpdGUgZGlyZWN0aW9ucyAzNjAgZGVncmVlcycsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBbmltYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnYW5pbVBhdGgnOiAnbGVkLXRlc3QtYW5pbWF0aW9uLmtleXMnLFxuICAgICAgICAgICAgICAgICAgICAnY29uZmlnJzogYW5pbWF0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMyc6IHtcbiAgICAgICAgICAgICdpZCc6ICczJyxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1BhcmFsbGVsJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICAxOSxcbiAgICAgICAgICAgICAgICAxNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWNvcmF0b3JzJzogW10sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHsgJ3N1Y2NlZWRPbk9uZSc6IGZhbHNlIH1cbiAgICAgICAgfSxcbiAgICAgICAgJzE2Jzoge1xuICAgICAgICAgICAgJ2lkJzogJzE2JyxcbiAgICAgICAgICAgICdwYXJlbnQnOiAzLFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnU2VxdWVuY2UnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogW1xuICAgICAgICAgICAgICAgIDE4LFxuICAgICAgICAgICAgICAgIDE3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlY29yYXRvcnMnOiBbMjNdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMTcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxNycsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnQ2hvb3NlIHBsYWNlIHRvIGxvb2snLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxNixcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnTG9va0F0JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldFRhcmdldCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB4ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB5ID0gMSAtIDIgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHogPSAwLjcgKyAwLjUgKiAoMSAtIDIgKiBNYXRoLnJhbmRvbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IHpcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMTgnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxOCcsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnUGF1c2UgZm9yIGEgYml0JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMTYsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1RpbWVvdXRKcycsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdnZXRUaW1lJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDEwMDAgKyAyMDAwICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICcxOSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxOScsXG4gICAgICAgICAgICAncGFyZW50JzogMyxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICAyMSxcbiAgICAgICAgICAgICAgICAyMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdkZWNvcmF0b3JzJzogWzIyXSxcbiAgICAgICAgICAgICdvcHRpb25zJzoge31cbiAgICAgICAgfSxcbiAgICAgICAgJzIwJzoge1xuICAgICAgICAgICAgJ2lkJzogJzIwJyxcbiAgICAgICAgICAgICdwYXJlbnQnOiAxOSxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ0JsaW5rJyxcbiAgICAgICAgICAgICdvcHRpb25zJzoge31cbiAgICAgICAgfSxcbiAgICAgICAgJzIxJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMjEnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1BhdXNlIGZvciBhIGJpdCcsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDE5LFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdUaW1lb3V0SnMnLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnZ2V0VGltZSc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAyMDAwICsgMjUwMCAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMjInOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcyMicsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1doaWxlQ29uZGl0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2luaXQnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdjb25kaXRpb25hbCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzIzJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMjMnLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdXaGlsZUNvbmRpdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdpbml0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnY29uZGl0aW9uYWwnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ25hbWUnOiAnc2VxdWVuY2Ugb2YgYmxpbmtzIGFuZCBsb29rQXRzIHRoYXQgd2lsbCBydW4gYW4gaWRsZSBmb3IgfjQgbWlucycsXG4gICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbXG4gICAgICAgICAgICAgICAgNSxcbiAgICAgICAgICAgICAgICA3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMyc6IHtcbiAgICAgICAgICAgICdpZCc6ICczJyxcbiAgICAgICAgICAgICduYW1lJzogJ2xvb2sgYXQgcmFuZG9tIHNwb3RzJyxcbiAgICAgICAgICAgICdwYXJlbnQnOiA3LFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnU2VxdWVuY2UnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogW1xuICAgICAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAgICAgMTM0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlY29yYXRvcnMnOiBbNF0sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICc0JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnNCcsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1doaWxlQ29uZGl0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2luaXQnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdjb25kaXRpb25hbCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3RlcGFkLnJ1bm5pbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnNSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzUnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ2luaXRpYWxpemUgb3VyIHZhcmlhYmxlcycsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ0V4ZWN1dGVTY3JpcHQnLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnZXhlYyc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVwYWQucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLnJlc3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVwYWQuY3ljbGVMZW5ndGggPSAyNDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLmhyU3RhcnQgPSBwcm9jZXNzLmhydGltZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXBhZC5oclJlc3RTdGFydCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnNyc6IHtcbiAgICAgICAgICAgICdpZCc6ICc3JyxcbiAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnUGFyYWxsZWwnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogW1xuICAgICAgICAgICAgICAgIDM4LFxuICAgICAgICAgICAgICAgIDIxLFxuICAgICAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgICAgIDIzLFxuICAgICAgICAgICAgICAgIDNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHsgJ3N1Y2NlZWRPbk9uZSc6IGZhbHNlIH1cbiAgICAgICAgfSxcbiAgICAgICAgJzgnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICc4JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMyxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnVGltZW91dEpzJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldFRpbWUnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTUwMCArIDE1MDAgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzEwJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEwJyxcbiAgICAgICAgICAgICduYW1lJzogJ2JsaW5rIHJhbmRvbWx5JyxcbiAgICAgICAgICAgICdwYXJlbnQnOiA3LFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnU2VxdWVuY2UnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogW1xuICAgICAgICAgICAgICAgIDE1LFxuICAgICAgICAgICAgICAgIDE2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlY29yYXRvcnMnOiBbMTFdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMTEnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxMScsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1doaWxlQ29uZGl0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2luaXQnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdjb25kaXRpb25hbCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3RlcGFkLnJ1bm5pbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMTUnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxNScsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEwLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdUaW1lb3V0SnMnLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnZ2V0VGltZSc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAyMDAwICsgMTUwMCAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMTYnOiB7XG4gICAgICAgICAgICAnaWQnOiAnMTYnLFxuICAgICAgICAgICAgJ3BhcmVudCc6IDEwLFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnQmxpbmsnLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMTcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxNycsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEzNCxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnTG9va0F0JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldFRhcmdldCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB4ID0gMSAtIDIgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHkgPSAxIC0gMiAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeiA9IDAuNyArIDAuNSAqICgxIC0gMiAqIE1hdGgucmFuZG9tKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgejogelxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICcxOCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzE4JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMjEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ0V4ZWN1dGVTY3JpcHQnLFxuICAgICAgICAgICAgICAgICdkZWNvcmF0b3JzJzogW10sXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdleGVjJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRpbWVEaWZmID0gcHJvY2Vzcy5ocnRpbWUobm90ZXBhZC5oclN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMycpLmlubmVySFRNTCA9ICdhbmltYXRpbmcgdGltZTogJyArIHRpbWVEaWZmWzBdICsgJ3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVEaWZmWzBdID49IG5vdGVwYWQuY3ljbGVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICcyMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcyMScsXG4gICAgICAgICAgICAnbmFtZSc6ICd1cGRhdGUgdGltZXInLFxuICAgICAgICAgICAgJ3BhcmVudCc6IDcsXG4gICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbMThdLFxuICAgICAgICAgICAgJ2RlY29yYXRvcnMnOiBbMjJdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMjInOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcyMicsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1doaWxlQ29uZGl0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2luaXQnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdjb25kaXRpb25hbCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub3RlcGFkLnJ1bm5pbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMjMnOiB7XG4gICAgICAgICAgICAnaWQnOiAnMjMnLFxuICAgICAgICAgICAgJ25hbWUnOiAnY29sb3IgTEVEIHJhbmRvbWx5JyxcbiAgICAgICAgICAgICdwYXJlbnQnOiA3LFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnU2VxdWVuY2UnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogW1xuICAgICAgICAgICAgICAgIDI4LFxuICAgICAgICAgICAgICAgIDI5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ2RlY29yYXRvcnMnOiBbMjRdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMjQnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcyNCcsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEzLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdXaGlsZUNvbmRpdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdpbml0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnY29uZGl0aW9uYWwnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm90ZXBhZC5ydW5uaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzI4JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMjgnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAyMyxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnVGltZW91dEpzJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldFRpbWUnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTAwMCArIDEwMDAgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzI5JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMjknLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAyMyxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnRXhlY3V0ZVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdleGVjJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpIC8gMjU1O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGcgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpIC8gMjU1O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpIC8gMjU1O1xuICAgICAgICAgICAgICAgICAgICAgICAgamliby5hbmltYXRlLnNldExFRENvbG9yKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMzgnOiB7XG4gICAgICAgICAgICAnaWQnOiAnMzgnLFxuICAgICAgICAgICAgJ25hbWUnOiAncmVzdGluZycsXG4gICAgICAgICAgICAncGFyZW50JzogNyxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICAxMTgsXG4gICAgICAgICAgICAgICAgNjhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVjb3JhdG9ycyc6IFs2N10sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICc2Nyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzY3JyxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnU3RhcnRPbkNvbmRpdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdpbml0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnY29uZGl0aW9uYWwnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIW5vdGVwYWQucnVubmluZyAmJiAhbm90ZXBhZC5yZXN0aW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzY4JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnNjgnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAzOCxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnRXhlY3V0ZVNjcmlwdCcsXG4gICAgICAgICAgICAgICAgJ2RlY29yYXRvcnMnOiBbMTE5XSxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2V4ZWMnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdFRpbWVEaWZmID0gcHJvY2Vzcy5ocnRpbWUobm90ZXBhZC5oclJlc3RTdGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDMnKS5pbm5lckhUTUwgPSAncmVzdGluZyB0aW1lOiAnICsgcmVzdFRpbWVEaWZmWzBdICsgJ3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3RUaW1lRGlmZlswXSA+PSBub3RlcGFkLmN5Y2xlTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZXBhZC5yZXN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnMTE4JzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMTE4JyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMzgsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ0V4ZWN1dGVTY3JpcHQnLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnZXhlYyc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVwYWQucmVzdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlcGFkLmhyUmVzdFN0YXJ0ID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICcxMTknOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxMTknLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdXaGlsZUNvbmRpdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdpbml0JzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnY29uZGl0aW9uYWwnOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm90ZXBhZC5yZXN0aW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzEyMCc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxMjAnLFxuICAgICAgICAgICAgJ3BhcmVudCc6IDEyOCxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBdWRpbycsXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHsgJ2F1ZGlvUGF0aCc6ICdGWF9CbGVlcC5tcDMnIH1cbiAgICAgICAgfSxcbiAgICAgICAgJzEyNCc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxMjQnLFxuICAgICAgICAgICAgJ3BhcmVudCc6IDEyOCxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBdWRpbycsXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHsgJ2F1ZGlvUGF0aCc6ICdGWF9CbGlwLm1wMycgfVxuICAgICAgICB9LFxuICAgICAgICAnMTI4Jzoge1xuICAgICAgICAgICAgJ2lkJzogJzEyOCcsXG4gICAgICAgICAgICAncGFyZW50JzogMTM0LFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnUmFuZG9tJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICAxMjQsXG4gICAgICAgICAgICAgICAgMTI5LFxuICAgICAgICAgICAgICAgIDEyMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICdvcHRpb25zJzoge31cbiAgICAgICAgfSxcbiAgICAgICAgJzEyOSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxMjknLFxuICAgICAgICAgICAgJ3BhcmVudCc6IDEyOCxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBdWRpbycsXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHsgJ2F1ZGlvUGF0aCc6ICdGWF9CbG9vcC5tcDMnIH1cbiAgICAgICAgfSxcbiAgICAgICAgJzEzNCc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxMzQnLFxuICAgICAgICAgICAgJ3BhcmVudCc6IDMsXG4gICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbXG4gICAgICAgICAgICAgICAgMTI4LFxuICAgICAgICAgICAgICAgIDE3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxJyxcbiAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFtcbiAgICAgICAgICAgICAgICA0LFxuICAgICAgICAgICAgICAgIDZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAnZGVjb3JhdG9ycyc6IFtdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnNCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzQnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1BsYXkgYSBncmVldGluZycsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBbmltYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnYW5pbVBhdGgnOiAnZ3JlZXRpbmcua2V5cycsXG4gICAgICAgICAgICAgICAgICAgICdjb25maWcnOiBhbmltYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJzYnOiB7XG4gICAgICAgICAgICAnaWQnOiAnNicsXG4gICAgICAgICAgICAnbmFtZSc6ICdCYXdob29wJyxcbiAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnUGxheUF1ZGlvJyxcbiAgICAgICAgICAgICdvcHRpb25zJzogeyAnYXVkaW9QYXRoJzogJ0ZYX0Jhd2hvb3AubXAzJyB9XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFsyXSxcbiAgICAgICAgICAgICdvcHRpb25zJzoge31cbiAgICAgICAgfSxcbiAgICAgICAgJzInOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcyJyxcbiAgICAgICAgICAgICAgICAnbmFtZSc6ICdTcGluIG5lY2sgMzYwIGRlZ3JlZXMgQ0NXJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICduZWNrMzYwQ0NXLmtleXMnLFxuICAgICAgICAgICAgICAgICAgICAnY29uZmlnJzogYW5pbWF0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICdtZXRhJzogeyAndmVyc2lvbic6IDEgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFsyXSxcbiAgICAgICAgICAgICdvcHRpb25zJzoge31cbiAgICAgICAgfSxcbiAgICAgICAgJzInOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcyJyxcbiAgICAgICAgICAgICAgICAnbmFtZSc6ICdTcGluIG5lY2sgMzYwIGRlZ3JlZXMgQ1cnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdQbGF5QW5pbWF0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FuaW1QYXRoJzogJ25lY2szNjBDVy5rZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZyc6IGFuaW1hdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbJ2U0ODNlMDRiLWNhNTUtNDM1Yy05YzY5LTU1NGI1ZjQxNzAyZiddLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH0sXG4gICAgICAgICdlNDgzZTA0Yi1jYTU1LTQzNWMtOWM2OS01NTRiNWY0MTcwMmYnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICdlNDgzZTA0Yi1jYTU1LTQzNWMtOWM2OS01NTRiNWY0MTcwMmYnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1NwaW4gbmVjayAzNjAgZGVncmVlcyBib3RoIHdheXMnLFxuICAgICAgICAgICAgICAgICdwYXJlbnQnOiAxLFxuICAgICAgICAgICAgICAgICdhc3NldC1wYWNrJzogJ2NvcmUnLFxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdQbGF5QW5pbWF0aW9uJyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2FuaW1QYXRoJzogJ25lY2szNjBCb3RoLmtleXMnLFxuICAgICAgICAgICAgICAgICAgICAnY29uZmlnJzogYW5pbWF0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbMl0sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICcyJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMicsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnU3BpbiBwZWx2aXMgMzYwIGRlZ3JlZXMgQ0NXJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICdwZWx2aXMzNjBDQ1cua2V5cycsXG4gICAgICAgICAgICAgICAgICAgICdjb25maWcnOiBhbmltYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJ21ldGEnOiB7ICd2ZXJzaW9uJzogMSB9XG4gICAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYmxhY2tib2FyZCwgbm90ZXBhZCwgcmVzdWx0LCBlbWl0dGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJzEnOiB7XG4gICAgICAgICAgICAnaWQnOiAnMScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnU2VxdWVuY2UnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogWzJdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMic6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzInLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1NwaW4gcGVsdmlzIDM2MCBkZWdyZWVzIENXJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICdwZWx2aXMzNjBDVy5rZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZyc6IGFuaW1hdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbJzY4YzY1MzBlLTM4YTItNDg0ZS1iYzNkLWIxOTlmYjE2YjgyNSddLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH0sXG4gICAgICAgICc2OGM2NTMwZS0zOGEyLTQ4NGUtYmMzZC1iMTk5ZmIxNmI4MjUnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICc2OGM2NTMwZS0zOGEyLTQ4NGUtYmMzZC1iMTk5ZmIxNmI4MjUnLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1NwaW4gcGVsdmlzIDM2MCBkZWdyZWVzIGJvdGggd2F5cycsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBbmltYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnYW5pbVBhdGgnOiAncGVsdmlzMzYwQm90aC5rZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZyc6IGFuaW1hdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYmxhY2tib2FyZCwgbm90ZXBhZCwgcmVzdWx0LCBlbWl0dGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJzEnOiB7XG4gICAgICAgICAgICAnaWQnOiAnMScsXG4gICAgICAgICAgICAnY2xhc3MnOiAnU2VxdWVuY2UnLFxuICAgICAgICAgICAgJ2NoaWxkcmVuJzogWzJdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMic6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2lkJzogJzInLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1NwaW4gdG9yc28gMzYwIGRlZ3JlZXMgQ0NXJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICd0b3JzbzM2MENDVy5rZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZyc6IGFuaW1hdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbMl0sXG4gICAgICAgICAgICAnb3B0aW9ucyc6IHt9XG4gICAgICAgIH0sXG4gICAgICAgICcyJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnaWQnOiAnMicsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnU3BpbiB0b3JzbyAzNjAgZGVncmVlcyBDVycsXG4gICAgICAgICAgICAgICAgJ3BhcmVudCc6IDEsXG4gICAgICAgICAgICAgICAgJ2Fzc2V0LXBhY2snOiAnY29yZScsXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ1BsYXlBbmltYXRpb24nLFxuICAgICAgICAgICAgICAgICdvcHRpb25zJzoge1xuICAgICAgICAgICAgICAgICAgICAnYW5pbVBhdGgnOiAndG9yc28zNjBDVy5rZXlzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbmZpZyc6IGFuaW1hdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH1cbiAgICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChibGFja2JvYXJkLCBub3RlcGFkLCByZXN1bHQsIGVtaXR0ZXIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAnMSc6IHtcbiAgICAgICAgICAgICdpZCc6ICcxJyxcbiAgICAgICAgICAgICdjbGFzcyc6ICdTZXF1ZW5jZScsXG4gICAgICAgICAgICAnY2hpbGRyZW4nOiBbJ2FkMDNjZjc3LThmMmMtNGI2ZC05YmJlLTkxMjllMWNjMDFkMiddLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnbWV0YSc6IHsgJ3ZlcnNpb24nOiAxIH0sXG4gICAgICAgICdhZDAzY2Y3Ny04ZjJjLTRiNmQtOWJiZS05MTI5ZTFjYzAxZDInOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICdhZDAzY2Y3Ny04ZjJjLTRiNmQtOWJiZS05MTI5ZTFjYzAxZDInLFxuICAgICAgICAgICAgICAgICduYW1lJzogJ1NwaW4gdG9yc28gMzYwIGRlZ3JlZXMgYm90aCB3YXlzJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnUGxheUFuaW1hdGlvbicsXG4gICAgICAgICAgICAgICAgJ29wdGlvbnMnOiB7XG4gICAgICAgICAgICAgICAgICAgICdhbmltUGF0aCc6ICd0b3JzbzM2MEJvdGgua2V5cycsXG4gICAgICAgICAgICAgICAgICAgICdjb25maWcnOiBhbmltYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJsYWNrYm9hcmQsIG5vdGVwYWQsIHJlc3VsdCwgZW1pdHRlcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICcxJzoge1xuICAgICAgICAgICAgJ2lkJzogJzEnLFxuICAgICAgICAgICAgJ2NsYXNzJzogJ1NlcXVlbmNlJyxcbiAgICAgICAgICAgICdjaGlsZHJlbic6IFsxMV0sXG4gICAgICAgICAgICAnZGVjb3JhdG9ycyc6IFtdLFxuICAgICAgICAgICAgJ29wdGlvbnMnOiB7fVxuICAgICAgICB9LFxuICAgICAgICAnMTEnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdpZCc6ICcxMScsXG4gICAgICAgICAgICAgICAgJ25hbWUnOiAnZm9sbG93IG1lIHdpdGggYSBjb250aW51b3VzIGxvb2sgYXQhJyxcbiAgICAgICAgICAgICAgICAncGFyZW50JzogMSxcbiAgICAgICAgICAgICAgICAnYXNzZXQtcGFjayc6ICdjb3JlJyxcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnTG9va0F0JyxcbiAgICAgICAgICAgICAgICAnb3B0aW9ucyc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2dldFRhcmdldCc6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBqaWJvID0gcmVxdWlyZSgnamlibycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IGppYm8ubHBzLmdldENsb3Nlc3RWaXN1YWxFbnRpdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLjUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMC4xLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IDAuNFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRpdHkgJiYgZW50aXR5LnBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmF5c0RhdGEgPSBlbnRpdHkucGFydHNbMF0udmFsdWUucmF5cztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmF5c0RhdGEgIT09IHVuZGVmaW5lZCAmJiByYXlzRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsJykuaW5uZXJIVE1MID0gJ0ZvdW5kIHlvdSA6KSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvcmlnaW4gPSBlbnRpdHkucGFydHNbMF0udmFsdWUucmF5c1swXS5vcmlnaW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXIgPSBlbnRpdHkucGFydHNbMF0udmFsdWUucmF5c1swXS5kaXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZGlyLnggKyBvcmlnaW4ueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGRpci55ICsgb3JpZ2luLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6OiBkaXIueiArIG9yaWdpbi56XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsJykuaW5uZXJIVE1MID0gYEZvdW5kIHlvdSBhdCAkeyBwb3NpdGlvbi54LnRvUHJlY2lzaW9uKDMpIH0sICR7IHBvc2l0aW9uLnkudG9QcmVjaXNpb24oMykgfSwgJHsgcG9zaXRpb24uei50b1ByZWNpc2lvbigzKSB9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsJykuaW5uZXJIVE1MID0gJ0xvc3QgeW91IDooJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ2lzQ29udGludW91cyc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdjb25maWcnOiBsb29rQXQgPT4ge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJ21ldGEnOiB7ICd2ZXJzaW9uJzogMSB9XG4gICAgfTtcbn07IiwiZXhwb3J0IGRlZmF1bHQge1xuICAgIFwiYXNyLXRlc3RcIjogcmVxdWlyZSgnLi9iZWhhdmlvcnMvYXNyLXRlc3QnKSxcbiAgICBcImF1ZGlvLXRyYWNraW5nXCI6IHJlcXVpcmUoJy4vYmVoYXZpb3JzL2F1ZGlvLXRyYWNraW5nJyksXG4gICAgXCJib2R5XCI6IHJlcXVpcmUoJy4vYmVoYXZpb3JzL2JvZHknKSxcbiAgICBcImZ1bGxCb2R5QW5pbWF0aW9uXCI6IHJlcXVpcmUoJy4vYmVoYXZpb3JzL2Z1bGxCb2R5QW5pbWF0aW9uJyksXG4gICAgXCJoZWFkLUNDVy1wZWx2aXMtQ1dcIjogcmVxdWlyZSgnLi9iZWhhdmlvcnMvaGVhZC1DQ1ctcGVsdmlzLUNXJyksXG4gICAgXCJpZGxlXCI6IHJlcXVpcmUoJy4vYmVoYXZpb3JzL2lkbGUnKSxcbiAgICBcImxpZmVjeWNsZVwiOiByZXF1aXJlKCcuL2JlaGF2aW9ycy9saWZlY3ljbGUnKSxcbiAgICBcIm1haW5cIjogcmVxdWlyZSgnLi9iZWhhdmlvcnMvbWFpbicpLFxuICAgIFwibmVjay1zcGluLTM2MC1DV1wiOiByZXF1aXJlKCcuL2JlaGF2aW9ycy9uZWNrLXNwaW4tMzYwLUNXJyksXG4gICAgXCJuZWNrLXNwaW4tMzYwLUNDV1wiOiByZXF1aXJlKCcuL2JlaGF2aW9ycy9uZWNrLXNwaW4tMzYwLUNDVycpLFxuICAgIFwibmVjay1zcGluLWJvdGhcIjogcmVxdWlyZSgnLi9iZWhhdmlvcnMvbmVjay1zcGluLWJvdGgnKSxcbiAgICBcInBlbHZpcy1zcGluLTM2MC1DQ1dcIjogcmVxdWlyZSgnLi9iZWhhdmlvcnMvcGVsdmlzLXNwaW4tMzYwLUNDVycpLFxuICAgIFwicGVsdmlzLXNwaW4tMzYwLUNXXCI6IHJlcXVpcmUoJy4vYmVoYXZpb3JzL3BlbHZpcy1zcGluLTM2MC1DVycpLFxuICAgIFwicGVsdmlzLXNwaW4tYm90aFwiOiByZXF1aXJlKCcuL2JlaGF2aW9ycy9wZWx2aXMtc3Bpbi1ib3RoJyksXG4gICAgXCJ0b3Jzby1zcGluLTM2MC1DQ1dcIjogcmVxdWlyZSgnLi9iZWhhdmlvcnMvdG9yc28tc3Bpbi0zNjAtQ0NXJyksXG4gICAgXCJ0b3Jzby1zcGluLTM2MC1DV1wiOiByZXF1aXJlKCcuL2JlaGF2aW9ycy90b3Jzby1zcGluLTM2MC1DVycpLFxuICAgIFwidG9yc28tc3Bpbi1ib3RoXCI6IHJlcXVpcmUoJy4vYmVoYXZpb3JzL3RvcnNvLXNwaW4tYm90aCcpLFxuICAgIFwidHJhY2tpbmdcIjogcmVxdWlyZSgnLi9iZWhhdmlvcnMvdHJhY2tpbmcnKSxcbiAgICBcIldhcm1VcE1vdmVtZW50c1wiOiByZXF1aXJlKCcuL2JlaGF2aW9ycy9XYXJtVXBNb3ZlbWVudHMnKVxufTtcbiIsImxldCBqaWJvID0gcmVxdWlyZSgnamlibycpO1xuXG5cbmZ1bmN0aW9uIGdldExpc3RlbmVyV3JhcHBlcihjYWxsYmFjaykge1xuICAgIHJldHVybiAoZXYpID0+IHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgLyoqXG4gICAgICogSGVscGVyIG1ldGhvZCB0byBzZXQgcm9ib3QgdG8gMC1wb3NpdGlvbiBhbmQgY2xlYXIgb3V0IHRoZSBMRURcbiAgICAgKiovXG4gICAgY2VudGVyUm9ib3QoKSB7XG4gICAgICAgIC8vIGluZGV4IHBvc2l0aW9uXG4gICAgICAgIGxldCBhbmltVXRpbHMgPSBqaWJvLmFuaW1hdGUuY2VudGVyUm9ib3QoKTtcbiAgICAgICAgdGhpcy5yZXNldExFRCgpO1xuICAgIH0sXG5cbiAgICByZXNldExFRCgpIHtcbiAgICAgICAgamliby5hbmltYXRlLnNldExFRENvbG9yKFswLDAsMF0pO1xuICAgIH0sXG5cbiAgICBzZXRMRUQocmJnQXJyYXkpIHtcbiAgICAgICAgamliby5hbmltYXRlLnNldExFRENvbG9yKHJiZ0FycmF5KTtcbiAgICB9LFxuXG4gICAgLy9mdW5jdGlvbiB0byBuZWF0bHkgc2V0IHRlc3QgbGFiZWwgMSwyLDMgdGV4dFxuICAgIF9zZXRTY3JlZW5UZXh0KG1lc3MxLCBtZXNzMiA9IFwiXCIsIG1lc3MzID0gXCJcIiwgbWVzczQgPSBcIlwiKXtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwxJykuaW5uZXJIVE1MID0gbWVzczE7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMicpLmlubmVySFRNTCA9IG1lc3MyO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDMnKS5pbm5lckhUTUwgPSBtZXNzMztcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWw0JykuaW5uZXJIVE1MID0gbWVzczQ7XG4gICAgfSxcblxuICAgIC8vcmVtb3ZlIGEgYnV0dG9uIGZyb20gYSBzY3JlZW4gcXVpY2tseVxuICAgIF9jbGVhckJ1dHRvbkZyb21TY3JlZW4oYnV0dG9uQXJyKXtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidXR0b25BcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKGJ1dHRvbkFycltpXSAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICBsZXQgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uQXJyW2ldKTtcbiAgICAgICAgICAgICAgICBidXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAvL2NsZWFyIGxpc3RlbmVyc1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5vbm1vdXNlZG93biA9IGJ1dHRvbi5vbnRvdWNoc3RhcnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vc2V0IGJ1dHRvbiBvbiBzY3JlZW4gd2l0aCBsb2NhdGlvbiwgdG91Y2ggY2FsbGJhY2ssIGFuZCBvcHRpb25hbGx5IHRleHRcbiAgICBfc2hvd0J1dHRvbihidXR0b24sIG1SLCBtVCwgY2FsbGJhY2ssIGNvbnRlbnQgPSBudWxsKXtcbiAgICAgICAgbGV0IHRlbXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChidXR0b24pO1xuICAgICAgICB0ZW1wLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB0ZW1wLnN0eWxlLm1hcmdpblJpZ2h0ID0gbVI7XG4gICAgICAgIHRlbXAuc3R5bGUubWFyZ2luVG9wID0gbVQ7XG4gICAgICAgIGlmIChjYWxsYmFjaylcbiAgICAgICAgICAgIHRlbXAub25tb3VzZWRvd24gPSB0ZW1wLm9udG91Y2hzdGFydCA9IGdldExpc3RlbmVyV3JhcHBlcihjYWxsYmFjayk7XG4gICAgICAgIGlmIChjb250ZW50ICE9IG51bGwpXG4gICAgICAgICAgICB0ZW1wLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgfSxcblxuICAgIF9hZGRCdXR0b25MaXN0ZW5lcihidXR0b24sIGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCB0ZW1wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnV0dG9uKTtcbiAgICAgICAgdGVtcC5vbm1vdXNlZG93biA9IHRlbXAub250b3VjaHN0YXJ0ID0gZ2V0TGlzdGVuZXJXcmFwcGVyKGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgX3JlbW92ZUJ1dHRvbkxpc3RlbmVyKGJ1dHRvbikge1xuICAgICAgICBsZXQgdGVtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJ1dHRvbik7XG4gICAgICAgIHRlbXAub25tb3VzZWRvd24gPSB0ZW1wLm9udG91Y2hzdGFydCA9IG51bGw7XG4gICAgfSxcblxuICAgIC8vZnVuY3Rpb24gdG8gbmVhdGx5IHNldCBiYWNrZ3JvdW5kIHRvIHRlc3QgaW1hZ2VzIG9yIGNsZWFyIGJhY2tncm91bmRcbiAgICBfc2V0U2hvd0JhY2tncm91bmQoc2hvdywgc291cmNlKSB7XG4gICAgICAgIGxldCBia2cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFja2dyb3VuZCcpO1xuICAgICAgICBia2cuc3JjID0gc291cmNlO1xuICAgICAgICBia2cuc3R5bGUudmlzaWJpbGl0eSA9IChzaG93ID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpO1xuICAgIH0sXG5cbiAgICBfc2V0UGFzc0ZhaWxCdXR0b25zKHBCLCBmQiwgbW9kZSl7XG4gICAgICAgIHBCLmNsYXNzTGlzdC5yZW1vdmUoJ3N1Y2Nlc3MnLCAnZmFpbHVyZScsICdjbGVhcicpO1xuICAgICAgICBmQi5jbGFzc0xpc3QucmVtb3ZlKCdzdWNjZXNzJywgJ2ZhaWx1cmUnLCAnY2xlYXInKTtcbiAgICAgICAgLy8nc3VjY2VzcycsICdmYWlsdXJlJywgYW5kICdjbGVhcicgYXJlIGFsbCByZWNvZ25pemVkIGNsYXNzZXMgaW4gdGhlIENTU1xuICAgICAgICBwQi5jbGFzc0xpc3QuYWRkKG1vZGUpO1xuICAgICAgICBmQi5jbGFzc0xpc3QuYWRkKG1vZGUpO1xuICAgIH0sXG5cbiAgICBfc2V0Qm9keVNlZ0luZGV4KGJvZHkpe1xuICAgICAgICB2YXIgaW5kZXggPSAtMTtcbiAgICAgICAgaWYoYm9keSA9PSAnbmVjaycpe1xuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoYm9keSA9PSAndG9yc28nKXtcbiAgICAgICAgICAgIGluZGV4ID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGJvZHkgPT0gJ3BlbHZpcycpe1xuICAgICAgICAgICAgaW5kZXggPSAyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleFxuICAgIH1cbn1cbiIsImltcG9ydCBNYWluID0gcmVxdWlyZSgnLi9hcHAnKTtcbmV4cG9ydCA9IE1haW47XG4iLCJ2YXIgamlibyA9IHJlcXVpcmUoJ2ppYm8nKSxcbiAgICBwcm9qZWN0Um9vdDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdChjYil7XG4gICAgICAgIGppYm8udXRpbHMuUGF0aFV0aWxzLmdldFByb2plY3RSb290KCBmdW5jdGlvbihfcHJvamVjdFJvb3QpIHtcbiAgICAgICAgICAgIHByb2plY3RSb290ID0gX3Byb2plY3RSb290O1xuICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldCgpe1xuICAgICAgICByZXR1cm4gcHJvamVjdFJvb3Q7XG4gICAgfVxufSIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCBkaWFnbm9zdGljIHRlc3RzXG4gKi9cbmxldCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5sZXQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbi8vIGxldCBDb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbicpO1xuXG5sZXQgc3RhdHNQYXRoID0gcGF0aC5qb2luKGdsb2JhbC5fX2Rpcm5hbWUsIFwiL3N0eWxlcy9maW5Hb29kc1NraWxsLmxvZ1wiKTtcblxuY2xhc3MgQmFzZVRlc3Qge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vIGxvZyBkYXRhXG4gICAgICAgIHRoaXMubG9nS2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxvZ0RhdGEgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gUmVxdWlyZWQgKHN0YXJ0IHRlc3QpXG4gICAgZW50ZXIoKSB7XG4gICAgICAgIHRocm93IFwiSW1wbGVtZW50IGVudGVyXCI7XG4gICAgfVxuXG4gICAgLy8gUmVxdWlyZWQgKGRvIHlvdXIgY2xlYW4gdXAgaGVyZSlcbiAgICBleGl0KCkge1xuICAgICAgICB0aHJvdyBcIkltcGxlbWVudCBleGl0XCI7XG4gICAgfVxuXG4gICAgLy8gT3B0aW9uYWxseSBkbyBzdHVmZiBpbiBhbiB1cGRhdGUgaW50ZXJ2YWxcbiAgICB1cGRhdGUoKSB7XG4gICAgICAgLy8gdGhyb3cgXCJJbXBsZW1lbnQgdXBkYXRlXCI7XG4gICAgfVxuXG4gICAgLy8gT3B0aW9uYWxseSBoYW5kbGUgYSB1c2VyIHRhcHBpbmcgb3IgbW91c2UtY2xpY2tpbmcgdGhlIHNjcmVlblxuICAgIGNsaWNrKCkge1xuXG4gICAgfVxuXG4gICAgLy8gbG9nZ2luZyBzdHVmZi4uLlxuICAgIC8vXG4gICAgLy8gYXR0ZW1wdCB0byByZWFkIHBlcnNpc3RlbnQgZGF0YSBpZiBsb2dLZXkgaXMgZGVmaW5lZDsgdGhpcyBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCAqYmVmb3JlKiBlbnRlciFcbiAgICByZWFkUGVyc2lzdGVudERhdGEoKSB7XG4gICAgICAgIGlmICghdGhpcy5sb2dLZXkgfHwgKCFmcy5leGlzdHNTeW5jKHN0YXRzUGF0aCkpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIG5vdGhpbmcgdG8gcmVhZFxuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIExvYWQgc3RhdHMgZmlsZVxuICAgICAgICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhzdGF0c1BhdGgsICd1dGY4JykpO1xuXG4gICAgICAgICAgICBpZihkYXRhLmhhc093blByb3BlcnR5KHRoaXMubG9nS2V5KSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YSA9IGRhdGFbdGhpcy5sb2dLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlxcbkVycm9yIHBhcnNpbmcgXFxcIlwiICsgc3RhdHNQYXRoICsgXCJcXFwiLiBcIiArIGVycm9yICsgXCJcXG5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3cml0ZSBvdXQgdGhlIHBlcnNpc3RlbnQgZGF0YSBpZiBsb2dLZXkgaXMgZGVmaW5lZDsgdGhpcyBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCAqYmVmb3JlKiBleGl0XG4gICAgd3JpdGVQZXJzaXN0ZW50RGF0YSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvZ0tleSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBub3RoaW5nIGZsYWdnZWQgdG8gd3JpdGUgYW55dGhpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkYXRhID0ge307XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHN0YXRzUGF0aCkpIHtcbiAgICAgICAgICAgIC8vIHJlYWQgaW4gb2xkIG9uZSBmaXJzdFxuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHN0YXRzUGF0aCwgJ3V0ZjgnKSk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVt0aGlzLmxvZ0tleV0gPSAoKHRoaXMubG9nRGF0YSAhPT0gdW5kZWZpbmVkKSA/IHRoaXMubG9nRGF0YSA6IHt9KTtcblxuXG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoc3RhdHNQYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAnICAgICcpLCAndXRmOCcpO1xuICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlxcbkVycm9yIHdyaXRpbmcgXFxcIlwiICsgc3RhdHNQYXRoICsgXCJcXFwiLiBcIiArIGVycm9yICsgXCJcXG5cIik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VUZXN0O1xuIiwiaW1wb3J0IEJhc2VUZXN0IGZyb20gXCIuLi90ZXN0XCI7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL2NvbW1vbic7XG5jb25zdCBqaWJvID0gcmVxdWlyZSgnamlibycpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcblxuLypcbiogVGVzdCBiYXR0ZXJ5IHZvbHRhZ2VcbiogKi9cblxuLy8gbGV0IGNlbnRlckJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjZW50ZXItYnV0dG9uJyk7XG4vLyBsZXQgbmV4dEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXh0LWJ1dHRvbicpO1xuXG5jbGFzcyBCYXR0ZXJ5VGVzdCBleHRlbmRzIEJhc2VUZXN0IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNCUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmV4aXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5iYXR0ZXJ5Vm9sdGFnZXMgPSBbXTtcblxuICAgICAgICB0aGlzLnBBZGFwdE1lYXN1cmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYmF0dGVyeU1lYXN1cmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY291bnRkb3duRG9uZSA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMucG93ZXJBZGFwdGVyVW5wbHVnZ2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmFpbENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5wYXNzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnNraWxsTGlzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5nb3RTa2lsbExpc3QgPSAxO1xuICAgICAgICB0aGlzLmlzU2tpbGxSdW5uaW5nID0gMDtcblxuICAgICAgICB0aGlzLnByZXZCYXRWb2x0ID0gMDtcblxuICAgICAgICB0aGlzLnVwZGF0ZUNvdW50ID0gMTUwO1xuICAgICAgICB0aGlzLnNodXRkb3duQ291bnQgPSA5NTtcbiAgICAgICAgdGhpcy5wbHVnQWRhcHRlckFnYWluID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVkTG9ncyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZmluaXNoZWRUZXN0ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5yYXdMb2dGaWxlID0gdW5kZWZpbmVkO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICB0aGlzLmxvZ0tleSA9IFwiYmF0dGVyeVRlc3RcIjtcbiAgICAgICAgdGhpcy5sb2dEYXRhID0ge307XG4gICAgICAgIHRoaXMubG9nRGF0YVsnbWVhc3VyZW1lbnQnXSA9IHtcImJhdHRlcnlWb2x0YWdlXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWRhcHRlclZvbHRhZ2VcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjaGFyZ2VDdXJyZW50XCI6IHVuZGVmaW5lZH07XG5cbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXSA9IHtcImJhdHRlcnlWb2x0YWdlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhZGFwdGVyVm9sdGFnZVwiOiBmYWxzZX07XG5cblxuICAgIH1cblxuICAgIGVudGVyKCkge1xuICAgICAgICBDb21tb24uY2VudGVyUm9ib3QoKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnZW50ZXIgYmF0dGVyeSB0ZXN0Jyk7XG5cbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICB0aGlzLl9za2lsbExpc3QoIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5za2lsbExpc3QgPSByZXNwb25zZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHRlbXAxID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwxJyk7XG4gICAgICAgIHRlbXAxLnN0eWxlLm1hcmdpblRvcCA9IFwiLTMwMHB4XCI7XG4gICAgICAgIHRlbXAxLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAxLnN0eWxlLmZvbnRTaXplID0gXCI1MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwyJyk7XG4gICAgICAgIHRlbXAyLnN0eWxlLm1hcmdpblRvcCA9IFwiMjVweFwiO1xuICAgICAgICB0ZW1wMi5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMi5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wMyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMycpO1xuICAgICAgICB0ZW1wMy5zdHlsZS5tYXJnaW5Ub3AgPSBcIjI1cHhcIjtcbiAgICAgICAgdGVtcDMuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDMuc3R5bGUuZm9udFNpemUgPSBcIjEwMHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXA0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWw0Jyk7XG4gICAgICAgIHRlbXA0LnN0eWxlLm1hcmdpblRvcCA9IFwiMjVweFwiO1xuICAgICAgICB0ZW1wNC5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wNC5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIC8vcmVtb3ZlIHBvd2VyIGFkYXB0ZXIgc3RhdGUsIHN0ZXAgMFxuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJURVNUIDEwOiBCQVRURVJZIFZPTFRBR0VcIixcIlwiLFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTdGVwIDEuIFJlbW92ZSBQb3dlciBBZGFwdGVyXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiQWRhcHRlciBpbjogXCIgKyBqaWJvLnN5c3RlbS5pc0JhdHRlcnlDaGFyZ2luZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFwiVm9sdGFnZTogXCIgKyBqaWJvLnN5c3RlbS5nZXRTeXN0ZW1Wb2x0YWdlKCkpO1xuICAgIH1cblxuICAgIF9za2lsbExpc3QoY2Ipe1xuICAgICAgICBjb25zb2xlLmxvZygnU0tJTEwgTElTVCcpO1xuICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgXCJodHRwOi8vbG9jYWxob3N0Ojg1ODUvc2tpbGwvbGlzdFwiLCB0cnVlKTtcbiAgICAgICAgLy8gdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSA0ICYmIHJlcXVlc3Quc3RhdHVzID09IDIwMCl7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhsaXN0KTtcbiAgICAgICAgICAgICAgICBjYihsaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuXG4gICAgX2lzRmluVGVzdFJ1bm5pbmcoKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1JVTk5JTkcnKTtcbiAgICAgICAgaWYodGhpcy5nb3RTa2lsbExpc3QgPiAwICYmIHRoaXMuc2tpbGxMaXN0ICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5za2lsbExpc3Quc2tpbGxzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBpZih0aGlzLnNraWxsTGlzdC5za2lsbHNbaV0ubmFtZS5pbmNsdWRlcyhcImZpbi1nb29kcy10ZXN0XCIpKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NraWxsUnVubmluZyA9IHRoaXMuc2tpbGxMaXN0LnNraWxsc1tpXS5ydW5uaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ290U2tpbGxMaXN0LS07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfUE9XRVJPRkYoKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1BPV0VST0ZGJyk7XG4gICAgICAgIHZhciBydW5uaW5nX29uX3JvYm90ID0gZmFsc2U7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKCcvdmFyL2ppYm8vaWRlbnRpdHkuanNvbicpKSB7XG4gICAgICAgICAgICBpZih0aGlzLmlzU2tpbGxSdW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0b3BwaW5nIHNraWxsJyk7XG4gICAgICAgICAgICAgICAgdmFyIGJvZHkgPSB7XCJjb21tYW5kXCI6IFwiZmluLWdvb2RzLXRlc3RcIn07XG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lm9wZW4oXCJQT1NUXCIsIFwiaHR0cDovL2xvY2FsaG9zdDo4Nzc5L3Rlcm1pbmF0ZVwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5zZW5kKGJvZHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJTa2lsbCBub3QgcnVubmluZyB0aHJvdWdoIHN5c3RlbSBtYW5hZ2VyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSBzaHV0IGRvd24gc2tpbGwgbWFudWFsbHkhXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZW5lcmF0ZUxvZygpe1xuICAgICAgICBpZih0aGlzLmdlbmVyYXRlZExvZ3Mpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmF3TG9nRmlsZSA9SlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoJ3N0eWxlcy9maW5Hb29kc1NraWxsLmxvZycpKTtcbiAgICAgICAgY29uc29sZS5sb2coJ2dlbmVyYXRlIGxvZ3MnKTtcbiAgICAgICAgdGhpcy5sb2dLZXkgPSBcInRlc3RSZXN1bHRzXCJcbiAgICAgICAgdGhpcy5sb2dEYXRhID0ge307XG4gICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVja0luZGV4U3RhdHVzXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3Jzb0luZGV4U3RhdHVzXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwZWx2aXNJbmRleFN0YXR1c1wiOiB1bmRlZmluZWQsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjZW50ZXJUZXN0XCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaHNjcmVlblRlc3RcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXlUZXN0XCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWFkVG91Y2hUZXN0XCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWRUZXN0XCI6IHVuZGVmaW5lZCxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZyZWVBaXJUZXN0TmVja09ic2VydmF0aW9uXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmcmVlQWlyVGVzdFRvcnNvT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZyZWVBaXJUZXN0UGVsdmlzT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZyZWVBaXJUZXN0TmVja0ZhdWx0XCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmcmVlQWlyVGVzdFRvcnNvRmF1bHRcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZyZWVBaXJUZXN0UGVsdmlzRmF1bHRcIjogdW5kZWZpbmVkLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhbGxDV1Rlc3ROZWNrT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ1dUZXN0VG9yc29PYnNlcnZhdGlvblwiOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhbGxDV1Rlc3RQZWx2aXNPYnNlcnZhdGlvblwiOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhbGxDV1Rlc3ROZWNrRmF1bHRcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ1dUZXN0VG9yc29GYXVsdFwiOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhbGxDV1Rlc3RQZWx2aXNGYXVsdFwiOiB1bmRlZmluZWQsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFsbENDV1Rlc3ROZWNrT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ0NXVGVzdFRvcnNvT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ0NXVGVzdFBlbHZpc09ic2VydmF0aW9uXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFsbENDV1Rlc3ROZWNrRmF1bHRcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ0NXVGVzdFRvcnNvRmF1bHRcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ0NXVGVzdFBlbHZpc0ZhdWx0XCI6IHVuZGVmaW5lZCxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZ1bGxCb2R5VGVzdFwiOiB1bmRlZmluZWQsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYXR0ZXJ5VGVzdEFkYXB0ZXJWb2x0YWdlXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYXR0ZXJ5VGVzdEJhdHRlcnlWb2x0YWdlXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYXR0ZXJ5VGVzdENoYXJnZUN1cnJlbnRcIjogdW5kZWZpbmVkLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3ZlcmFsbFBhc3Nlc1wiOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3ZlcmFsbEZhaWxzXCI6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgbGV0IHRlc3QwXzAgPSAwOyBsZXQgdGVzdDBfMSA9IDA7IGxldCB0ZXN0MF8yID0gMDtcbiAgICAgICAgbGV0IHRlc3QxID0gMDsgbGV0IHRlc3QyID0gMDtcbiAgICAgICAgbGV0IHRlc3QzID0gMDsgbGV0IHRlc3Q0ID0gMDsgbGV0IHRlc3Q1ID0gMDtcblxuICAgICAgICBsZXQgdGVzdDZfMSA9IDA7IGxldCB0ZXN0Nl8yID0gMDsgbGV0IHRlc3Q2XzMgPSAwO1xuICAgICAgICBsZXQgdGVzdDZfNCA9IDA7IGxldCB0ZXN0Nl81ID0gMDsgbGV0IHRlc3Q2XzYgPSAwO1xuXG4gICAgICAgIGxldCB0ZXN0N18xID0gMDsgbGV0IHRlc3Q3XzIgPSAwOyBsZXQgdGVzdDdfMyA9IDA7XG4gICAgICAgIGxldCB0ZXN0N180ID0gMDsgbGV0IHRlc3Q3XzUgPSAwOyBsZXQgdGVzdDdfNiA9IDA7XG5cbiAgICAgICAgbGV0IHRlc3Q4XzEgPSAwOyBsZXQgdGVzdDhfMiA9IDA7IGxldCB0ZXN0OF8zID0gMDtcbiAgICAgICAgbGV0IHRlc3Q4XzQgPSAwOyBsZXQgdGVzdDhfNSA9IDA7IGxldCB0ZXN0OF82ID0gMDtcblxuICAgICAgICBsZXQgdGVzdDkgPSAwO1xuICAgICAgICBsZXQgdGVzdDEwXzEgPSAwOyBsZXQgdGVzdDEwXzIgPSAwOyBsZXQgdGVzdDEwXzMgPSAwO1xuXG5cbiAgICAgICAgaWYodGhpcy5yYXdMb2dGaWxlWydpbmRleFRlc3QnXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGVzdDBfMCA9IHRoaXMucmF3TG9nRmlsZVsnaW5kZXhUZXN0J10uaW5kZXhTdGF0dXMubmVja0luZGV4U3RhdHVzO1xuICAgICAgICAgICAgaWYodGVzdDBfMCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25lY2tJbmRleFN0YXR1cyBpbiBiZWdpbm5pbmcgcGFzcycpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzc0NvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5uZWNrSW5kZXhTdGF0dXMgPSB0cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25lY2tJbmRleFN0YXR1cyBpbiBiZWdpbm5pbmcgZmFpbCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmFpbENvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5uZWNrSW5kZXhTdGF0dXMgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlc3QwXzEgPSB0aGlzLnJhd0xvZ0ZpbGVbJ2luZGV4VGVzdCddLmluZGV4U3RhdHVzLnRvcnNvSW5kZXhTdGF0dXM7XG4gICAgICAgICAgICBpZih0ZXN0MF8xKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndG9yc29JbmRleFN0YXR1cyBpbiBiZWdpbm5pbmcgcGFzcycpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzc0NvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS50b3Jzb0luZGV4U3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0b3Jzb0luZGV4U3RhdHVzIGluIGJlZ2lubmluZyBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnRvcnNvSW5kZXhTdGF0dXMgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlc3QwXzIgPSB0aGlzLnJhd0xvZ0ZpbGVbJ2luZGV4VGVzdCddLmluZGV4U3RhdHVzLnBlbHZpc0luZGV4U3RhdHVzO1xuICAgICAgICAgICAgaWYodGVzdDBfMil7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3BlbHZpc0luZGV4U3RhdHVzIGluIGJlZ2lubmluZyBwYXNzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnBlbHZpc0luZGV4U3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwZWx2aXNJbmRleFN0YXR1cyBpbiBiZWdpbm5pbmcgZmFpbCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmFpbENvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5wZWx2aXNJbmRleFN0YXR1cyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5yYXdMb2dGaWxlWydjZW50ZXJUZXN0J10gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRlc3QxID0gdGhpcy5yYXdMb2dGaWxlWydjZW50ZXJUZXN0J10ucmVzdWx0LnBhc3NlZDtcbiAgICAgICAgICAgIGlmKHRlc3QxKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2VudGVyZWQgcGFzcycpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzc0NvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5jZW50ZXJUZXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjZW50ZXJlZCBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmNlbnRlclRlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucmF3TG9nRmlsZVsndG91Y2hzY3JlZW5UZXN0J10gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRlc3QyID0gdGhpcy5yYXdMb2dGaWxlWyd0b3VjaHNjcmVlblRlc3QnXS5yZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgaWYodGVzdDIpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0b3Vjc2NyZWVuIHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10udG91Y2hzY3JlZW5UZXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0b3Vjc2NyZWVuIGZhaWwnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZhaWxDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10udG91Y2hzY3JlZW5UZXN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnJhd0xvZ0ZpbGVbJ2Rpc3BsYXlUZXN0J10gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRlc3QzID0gdGhpcy5yYXdMb2dGaWxlWydkaXNwbGF5VGVzdCddLnJlc3VsdC5wYXNzZWQ7XG4gICAgICAgICAgICBpZih0ZXN0Myl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Rpc3BsYXkgcGFzcycpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzc0NvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5kaXNwbGF5VGVzdCA9IHRydWU7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZGlzcGxheSBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmRpc3BsYXlUZXN0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnJhd0xvZ0ZpbGVbJ2hlYWRUb3VjaFRlc3QnXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGVzdDQgPSB0aGlzLnJhd0xvZ0ZpbGVbJ2hlYWRUb3VjaFRlc3QnXS5yZXN1bHQucGFzc2VkO1xuICAgICAgICAgICAgaWYodGVzdDQpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoZWFkVG91Y2hUZXN0IHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uaGVhZFRvdWNoVGVzdCA9IHRydWU7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGVhZFRvdWNoVGVzdCBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmhlYWRUb3VjaFRlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucmF3TG9nRmlsZVsnbGVkVGVzdCddICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0ZXN0NSA9IHRoaXMucmF3TG9nRmlsZVsnbGVkVGVzdCddLnJlc3VsdC5wYXNzZWQ7XG4gICAgICAgICAgICBpZih0ZXN0NSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xlZCBwYXNzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmxlZFRlc3QgPSB0cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xlZCBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmxlZFRlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucmF3TG9nRmlsZVsnZnJlZUFpclRlc3QnXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGVzdDZfMSA9IHRoaXMucmF3TG9nRmlsZVsnZnJlZUFpclRlc3QnXS5yZXN1bHQuZnJlZUFpclRlc3ROZWNrT2JzZXJ2YXRpb247XG4gICAgICAgICAgICBpZih0ZXN0Nl8xKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYm9kaWVzVGVzdEhlYWQgcGFzcycpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzc0NvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdE5lY2tPYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYm9kaWVzVGVzdEhlYWQgZmFpbCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmFpbENvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdE5lY2tPYnNlcnZhdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZXN0Nl8yID0gdGhpcy5yYXdMb2dGaWxlWydmcmVlQWlyVGVzdCddLnJlc3VsdC5mcmVlQWlyVGVzdFRvcnNvT2JzZXJ2YXRpb247XG4gICAgICAgICAgICBpZih0ZXN0Nl8yKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYm9kaWVzVGVzdFRvcnNvIHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uZnJlZUFpclRlc3RUb3Jzb09ic2VydmF0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdib2RpZXNUZXN0VG9yc28gZmFpbCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmFpbENvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGVzdDZfMyA9IHRoaXMucmF3TG9nRmlsZVsnZnJlZUFpclRlc3QnXS5yZXN1bHQuZnJlZUFpclRlc3RQZWx2aXNPYnNlcnZhdGlvbjtcbiAgICAgICAgICAgIGlmKHRlc3Q2XzMpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdib2RpZXNUZXN0UGVsdmlzIHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uZnJlZUFpclRlc3RQZWx2aXNPYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYm9kaWVzVGVzdFBlbHZpcyBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmZyZWVBaXJUZXN0UGVsdmlzT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGVzdDZfNCA9IHRoaXMucmF3TG9nRmlsZVsnZnJlZUFpclRlc3QnXS5mYXVsdHMuZnJlZUFpclRlc3ROZWNrRmF1bHQ7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmZyZWVBaXJUZXN0TmVja0ZhdWx0ID0gdGVzdDZfNDtcblxuICAgICAgICAgICAgdGVzdDZfNSA9IHRoaXMucmF3TG9nRmlsZVsnZnJlZUFpclRlc3QnXS5mYXVsdHMuZnJlZUFpclRlc3RUb3Jzb0ZhdWx0O1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdFRvcnNvRmF1bHQgPSB0ZXN0Nl81O1xuXG4gICAgICAgICAgICB0ZXN0Nl82ID0gdGhpcy5yYXdMb2dGaWxlWydmcmVlQWlyVGVzdCddLmZhdWx0cy5mcmVlQWlyVGVzdFBlbHZpc0ZhdWx0O1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdFBlbHZpc0ZhdWx0ID0gdGVzdDZfNjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucmF3TG9nRmlsZVsnc3RhbGxDV1Rlc3QnXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGVzdDdfMSA9IHRoaXMucmF3TG9nRmlsZVsnc3RhbGxDV1Rlc3QnXS5yZXN1bHQuc3RhbGxDV1Rlc3ROZWNrT2JzZXJ2YXRpb247XG4gICAgICAgICAgICBpZih0ZXN0N18xKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3RhbGxDV1Rlc3RIZWFkIHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDV1Rlc3ROZWNrT2JzZXJ2YXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0YWxsQ1dUZXN0SGVhZCBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ1dUZXN0TmVja09ic2VydmF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRlc3Q3XzIgPSB0aGlzLnJhd0xvZ0ZpbGVbJ3N0YWxsQ1dUZXN0J10ucmVzdWx0LnN0YWxsQ1dUZXN0VG9yc29PYnNlcnZhdGlvbjtcbiAgICAgICAgICAgIGlmKHRlc3Q3XzIpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbENXVGVzdFRvcnNvIHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDV1Rlc3RUb3Jzb09ic2VydmF0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbENXVGVzdFRvcnNvIGZhaWwnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZhaWxDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDV1Rlc3RUb3Jzb09ic2VydmF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRlc3Q3XzMgPSB0aGlzLnJhd0xvZ0ZpbGVbJ3N0YWxsQ1dUZXN0J10ucmVzdWx0LnN0YWxsQ1dUZXN0UGVsdmlzT2JzZXJ2YXRpb247XG4gICAgICAgICAgICBpZih0ZXN0N18zKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc3RhbGxDV1Rlc3RQZWx2aXMgcGFzcycpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFzc0NvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdFBlbHZpc09ic2VydmF0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbENXVGVzdFBlbHZpcyBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ1dUZXN0UGVsdmlzT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGVzdDdfNCA9IHRoaXMucmF3TG9nRmlsZVsnc3RhbGxDV1Rlc3QnXS5mYXVsdHMuc3RhbGxDV1Rlc3ROZWNrRmF1bHQ7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ1dUZXN0TmVja0ZhdWx0ID0gdGVzdDdfNDtcblxuICAgICAgICAgICAgdGVzdDdfNSA9IHRoaXMucmF3TG9nRmlsZVsnc3RhbGxDV1Rlc3QnXS5mYXVsdHMuc3RhbGxDV1Rlc3RUb3Jzb0ZhdWx0O1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdFRvcnNvRmF1bHQgPSB0ZXN0N181O1xuXG4gICAgICAgICAgICB0ZXN0N182ID0gdGhpcy5yYXdMb2dGaWxlWydzdGFsbENXVGVzdCddLmZhdWx0cy5zdGFsbENXVGVzdFBlbHZpc0ZhdWx0O1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdFBlbHZpc0ZhdWx0ID0gdGVzdDdfNjtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5yYXdMb2dGaWxlWydzdGFsbENDV1Rlc3QnXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGVzdDhfMSA9IHRoaXMucmF3TG9nRmlsZVsnc3RhbGxDQ1dUZXN0J10ucmVzdWx0LnN0YWxsQ0NXVGVzdE5lY2tPYnNlcnZhdGlvbjtcbiAgICAgICAgICAgIGlmKHRlc3Q4XzEpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbENDV1Rlc3RIZWFkIHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDQ1dUZXN0TmVja09ic2VydmF0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbENDV1Rlc3RIZWFkIGZhaWwnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZhaWxDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDQ1dUZXN0TmVja09ic2VydmF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRlc3Q4XzIgPSB0aGlzLnJhd0xvZ0ZpbGVbJ3N0YWxsQ0NXVGVzdCddLnJlc3VsdC5zdGFsbENDV1Rlc3RUb3Jzb09ic2VydmF0aW9uO1xuICAgICAgICAgICAgaWYodGVzdDhfMil7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0YWxsQ0NXVGVzdFBlbHZpcyBwYXNzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ0NXVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0YWxsQ0NXVGVzdFBlbHZpcyBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ0NXVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGVzdDhfMyA9IHRoaXMucmF3TG9nRmlsZVsnc3RhbGxDQ1dUZXN0J10ucmVzdWx0LnN0YWxsQ0NXVGVzdFBlbHZpc09ic2VydmF0aW9uO1xuICAgICAgICAgICAgaWYodGVzdDhfMyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0YWxsQ0NXVGVzdFBlbHZpcyBwYXNzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ0NXVGVzdFBlbHZpc09ic2VydmF0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbENDV1Rlc3RUb3JzbyBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ0NXVGVzdFBlbHZpc09ic2VydmF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRlc3Q4XzQgPSB0aGlzLnJhd0xvZ0ZpbGVbJ3N0YWxsQ0NXVGVzdCddLmZhdWx0cy5zdGFsbENDV1Rlc3ROZWNrRmF1bHQ7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ0NXVGVzdE5lY2tGYXVsdCA9IHRlc3Q4XzQ7XG5cbiAgICAgICAgICAgIHRlc3Q4XzUgPSB0aGlzLnJhd0xvZ0ZpbGVbJ3N0YWxsQ0NXVGVzdCddLmZhdWx0cy5zdGFsbENDV1Rlc3RUb3Jzb0ZhdWx0O1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENDV1Rlc3RUb3Jzb0ZhdWx0ID0gdGVzdDhfNTtcblxuICAgICAgICAgICAgdGVzdDhfNiA9IHRoaXMucmF3TG9nRmlsZVsnc3RhbGxDQ1dUZXN0J10uZmF1bHRzLnN0YWxsQ0NXVGVzdFBlbHZpc0ZhdWx0O1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENDV1Rlc3RQZWx2aXNGYXVsdCA9IHRlc3Q4XzY7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnJhd0xvZ0ZpbGVbJ2Z1bGxCb2R5VGVzdCddICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0ZXN0OSA9IHRoaXMucmF3TG9nRmlsZVsnZnVsbEJvZHlUZXN0J10ucmVzdWx0LnBhc3NlZDtcbiAgICAgICAgICAgIGlmKHRlc3Q5KXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZnVsbEJvZHlUZXN0IHBhc3MnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uZnVsbEJvZHlUZXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmdWxsQm9keVRlc3QgZmFpbCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmFpbENvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mdWxsQm9keVRlc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucmF3TG9nRmlsZVsnYmF0dGVyeVRlc3QnXSAhPSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGVzdDEwXzEgPSB0aGlzLnJhd0xvZ0ZpbGVbJ2JhdHRlcnlUZXN0J10ucmVzdWx0LmFkYXB0ZXJWb2x0YWdlO1xuICAgICAgICAgICAgaWYodGVzdDEwXzEpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdiYXR0ZXJ5VGVzdHBBZGFwdCBwYXNzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmJhdHRlcnlUZXN0QWRhcHRlclZvbHRhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JhdHRlcnlUZXN0cEFkYXB0IGZhaWwnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZhaWxDb3VudCsrO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uYmF0dGVyeVRlc3RBZGFwdGVyVm9sdGFnZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0ZXN0MTBfMiA9IHRoaXMucmF3TG9nRmlsZVsnYmF0dGVyeVRlc3QnXS5yZXN1bHQuYmF0dGVyeVZvbHRhZ2U7XG4gICAgICAgICAgICBpZih0ZXN0MTBfMil7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JhdHRlcnlUZXN0QmF0dGVyeSBwYXNzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmJhdHRlcnlUZXN0QmF0dGVyeVZvbHRhZ2UgPSB0cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2JhdHRlcnlUZXN0QmF0dGVyeSBmYWlsJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsQ291bnQrKztcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmJhdHRlcnlUZXN0QmF0dGVyeVZvbHRhZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGVzdDEwXzMgPSB0aGlzLnJhd0xvZ0ZpbGVbJ2JhdHRlcnlUZXN0J10ubWVhc3VyZW1lbnQuY2hhcmdlQ3VycmVudDtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uYmF0dGVyeVRlc3RDaGFyZ2VDdXJyZW50ID0gdGVzdDEwXzM7XG4gICAgICAgIH1cblxuICAgICAgICAvL1dSSVRFIEFMTCBBQk9WRSBEQVRBIFRPIExPR1xuICAgICAgICB0aGlzLndyaXRlUGVyc2lzdGVudERhdGEoKTtcblxuICAgICAgICB0aGlzLmxvZ0tleSA9IFwib3ZlcmFsbFJlc3VsdHNcIjtcbiAgICAgICAgdGhpcy5sb2dEYXRhID0ge307XG4gICAgICAgIHRoaXMubG9nRGF0YVsnb3ZlcmFsbFJlc3VsdCddID0ge1wib3ZlcmFsbFBhc3NGYWlsXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm92ZXJhbGxQYXNzZXNcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwib3ZlcmFsbEZhaWxzXCI6IHVuZGVmaW5lZH1cblxuICAgICAgICB0aGlzLmxvZ0RhdGFbJ292ZXJhbGxSZXN1bHQnXS5vdmVyYWxsUGFzc2VzID0gdGhpcy5wYXNzQ291bnQ7XG4gICAgICAgIHRoaXMubG9nRGF0YVsnb3ZlcmFsbFJlc3VsdCddLm92ZXJhbGxGYWlscyA9IHRoaXMuZmFpbENvdW50O1xuICAgICAgICBpZih0aGlzLmZhaWxDb3VudCA9PSAwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCaVQgcGFzc2VkJyk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ292ZXJhbGxSZXN1bHQnXS5vdmVyYWxsUGFzc0ZhaWwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ292ZXJhbGxSZXN1bHQnXS5vdmVyYWxsUGFzc0ZhaWwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdlbmVyYXRlZExvZ3MgPSB0cnVlO1xuICAgICAgICB0aGlzLndyaXRlUGVyc2lzdGVudERhdGEoKTtcbiAgICB9XG5cbiAgICBleGl0KCkge1xuICAgICAgICB0aGlzLmV4aXRpbmcgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZyhcImV4aXQgYmF0dGVyeSB0ZXN0XCIpO1xuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJcIik7XG5cbiAgICAgICAgdGhpcy5maW5pc2hlZFRlc3QgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5iYXR0ZXJ5Vm9sdGFnZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvL3BlcmZvcm0gdGVzdCBpbiBoZXJlXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5leGl0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pc0ZpblRlc3RSdW5uaW5nKCk7XG5cbiAgICAgICAgLy8gbWVhc3VyZSB0aGUgcG93ZXIgYWRhcHRlciB2b2x0YWdlIG9uY2VcbiAgICAgICAgLy8gaW4gdGhlIGZpcnN0IHN0ZXAgYmVmb3JlIGFkYXB0ZXIgaXMgdW5wbHVnZ2VkXG5cbiAgICAgICAgaWYoIXRoaXMucEFkYXB0TWVhc3VyZWQpe1xuICAgICAgICAgICAgdmFyIHBBZGFwdFYgPSBqaWJvLnN5c3RlbS5nZXRTeXN0ZW1Wb2x0YWdlKCkudG9GaXhlZCgyKTtcblxuICAgICAgICAgICAgLy9jaGVjayB3aXRoaW4gYWNjZXB0YWJsZSByYW5nZVxuICAgICAgICAgICAgaWYocEFkYXB0ViA+PSAxNi4yICYmIHBBZGFwdFYgPD0gMTkuOCl7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5hZGFwdGVyVm9sdGFnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydtZWFzdXJlbWVudCddLmFkYXB0ZXJWb2x0YWdlID0gcEFkYXB0VjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncGFzc2VkIHN0ZXAgMScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmFkYXB0ZXJWb2x0YWdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydtZWFzdXJlbWVudCddLmFkYXB0ZXJWb2x0YWdlID0gcEFkYXB0VjtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHN0ZXAgMScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wQWRhcHRNZWFzdXJlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL3N0ZXAgMSwgcG93ZXIgYWRhcHRlciB1bnBsdWdnZWRcblxuICAgICAgICBpZighamliby5zeXN0ZW0ucGx1Z2dlZEluICYmIHRoaXMucEFkYXB0TWVhc3VyZWQpe1xuXG4gICAgICAgICAgICB0aGlzLnBvd2VyQWRhcHRlclVucGx1Z2dlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnVwZGF0ZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDb3VudC0tO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgLy9hZnRlciBjb3VudGRvd24sIGRpc3BsYXkgcGx1ZyBpbiBhZ2FpblxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z0FkYXB0ZXJBZ2FpbiA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vY291bnRkb3duIHRvIGFsbG93IHRpbWUgdG8gbG9nIGVub3VnaCBiYXR0ZXJ5IGRhdGFcbiAgICAgICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlRFU1QgMTA6IEJBVFRFUlkgVk9MVEFHRVwiLCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFyc2VJbnQodGhpcy51cGRhdGVDb3VudCAvIDMwKSArIDEpLCBcIlwiKTtcblxuICAgICAgICAgICAgLy9vbmx5IGxvZyB2b2x0YWdlIGlmIGRpZmZlcmVudCB0aGFuIGxhc3QgdGltZVxuICAgICAgICAgICAgaWYoamliby5zeXN0ZW0uZ2V0U3lzdGVtVm9sdGFnZSgpICE9IHRoaXMucHJldkJhdFZvbHQpe1xuICAgICAgICAgICAgICAgIHRoaXMuYmF0dGVyeVZvbHRhZ2VzLnB1c2goamliby5zeXN0ZW0uZ2V0U3lzdGVtVm9sdGFnZSgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZCYXRWb2x0ID0gamliby5zeXN0ZW0uZ2V0U3lzdGVtVm9sdGFnZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9zdGVwIDIsIHBvd2VyIGFkYXB0ZXIgd2FzIHVucGx1Z2dlZCBhbmQgdGltZXIgd2VudCBieSB0byBhbGxvdyBzYW1wbGluZ1xuICAgICAgICAvL29mIGJhdHRlcnkgdm9sdGFnZXNcbiAgICAgICAgaWYodGhpcy5wbHVnQWRhcHRlckFnYWluKXtcbiAgICAgICAgICAgIHRoaXMuYmF0dGVyeVZvbHRhZ2UgPSBqaWJvLnN5c3RlbS5nZXRTeXN0ZW1Wb2x0YWdlKCk7XG4gICAgICAgICAgICB0aGlzLmNvdW50ZG93bkRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiVEVTVCAxMDogQkFUVEVSWSBWT0xUQUdFXCIsXCJcIixcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJTdGVwIDIuIEluc2VydCBQb3dlciBBZGFwdGVyXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9yZWFkeSB0byBtZWFzdXJlIGJhdHRlcnlcbiAgICAgICAgaWYoamliby5zeXN0ZW0ucGx1Z2dlZEluICYmIHRoaXMuY291bnRkb3duRG9uZSl7XG4gICAgICAgICAgICAvL2NoZWNrIGlmIGJhdHRlcnkgdm9sdGFnZSBpcyB3aXRoaW4gcmFuZ2VcbiAgICAgICAgICAgIGlmKCF0aGlzLmJhdHRlcnlNZWFzdXJlZCl7XG4gICAgICAgICAgICAgICAgdmFyIGJhdHRlcnlWID0gTWF0aC5taW4uYXBwbHkobnVsbCwgdGhpcy5iYXR0ZXJ5Vm9sdGFnZXMpO1xuXG4gICAgICAgICAgICAgICAgaWYoYmF0dGVyeVYgPj0gMTQuMCAmJiBiYXR0ZXJ5ViA8PSAxNS4yKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5iYXR0ZXJ5Vm9sdGFnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnbWVhc3VyZW1lbnQnXS5iYXR0ZXJ5Vm9sdGFnZSA9IGJhdHRlcnlWLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXNzZWQgc3RlcCAyJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uYmF0dGVyeVZvbHRhZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydtZWFzdXJlbWVudCddLmJhdHRlcnlWb2x0YWdlID0gYmF0dGVyeVYudG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCBzdGVwIDInKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydtZWFzdXJlbWVudCddLmNoYXJnZUN1cnJlbnQgPSBqaWJvLnN5c3RlbS5iYXR0ZXJ5Q2hhcmdlUmF0ZS50b0ZpeGVkKDIpO1xuXG4gICAgICAgICAgICAgICAgLy9vbmx5IG1lYXN1cmUgb25jZVxuICAgICAgICAgICAgICAgIHRoaXMuYmF0dGVyeU1lYXN1cmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vbG9nIHRpbWVcbiAgICAgICAgICAgIC8vIHRoaXMuc2h1dGRvd25Db3VudCA9IDEwMDtcbiAgICAgICAgICAgIC8vIHRoaXMuZmluaXNoZWRMb2dnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZih0aGlzLnNodXRkb3duQ291bnQgPT0gMCAmJiAhdGhpcy5maW5pc2hlZExvZ2dpbmcpe1xuICAgICAgICAgICAgICAgIHRoaXMuY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmdlbmVyYXRlZExvZ3Mpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2R1cmF0aW9uJ10gPSB7XCJ0ZXN0RHVyYXRpb25cIjogdW5kZWZpbmVkfTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydkdXJhdGlvbiddLnRlc3REdXJhdGlvbiA9IChNYXRoLmFicyh0aGlzLmN1clRpbWUgLSB0aGlzLnN0YXJ0VGltZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndyaXRlUGVyc2lzdGVudERhdGEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVMb2coKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9QT1dFUk9GRigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJTSFVURE9XTiBJTjpcIiwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJzZUludCh0aGlzLnNodXRkb3duQ291bnQgLyAzMCkgKyAxKSwgXCJcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5zaHV0ZG93bkNvdW50LS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmF0dGVyeVRlc3Q7XG4iLCJpbXBvcnQgQmFzZVRlc3QgZnJvbSBcIi4uL3Rlc3RcIjtcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vY29tbW9uJztcbnZhciBjaGlsZFByb2Nlc3MgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5sZXQgTWFpbiA9IHJlcXVpcmUoJy4uL2FwcCcpO1xubGV0IHByb2plY3RSb290ID0gcmVxdWlyZSgnLi4vcHJvamVjdC1yb290Jyk7XG5sZXQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmxldCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5sZXQgamlibyA9IHJlcXVpcmUoJ2ppYm8nKTtcblxuXG4vKlxuKiBMYW5kaW5nIHBhZ2UgZm9yIGJlZ2lubmluZyBvZiB0ZXN0XG4qICovXG5jbGFzcyBCZWdpblRlc3QgZXh0ZW5kcyBCYXNlVGVzdCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmV4aXRpbmcgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLm9uUm9ib3QgPSBmYWxzZTtcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIH1cblxuICAgIF9nZXRpbmZvcm1hdGlvbnJtYXRpb24oaG9zdElkZW50aXR5KXtcbiAgICAgICAgdmFyIGhvc3RuYW1lID0gaG9zdElkZW50aXR5O1xuICAgICAgICB2YXIgY3VyRGF0ZSA9IG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKTtcbiAgICAgICAgLy9sb2dnaW5nIGZvciBzaW11bGF0b3IgbW9kZVxuICAgICAgICB0aGlzLmxvZ0tleSA9IFwicm9ib3RJbmZvcm1hdGlvblwiO1xuICAgICAgICB0aGlzLmxvZ0RhdGEgPSB7fTtcblxuICAgICAgICB0aGlzLmxvZ0RhdGFbJ2luZm9ybWF0aW9uJ10gPSAgICAgeydkYXRlJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2VyaWFsX251bWJlcic6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25hbWUnOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NwdWlkJzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3aWZpX21hYyc6IHVuZGVmaW5lZH07XG5cbiAgICAgICAgaWYoaG9zdG5hbWUgPT09IFwic2ltdWxhdG9yXCIpe1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydpbmZvcm1hdGlvbiddLnNlcmlhbF9udW1iZXIgPSBcImhvc3RuYW1lLnNlcmlhbF9udW1iZXJcIjtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnaW5mb3JtYXRpb24nXS5uYW1lID0gXCJob3N0bmFtZS5uYW1lXCI7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2luZm9ybWF0aW9uJ10uY3B1aWQgPSBcImhvc3RuYW1lLmNwdWlkXCI7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2luZm9ybWF0aW9uJ10ud2lmaV9tYWMgPSBcImhvc3RuYW1lLndpZmlfbWFjXCI7XG4gICAgICAgICAgICAvL2xvZ2dpbmcgb24gdGhlIHJvYm90XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihob3N0bmFtZS5zZXJpYWxfbnVtYmVyKXtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2luZm9ybWF0aW9uJ10uc2VyaWFsX251bWJlciA9IGhvc3RuYW1lLnNlcmlhbF9udW1iZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnaW5mb3JtYXRpb24nXS5zZXJpYWxfbnVtYmVyID0gaG9zdG5hbWUuZ3VpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnaW5mb3JtYXRpb24nXS5uYW1lID0gaG9zdG5hbWUubmFtZTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnaW5mb3JtYXRpb24nXS5jcHVpZCA9IGhvc3RuYW1lLmNwdWlkO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydpbmZvcm1hdGlvbiddLndpZmlfbWFjID0gaG9zdG5hbWUud2lmaV9tYWM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2dEYXRhWydpbmZvcm1hdGlvbiddLmRhdGUgPSBjdXJEYXRlO1xuXG4gICAgICAgIHRoaXMud3JpdGVQZXJzaXN0ZW50RGF0YSgpO1xuICAgIH1cblxuICAgIGVudGVyKCkge1xuXG4gICAgICAgIGppYm8uc3lzdGVtLmluZGV4KCgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignY2VudGVyLWJ1dHRvbicsICc0NTBweCcsICc0MDBweCcsICgpID0+IHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX21lYXN1cmVWYWx1ZXModGhpcy5vblJvYm90KTtcblxuICAgICAgICAgICAgICAgIHRoaXMubG9nS2V5ID0gXCJiZWdpblRlc3RcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXSA9IHsgXCJkdXJhdGlvblwiOiB1bmRlZmluZWR9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10udGVzdER1cmF0aW9uID0gKE1hdGguYWJzKHRoaXMuY3VyVGltZSAtIHRoaXMuc3RhcnRUaW1lKSk7XG4gICAgICAgICAgICAgICAgLy9zdGFydCBuZXh0IHRlc3RcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlUGVyc2lzdGVudERhdGEoKTtcblxuICAgICAgICAgICAgICAgIE1haW4uc3RhcnROZXh0VGVzdCgpO1xuICAgICAgICAgICAgfSwgJ0JFR0lOIFRFU1QnKTtcbiAgICAgICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnbmV4dC1idXR0b24nLCdiYWNrLWJ1dHRvbicsJ25lY2stYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0b3Jzby1idXR0b24nLCdwZWx2aXMtYnV0dG9uJ10pO1xuICAgICAgICAgICAgLy9MaXN0ZW5pbmcgdG8gQVBJXG4gICAgICAgICAgICB0aGlzLnRlc3RBUEkoIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmF4aXNEYXRhID0gcmVzdWx0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIC8vcmVtb3ZlIGxvZyBmaWxlIGlmIGl0IGV4aXN0c1xuICAgICAgICBpZihmcy5leGlzdHNTeW5jKHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdC5nZXQoKSwgJ3N0eWxlcy8nKydmaW5Hb29kc1NraWxsLmxvZycpKSl7XG4gICAgICAgICAgICBsZXQgbG9nUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9qZWN0Um9vdC5nZXQoKSwnc3R5bGVzLycrJ2Zpbkdvb2RzU2tpbGwubG9nJylcbiAgICAgICAgICAgIGNoaWxkUHJvY2Vzcy5leGVjU3luYygncm0gJyArIGxvZ1BhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29tbW9uLmNlbnRlclJvYm90KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2VudGVyIGJlZ2luIHRlc3QnKTtcblxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBsZXQgaWRQYXRoID0gJy92YXIvamliby9pZGVudGl0eS5qc29uJztcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaWRQYXRoKSkge1xuICAgICAgICAgICAgdGhpcy5vblJvYm90ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2dldGluZm9ybWF0aW9ucm1hdGlvbihyZXF1aXJlKGlkUGF0aCkpO1xuICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICB0aGlzLl9nZXRpbmZvcm1hdGlvbnJtYXRpb24oXCJzaW11bGF0b3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXhpc1VSSSA9IFwid3M6Ly9sb2NhbGhvc3Q6ODI4MlwiO1xuICAgICAgICB0aGlzLmF4aXNTdGF0ZVNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYXhpc1VSSSArIFwiL2F4aXNfc3RhdGVcIik7XG4gICAgICAgIC8vIHRoaXMuYXhpc0NvbW1hbmRTb2NrZXQgPSBuZXcgV2ViU29ja2V0KGF4aXNVUkkgKyBcIi9heGlzX2NvbW1hbmRcIik7XG4gICAgICAgIENvbW1vbi5yZXNldExFRCgpO1xuXG4gICAgICAgIGxldCB0ZW1wMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMScpO1xuICAgICAgICB0ZW1wMS5zdHlsZS5tYXJnaW5Ub3AgPSBcIi0yNzVweFwiO1xuICAgICAgICB0ZW1wMS5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMS5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMicpO1xuICAgICAgICB0ZW1wMi5zdHlsZS5tYXJnaW5Ub3AgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDIuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJKaWJvIEZpbmlzaGVkIEdvb2RzOiBCdWlsdCBpbiBUZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiUGx1ZyBpbiBQb3dlciBBZGFwdGVyIGFuZCBwcmVzcyBCRUdJTiBURVNUIHRvIHN0YXJ0XCIpO1xuXG4gICAgfVxuXG4gICAgLy9mdW5jdGlvbiB0byBsaXN0ZW4gdG8gQm9keSBTZXJ2aWNlIGF4aXMgc3RhdGVcbiAgICB0ZXN0QVBJKGNiKXtcbiAgICAgICAgdGhpcy5heGlzU3RhdGVTb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGNiKEpTT04ucGFyc2UoZXZlbnQuZGF0YSkpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9tZWFzdXJlVmFsdWVzKG9uUm9ib3Qpe1xuICAgICAgICB0aGlzLmxvZ0tleSA9IFwiaW5kZXhUZXN0XCI7XG4gICAgICAgIHRoaXMubG9nRGF0YSA9IHt9O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddID0ge1wicGFzc2VkXCI6IHVuZGVmaW5lZH07XG4gICAgICAgIHRoaXMubG9nRGF0YVsnaW5kZXhTdGF0dXMnXSA9ICB7IFwibmVja0luZGV4U3RhdHVzXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGVsdmlzSW5kZXhTdGF0dXNcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG9yc29JbmRleFN0YXR1c1wiOiB1bmRlZmluZWR9O1xuXG4gICAgICAgIGlmIChvblJvYm90KSB7XG5cbiAgICAgICAgICAgIGxldCB0ZW1wTmVjayA9IHRoaXMuYXhpc0RhdGEubmVjay5zdGF0dXMgJiAweDAxO1xuICAgICAgICAgICAgbGV0IHRlbXBQZWx2aXMgPSB0aGlzLmF4aXNEYXRhLnBlbHZpcy5zdGF0dXMgJiAweDAxO1xuICAgICAgICAgICAgbGV0IHRlbXBUb3JzbyA9IHRoaXMuYXhpc0RhdGEudG9yc28uc3RhdHVzICYgMHgwMTtcbiAgICAgICAgICAgIGlmKCB0ZW1wTmVjayAmJiB0ZW1wUGVsdmlzICYmIHRlbXBUb3Jzbyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2luZGV4ZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnBhc3NlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9sb2dnaW5nIGZvciBuZWNrIHN0YXR1c1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3JvYm90Jyk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2luZGV4U3RhdHVzJ10ubmVja0luZGV4U3RhdHVzID0gdGVtcE5lY2s7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2luZGV4U3RhdHVzJ10ucGVsdmlzSW5kZXhTdGF0dXMgPSB0ZW1wUGVsdmlzO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydpbmRleFN0YXR1cyddLnRvcnNvSW5kZXhTdGF0dXMgPSB0ZW1wVG9yc287XG4gICAgICAgICAgICAvL1JVTk5JTkcgSU4gU0lNTEFUT1JcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vaWYgc2ltdWxhdG9yLCBtYXJrIGluZGV4IGFuZCB0aGVybWlzdG9yIGFzIHRydWVcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnaW5kZXhSZXN1bHQnXS5wYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydpbmRleFN0YXR1cyddLm5lY2tJbmRleFN0YXR1cyA9IFwidGVtcE5lY2tcIjtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnaW5kZXhTdGF0dXMnXS5wZWx2aXNJbmRleFN0YXR1cyA9IFwidGVtcFBlbHZpc1wiO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydpbmRleFN0YXR1cyddLnRvcnNvSW5kZXhTdGF0dXMgPSBcInRlbXBUb3Jzb1wiO1xuICAgICAgICB9XG4gICAgICAgIC8vbG9nIGluZGV4IHZhbHVlc1xuICAgICAgICB0aGlzLndyaXRlUGVyc2lzdGVudERhdGEoKTtcbiAgICB9XG5cbiAgICBleGl0KCkge1xuICAgICAgICB0aGlzLmV4aXRpbmcgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmxvZygnZXhpdCBiZWdpbi10ZXN0Jyk7XG4gICAgICAgIC8vY2xlYXIgYWxsIHZhcmlhYmxlc1xuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJcIik7XG4gICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnbmV4dC1idXR0b24nLCAnY2VudGVyLWJ1dHRvbiddKTtcblxuICAgICAgICB0aGlzLmF4aXNTdGF0ZVNvY2tldC5jbG9zZSgpO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYodGhpcy5leGl0aW5nKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCZWdpblRlc3Q7XG4iLCJpbXBvcnQgQmFzZVRlc3QgZnJvbSBcIi4uL3Rlc3RcIjtcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vY29tbW9uJztcbmxldCBNYWluID0gcmVxdWlyZSgnLi4vYXBwJyk7XG4vLyBsZXQgZnMgPSByZXF1aXJlKCdmcycpO1xuXG4vKlxuKiBObyBkaWFnbm9zdGljIHRlc3RcbiogKi9cbmxldCBzdWNjZXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Y2Nlc3MtYnV0dG9uJyk7XG5sZXQgZmFpbHVyZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYWlsdXJlLWJ1dHRvbicpO1xuXG5jbGFzcyBjZW50ZXJUZXN0IGV4dGVuZHMgQmFzZVRlc3Qge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgdGhpcy5sb2dLZXkgPSBcImNlbnRlclRlc3RcIjtcbiAgICAgICAgdGhpcy5sb2dEYXRhID0ge307XG4gICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10gPSAgICAgICAgIHtcInBhc3NlZFwiOiB1bmRlZmluZWR9O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXSA9ICAgICB7XCJ0ZXN0RHVyYXRpb25cIjogdW5kZWZpbmVkfTtcbiAgICB9XG5cbiAgICBlbnRlcigpIHtcbiAgICAgICAgQ29tbW9uLmNlbnRlclJvYm90KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2VudGVyIGluZGV4IHRlc3QnKTtcblxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignc3VjY2Vzcy1idXR0b24nLCBcIjgwMHB4XCIsIFwiMzYwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMoc3VjY2Vzc0J1dHRvbiwgZmFpbHVyZUJ1dHRvbiwgXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5wYXNzZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdmYWlsdXJlLWJ1dHRvbicsIFwiNDAwcHhcIiwgXCIzNjBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcImZhaWx1cmVcIik7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnBhc3NlZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCduZXh0LWJ1dHRvbicsIFwiMTAwcHhcIiwgXCIzMDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAvL2xvZyB0aW1lXG4gICAgICAgICAgICB0aGlzLmN1clRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsndGltZSddLnRlc3REdXJhdGlvbiA9IChNYXRoLmFicyh0aGlzLmN1clRpbWUgLSB0aGlzLnN0YXJ0VGltZSkpO1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMoc3VjY2Vzc0J1dHRvbiwgZmFpbHVyZUJ1dHRvbiwgXCJjbGVhclwiKTtcbiAgICAgICAgICAgIE1haW4uc3RhcnROZXh0VGVzdCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgdGVtcDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDEnKTtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luVG9wID0gXCItMzAwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDInKTtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luVG9wID0gXCIyNXB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLmZvbnRTaXplID0gXCI1MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwzJyk7XG4gICAgICAgIHRlbXAzLnN0eWxlLm1hcmdpblRvcCA9IFwiMzBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlRFU1QgMTogQ0VOVEVSIFRFU1RcIixcIkNvbmZpcm0gaWYgcm9ib3QgaXMgY2VudGVyZWRcIik7XG4gICAgfVxuXG4gICAgZXhpdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2V4aXQgaW5kZXggdGVzdCcpO1xuXG4gICAgICAgIC8vY2xlYXIgYWxsIHZhcmlhYmxlc1xuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJcIik7XG4gICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnbmV4dC1idXR0b24nLCdzdWNjZXNzLWJ1dHRvbicsJ2ZhaWx1cmUtYnV0dG9uJ10pO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2VudGVyVGVzdDsiLCJpbXBvcnQgQmFzZVRlc3QgZnJvbSBcIi4uL3Rlc3RcIjtcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vY29tbW9uJztcbmxldCBNYWluID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5cbi8qXG4qIFRlc3QgZGlzcGxheSBxdWFsaXR5IHdpdGggaW1hZ2UgY3ljbGVcbiogKi9cblxubGV0IHN1Y2Nlc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2Vzcy1idXR0b24nKTtcbmxldCBmYWlsdXJlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhaWx1cmUtYnV0dG9uJyk7XG5sZXQgY2VudGVyQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NlbnRlci1idXR0b24nKTtcblxuY2xhc3MgZGlzcGxheVRlc3QgZXh0ZW5kcyBCYXNlVGVzdCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5maW5pc2hlZFRlc3QgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmltYWdlTGlzdEluZGV4ID0gMDtcblxuICAgICAgICB0aGlzLmVuZFNjcmVlbiA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbICBcImltYWdlcy9ibHVlLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW1hZ2VzL3JlZC5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlcy9ncmVlbi5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlcy9ibGFjay5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlcy93aGl0ZS5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlcy8yNUZyb21CbGFjay5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlcy8yNUZyb21XaGl0ZS5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImltYWdlcy8zUHhCb3JkZXIucG5nXCJdXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIHRoaXMubG9nS2V5ID0gXCJkaXNwbGF5VGVzdFwiO1xuICAgICAgICB0aGlzLmxvZ0RhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXSA9IHtcInBhc3NlZFwiOiB1bmRlZmluZWR9O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXSA9IHtcInRlc3REdXJhdGlvblwiOiB1bmRlZmluZWR9O1xuICAgIH1cblxuICAgIGVudGVyKCkge1xuICAgICAgICBDb21tb24uY2VudGVyUm9ib3QoKTtcblxuICAgICAgICBjb25zb2xlLmxvZygnZW50ZXIgZGlzcGxheSB0ZXN0Jyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBcbiAgICAgICAgbGV0IGNlbnRlckZ1bGxDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnY2VudGVyLWJ1dHRvbiddKTtcbiAgICAgICAgICAgIC8vaWYgcmVzZXQgZmxhZyBpcyBzZXQsIHN0YXJ0IHRlc3Qgb3ZlciBhZ2FpblxuICAgICAgICAgICAgaWYodGhpcy5maW5pc2hlZFRlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkVGVzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlwiKTtcbiAgICAgICAgICAgICAgICBDb21tb24uX2NsZWFyQnV0dG9uRnJvbVNjcmVlbihbJ25leHQtYnV0dG9uJywgJ3N1Y2Nlc3MtYnV0dG9uJywgJ2ZhaWx1cmUtYnV0dG9uJ10pO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiY2xlYXJcIik7XG4gICAgICAgICAgICAgICAgQ29tbW9uLl9hZGRCdXR0b25MaXN0ZW5lcignY29udGFpbmVyJywgY2VudGVyRnVsbENhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHRoaXMuaW1hZ2VMaXN0SW5kZXggPCB0aGlzLmltYWdlTGlzdC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kU2NyZWVuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgLy9jbGVhciBuZXh0IGJ1dHRvbiBhbmQgc2NyZWVuIHRleHRcbiAgICAgICAgICAgICAgICBDb21tb24uX2NsZWFyQnV0dG9uRnJvbVNjcmVlbihbJ25leHQtYnV0dG9uJ10pO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlwiKTtcbiAgICAgICAgICAgICAgICBjZW50ZXJCdXR0b24uaW5uZXJIVE1MID0gXCJOZXh0XCI7XG4gICAgICAgICAgICAgICAgQ29tbW9uLl9zZXRTaG93QmFja2dyb3VuZCh0cnVlLCB0aGlzLmltYWdlTGlzdFt0aGlzLmltYWdlTGlzdEluZGV4XSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3RJbmRleCsrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZFNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiVEVTVCAzOiBESVNQTEFZIFFVQUxJVFkgVEVTVFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDaG9vc2UgRkFJTCBpZiBpbWFnZXMgd2VyZSBub3Qgc2hhcnAgYW5kIGNsZWFyXCIpO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0U2hvd0JhY2tncm91bmQoZmFsc2UsdGhpcy5pbWFnZUxpc3RbMF0pO1xuICAgICAgICAgICAgICAgIGNlbnRlckJ1dHRvbi5pbm5lckhUTUwgPSBcIlJlZG9cIjtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkVGVzdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgbGV0IG5leHRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy9sb2cgdGltZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1clRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10udGVzdER1cmF0aW9uID0gKE1hdGguYWJzKHRoaXMuY3VyVGltZSAtIHRoaXMuc3RhcnRUaW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiY2xlYXJcIik7XG4gICAgICAgICAgICAgICAgICAgIE1haW4uc3RhcnROZXh0VGVzdCgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdzdWNjZXNzLWJ1dHRvbicsIFwiODAwcHhcIiwgXCIzMDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5wYXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgJzUwcHgnLCAnMzAwcHgnLCBuZXh0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignZmFpbHVyZS1idXR0b24nLCBcIjI3NXB4XCIsIFwiMzAwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10ucGFzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignbmV4dC1idXR0b24nLCAnNTBweCcsICczMDBweCcsIG5leHRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdjZW50ZXItYnV0dG9uJywgXCI1MDBweFwiLCBcIjUwMHB4XCIsIGNlbnRlckZ1bGxDYWxsYmFjaywgXCJSRURPXCIpO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fcmVtb3ZlQnV0dG9uTGlzdGVuZXIoJ2NvbnRhaW5lcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignY2VudGVyLWJ1dHRvbicsICc1NDBweCcsICc0MDBweCcsIGNlbnRlckZ1bGxDYWxsYmFjaywgJ1RFU1QnKTtcbiAgICAgICAgQ29tbW9uLl9hZGRCdXR0b25MaXN0ZW5lcignY29udGFpbmVyJywgY2VudGVyRnVsbENhbGxiYWNrKTtcblxuICAgICAgICBsZXQgdGVtcDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDEnKTtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luVG9wID0gXCItMjgwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDInKTtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luVG9wID0gXCIyNXB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLmZvbnRTaXplID0gXCI1MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwzJyk7XG4gICAgICAgIHRlbXAzLnN0eWxlLm1hcmdpblRvcCA9IFwiMjVweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wNCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsNCcpO1xuICAgICAgICB0ZW1wNC5zdHlsZS5tYXJnaW5Ub3AgPSBcIjI1cHhcIjtcbiAgICAgICAgdGVtcDQuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDQuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJURVNUIDM6IERJU1BMQVkgVEVTVFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiUHJlc3MgVEVTVCB0byBiZWdpbi4gT2JzZXJ2ZSBzY3JlZW4gYW5kIGxvb2sgZm9yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWQgcGl4ZWxzLCBpcnJlZ3VsYXIgbGluZXMgb3IgZGlzdG9ydGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGFwIHRoZSBzY3JlZW4gdG8gYWR2YW5jZS5cIik7XG4gICAgfVxuXG4gICAgZXhpdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJleGl0IGRpc3BsYXkgdGVzdFwiKTtcbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiXCIpO1xuICAgICAgICBDb21tb24uX2NsZWFyQnV0dG9uRnJvbVNjcmVlbihbJ25leHQtYnV0dG9uJywnY2VudGVyLWJ1dHRvbicsXG4gICAgICAgICAgICAgICAgJ3N1Y2Nlc3MtYnV0dG9uJywnZmFpbHVyZS1idXR0b24nXSk7XG4gICAgICAgIENvbW1vbi5fcmVtb3ZlQnV0dG9uTGlzdGVuZXIoJ2NvbnRhaW5lcicpO1xuICAgIH1cblxuICAgIC8vcGVyZm9ybSB0ZXN0IGluIGhlcmVcbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmV4aXRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkaXNwbGF5VGVzdDsiLCJpbXBvcnQgQmFzZVRlc3QgZnJvbSBcIi4uL3Rlc3RcIjtcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vY29tbW9uJztcbmxldCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xubGV0IHByb2plY3RSb290ID0gcmVxdWlyZSgnLi4vcHJvamVjdC1yb290Jyk7XG5sZXQgamlibyA9IHJlcXVpcmUoJ2ppYm8nKTtcbmxldCBNYWluID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5pbXBvcnQgYnRzIGZyb20gJy4uL2J0cyc7XG5cblxuLypcbiogQm9keSB0ZXN0XG4qICovXG5cbmxldCBuZWNrUGFzc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWNjZXNzLWJ1dHRvbicpO1xubGV0IG5lY2tGYWlsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhaWx1cmUtYnV0dG9uJyk7XG5sZXQgdG9yc29QYXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Y2Nlc3MtYnV0dG9uLTInKTtcbmxldCB0b3Jzb0ZhaWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFpbHVyZS1idXR0b24tMicpO1xubGV0IHBlbHZpc1Bhc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2Vzcy1idXR0b24tMycpO1xubGV0IHBlbHZpc0ZhaWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFpbHVyZS1idXR0b24tMycpO1xuXG5jbGFzcyBmcmVlQWlyVGVzdCBleHRlbmRzIEJhc2VUZXN0IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRlZFRlc3QgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52ZWxUaHJlc2ggPSAuMjU7XG5cbiAgICAgICAgdGhpcy5ib2R5RGF0YSA9IFwiXCI7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIHRoaXMubG9nS2V5ID0gXCJmcmVlQWlyVGVzdFwiO1xuICAgICAgICB0aGlzLmxvZ0RhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWyduZWNrJ10gPSB7XCJjdXJBcnJheVwiOltdLCBcInZlbEFycmF5XCI6W119O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RvcnNvJ10gPSB7XCJjdXJBcnJheVwiOltdLCBcInZlbEFycmF5XCI6W119O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3BlbHZpcyddID0ge1wiY3VyQXJyYXlcIjpbXSwgXCJ2ZWxBcnJheVwiOltdfTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10gPSB7XCJ0ZXN0RHVyYXRpb25cIjogdW5kZWZpbmVkfTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXSA9IHtcImZyZWVBaXJUZXN0TmVja09ic2VydmF0aW9uXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmcmVlQWlyVGVzdFRvcnNvT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZyZWVBaXJUZXN0UGVsdmlzT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkfTtcblxuICAgICAgICB0aGlzLmxvZ0RhdGFbJ2ZhdWx0cyddID0ge1wiZnJlZUFpclRlc3ROZWNrRmF1bHRcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZnJlZUFpclRlc3RUb3Jzb0ZhdWx0XCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZyZWVBaXJUZXN0UGVsdmlzRmF1bHRcIjogdW5kZWZpbmVkfVxuICAgIH1cblxuICAgIF93YXJtVXAoKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJib2R5IHdhcm11cFwiKTtcbiAgICAgICAgdGhpcy5yb290ID0gamliby5idC5jcmVhdGUoYnRzWydXYXJtVXBNb3ZlbWVudHMnXSk7XG4gICAgICAgIHRoaXMucm9vdC5zdGFydCgpO1xuICAgICAgICBpZighdGhpcy5zdGFydGVkVGVzdCl7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWRUZXN0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVudGVyKCkge1xuICAgICAgICBDb21tb24uY2VudGVyUm9ib3QoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcImVudGVyIGJvZGllcyB0ZXN0XCIpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uZnJlZUFpclRlc3ROZWNrT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdFBlbHZpc09ic2VydmF0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYXhpc1NvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL2xvY2FsaG9zdDo4MjgyL2F4aXNfc3RhdGVcIik7XG5cbiAgICAgICAgdGhpcy5fd2FybVVwKCk7XG5cbiAgICAgICAgLy9uZWNrIHNwaW5cbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCduZWNrLWJ1dHRvbicsIFwiOTAwcHhcIiwgXCIyNTBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zZXRTcGluTG9naWModHJ1ZSwgJ25lY2snKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vdG9yc28gc3BpblxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvcnNvLWJ1dHRvbicsIFwiOTAwcHhcIiwgXCI0MDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zZXRTcGluTG9naWModHJ1ZSwgJ3RvcnNvJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvL3BlbHZpcyBzcGluXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigncGVsdmlzLWJ1dHRvbicsIFwiOTAwcHhcIiwgXCI1NTBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zZXRTcGluTG9naWModHJ1ZSwgJ3BlbHZpcycpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL25lY2sgcGFzc1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3N1Y2Nlc3MtYnV0dG9uJywgXCI2MDBweFwiLCBcIjI1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKG5lY2tQYXNzQnV0dG9uLCBuZWNrRmFpbEJ1dHRvbiwgXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdE5lY2tPYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICAvL25lY2sgZmFpbFxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2ZhaWx1cmUtYnV0dG9uJywgXCIzMDBweFwiLCBcIjI1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKG5lY2tQYXNzQnV0dG9uLCBuZWNrRmFpbEJ1dHRvbiwgXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdE5lY2tPYnNlcnZhdGlvbiA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy90b3JzbyBwYXNzXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignc3VjY2Vzcy1idXR0b24tMicsIFwiNjAwcHhcIiwgXCI0MDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyh0b3Jzb1Bhc3NCdXR0b24sIHRvcnNvRmFpbEJ1dHRvbiwgXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy90b3JzbyBmYWlsXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignZmFpbHVyZS1idXR0b24tMicsIFwiMzAwcHhcIiwgXCI0MDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyh0b3Jzb1Bhc3NCdXR0b24sIHRvcnNvRmFpbEJ1dHRvbiwgXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5mcmVlQWlyVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vcGVsdmlzIHBhc3NcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdzdWNjZXNzLWJ1dHRvbi0zJywgXCI2MDBweFwiLCBcIjU1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHBlbHZpc1Bhc3NCdXR0b24sIHBlbHZpc0ZhaWxCdXR0b24sIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uZnJlZUFpclRlc3RQZWx2aXNPYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICAvL3BlbHZpcyBmYWlsXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignZmFpbHVyZS1idXR0b24tMycsIFwiMzAwcHhcIiwgXCI1NTBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhwZWx2aXNQYXNzQnV0dG9uLCBwZWx2aXNGYWlsQnV0dG9uLCBcImZhaWx1cmVcIik7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLmZyZWVBaXJUZXN0UGVsdmlzT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCduZXh0LWJ1dHRvbicsICcxMDBweCcsICczMDBweCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10udGVzdER1cmF0aW9uID0gKE1hdGguYWJzKHRoaXMuY3VyVGltZSAtIHRoaXMuc3RhcnRUaW1lKSk7XG4gICAgICAgICAgICBpZih0aGlzLmJvZHlEYXRhKXtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2ZhdWx0cyddLmZyZWVBaXJUZXN0TmVja0ZhdWx0ID0gKHRoaXMuYm9keURhdGEubmVjay5mYXVsdF9zdGF0dXMpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnZmF1bHRzJ10uZnJlZUFpclRlc3RUb3Jzb0ZhdWx0ID0gKHRoaXMuYm9keURhdGEudG9yc28uZmF1bHRfc3RhdHVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2ZhdWx0cyddLmZyZWVBaXJUZXN0UGVsdmlzRmF1bHQgPSAodGhpcy5ib2R5RGF0YS5wZWx2aXMuZmF1bHRfc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1haW4uc3RhcnROZXh0VGVzdCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgdGVtcDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDEnKTtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luVG9wID0gXCItMzAwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUuZm9udFNpemUgPSBcIjQwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDInKTtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luVG9wID0gXCIyMHB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLmZvbnRTaXplID0gXCI0MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwzJyk7XG4gICAgICAgIHRlbXAzLnN0eWxlLm1hcmdpblRvcCA9IFwiMzBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5mb250U2l6ZSA9IFwiNDBweFwiO1xuXG4gICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlRFU1QgNjogRlJFRS1BSVIgUk9UQVRJT05cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlNlbGVjdCBhIGJvZHkgc2VnbWVudCB0byBiZWdpbiB0ZXN0LiAgQ2hvb3NlIEZBSUwgaWYgYm9keVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibW92ZW1lbnQgaXMgZXJyYXRpYy5cIik7XG5cbiAgICAgICAgLy9jb2xsZWN0IGNhbGxiYWNrIG9mIGJvZHlEYXRhXG4gICAgICAgIHRoaXMudGVzdEFQSSggKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmJvZHlEYXRhID0gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vQVBJIHRvIGNvbGxlY3QgYm9keSBkYXRhIGFuZCBwYXJzZVxuICAgIHRlc3RBUEkoY2Ipe1xuICAgICAgICB0aGlzLmF4aXNTb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgY2IoSlNPTi5wYXJzZShldmVudC5kYXRhKSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZXhpdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJleGl0IGJvZGllcyB0ZXN0XCIpO1xuICAgICAgICBpZih0aGlzLnJvb3Qpe1xuICAgICAgICAgICAgdGhpcy5yb290LnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiXCIpO1xuXG4gICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnbmVjay1idXR0b24nLCdwZWx2aXMtYnV0dG9uJywndG9yc28tYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzLWJ1dHRvbicsICdmYWlsdXJlLWJ1dHRvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzcy1idXR0b24tMicsICdmYWlsdXJlLWJ1dHRvbi0yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzLWJ1dHRvbi0zJywgJ3N1Y2Nlc3MtYnV0dG9uLTMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICduZXh0LWJ1dHRvbiddKTtcblxuICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhuZWNrUGFzc0J1dHRvbiwgbmVja0ZhaWxCdXR0b24sIFwiY2xlYXJcIik7XG4gICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHRvcnNvUGFzc0J1dHRvbiwgdG9yc29GYWlsQnV0dG9uLCBcImNsZWFyXCIpO1xuICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhwZWx2aXNQYXNzQnV0dG9uLCBwZWx2aXNGYWlsQnV0dG9uLCBcImNsZWFyXCIpO1xuICAgICAgICB0aGlzLnN0YXJ0ZWRUZXN0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgIF9zZXRTcGluTG9naWMoYm9keUJ1dHRvbiwgYm9keSl7XG4gICAgICAgIHRoaXMucm9vdCA9IGppYm8uYnQuY3JlYXRlKCBidHNbYm9keSArICctc3Bpbi1ib3RoJ10pO1xuICAgICAgICB0aGlzLnJvb3Quc3RhcnQoKTtcblxuICAgICAgICAvL2luZGljYXRlIHRlc3QgaGFzIHN0YXJ0ZWQgdG8gYWxsb3cgcm9vdCB1cGRhdGluZ1xuICAgICAgICBpZighdGhpcy5zdGFydGVkVGVzdCl7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWRUZXN0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgIC8vTG9nZ2luZyBsb2dpY1xuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgaWYodGhpcy5ib2R5RGF0YS5uZWNrICE9IHVuZGVmaW5lZCAmJiB0aGlzLmJvZHlEYXRhLm5lY2sudmVsID4gdGhpcy52ZWxUaHJlc2gpe1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyduZWNrJ10uY3VyQXJyYXkucHVzaCh0aGlzLmJvZHlEYXRhLm5lY2suY3VyLnRvRml4ZWQoNSkpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyduZWNrJ10udmVsQXJyYXkucHVzaCh0aGlzLmJvZHlEYXRhLm5lY2sudmVsLnRvRml4ZWQoNSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5ib2R5RGF0YS50b3JzbyAhPSB1bmRlZmluZWQgJiYgdGhpcy5ib2R5RGF0YS50b3Jzby52ZWwgPiB0aGlzLnZlbFRocmVzaCl7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RvcnNvJ10uY3VyQXJyYXkucHVzaCh0aGlzLmJvZHlEYXRhLnRvcnNvLmN1ci50b0ZpeGVkKDUpKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsndG9yc28nXS52ZWxBcnJheS5wdXNoKHRoaXMuYm9keURhdGEudG9yc28udmVsLnRvRml4ZWQoNSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5ib2R5RGF0YS5wZWx2aXMgIT0gdW5kZWZpbmVkICYmIHRoaXMuYm9keURhdGEucGVsdmlzLnZlbCA+IHRoaXMudmVsVGhyZXNoKXtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncGVsdmlzJ10uY3VyQXJyYXkucHVzaCh0aGlzLmJvZHlEYXRhLnBlbHZpcy5jdXIudG9GaXhlZCg1KSk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3BlbHZpcyddLnZlbEFycmF5LnB1c2godGhpcy5ib2R5RGF0YS5wZWx2aXMudmVsLnRvRml4ZWQoNSkpO1xuICAgICAgICB9XG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgLy9vbmx5IHVwZGF0ZSBpZiB0ZXN0IGhhcyBzdGFydGVkXG4gICAgICAgIGlmKHRoaXMuc3RhcnRlZFRlc3Qpe1xuICAgICAgICAgICAgdGhpcy5yb290LnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVBaXJUZXN0O1xuIiwiaW1wb3J0IEJhc2VUZXN0IGZyb20gXCIuLi90ZXN0XCI7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL2NvbW1vbic7XG5sZXQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmxldCBwcm9qZWN0Um9vdCA9IHJlcXVpcmUoJy4uL3Byb2plY3Qtcm9vdCcpO1xubGV0IGppYm8gPSByZXF1aXJlKCdqaWJvJyk7XG5sZXQgTWFpbiA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuaW1wb3J0IGJ0cyBmcm9tICcuLi9idHMnO1xuXG4vKlxuKiBmdWxsIGJvZHkgdGVzdFxuKiAqL1xubGV0IHN1Y2Nlc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2Vzcy1idXR0b24nKTtcbmxldCBmYWlsdXJlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhaWx1cmUtYnV0dG9uJyk7XG5cbmNsYXNzIGZ1bGxCb2R5VGVzdCBleHRlbmRzIEJhc2VUZXN0IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIHRoaXMubG9nS2V5ID0gXCJmdWxsQm9keVRlc3RcIjtcbiAgICAgICAgdGhpcy5sb2dEYXRhID0ge307XG4gICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10gPSAgICAgICAgIHtcInBhc3NlZFwiOiB1bmRlZmluZWR9O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXSA9ICAgICB7XCJ0ZXN0RHVyYXRpb25cIjogdW5kZWZpbmVkfTtcbiAgICB9XG5cbiAgICBlbnRlcigpIHtcbiAgICAgICAgQ29tbW9uLmNlbnRlclJvYm90KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2VudGVyIGZ1bGwgYm9keSB0ZXN0Jyk7XG5cbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3N1Y2Nlc3MtYnV0dG9uJywgXCI4MDBweFwiLCBcIjM2MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10ucGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignZmFpbHVyZS1idXR0b24nLCBcIjQwMHB4XCIsIFwiMzYwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMoc3VjY2Vzc0J1dHRvbiwgZmFpbHVyZUJ1dHRvbiwgXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5wYXNzZWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignY2VudGVyLWJ1dHRvbicsICc1NDBweCcsICc1MDBweCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IGppYm8uYnQuY3JlYXRlKCBidHNbJ2Z1bGxCb2R5QW5pbWF0aW9uJ10pO1xuICAgICAgICAgICAgdGhpcy5yb290LnN0YXJ0KCk7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcImNsZWFyXCIpO1xuICAgICAgICB9LCAnU1BJTicpO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgXCIxMDBweFwiLCBcIjMwMHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIC8vbG9nIHRpbWVcbiAgICAgICAgICAgIHRoaXMuY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10udGVzdER1cmF0aW9uID0gKE1hdGguYWJzKHRoaXMuY3VyVGltZSAtIHRoaXMuc3RhcnRUaW1lKSk7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcImNsZWFyXCIpO1xuICAgICAgICAgICAgTWFpbi5zdGFydE5leHRUZXN0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCB0ZW1wMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMScpO1xuICAgICAgICB0ZW1wMS5zdHlsZS5tYXJnaW5Ub3AgPSBcIi0zMDBweFwiO1xuICAgICAgICB0ZW1wMS5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMS5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMicpO1xuICAgICAgICB0ZW1wMi5zdHlsZS5tYXJnaW5Ub3AgPSBcIjI1cHhcIjtcbiAgICAgICAgdGVtcDIuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDMnKTtcbiAgICAgICAgdGVtcDMuc3R5bGUubWFyZ2luVG9wID0gXCIzMHB4XCI7XG4gICAgICAgIHRlbXAzLnN0eWxlLmZvbnRTaXplID0gXCI1MHB4XCI7XG5cbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiVEVTVCA5OiBGVUxMIEJPRFkgVEVTVFwiLFwiUHJlc3MgU1BJTiB0byBhbmltYXRlIHJvYm90XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJQcmVzcyBGQUlMIGlmIGFueXRoaW5nIGFibm9ybWFsLCBQQVNTIG90aGVyd2lzZVwiKTtcbiAgICB9XG5cbiAgICBleGl0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXhpdCBmdWxsIGJvZHkgdGVzdCcpO1xuICAgICAgICBpZiAodGhpcy5yb290KSB7XG4gICAgICAgICAgICB0aGlzLnJvb3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvL2NsZWFyIGFsbCB2YXJpYWJsZXNcbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiXCIpO1xuICAgICAgICBDb21tb24uX2NsZWFyQnV0dG9uRnJvbVNjcmVlbihbJ25leHQtYnV0dG9uJywnc3VjY2Vzcy1idXR0b24nLCdmYWlsdXJlLWJ1dHRvbicsIFwiY2VudGVyLWJ1dHRvblwiXSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICAvL29ubHkgdXBkYXRlIGlmIHRlc3QgaGFzIHN0YXJ0ZWRcbiAgICAgICAgaWYodGhpcy5yb290KXtcbiAgICAgICAgICAgIHRoaXMucm9vdC51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdWxsQm9keVRlc3Q7XG4iLCJpbXBvcnQgQmFzZVRlc3QgZnJvbSBcIi4uL3Rlc3RcIjtcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vY29tbW9uJztcbmNvbnN0IGppYm8gPSByZXF1aXJlKCdqaWJvJyk7XG5sZXQgTWFpbiA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuXG4vKlxuKiBUZXN0IHRvdWNoIHNlbnNvcnNcbiogKi9cbmxldCBzdWNjZXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Y2Nlc3MtYnV0dG9uJyk7XG5sZXQgZmFpbHVyZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmYWlsdXJlLWJ1dHRvbicpO1xuXG5jbGFzcyBoZWFkVG91Y2hUZXN0IGV4dGVuZHMgQmFzZVRlc3Qge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmluaXNoZWRUZXN0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGVzdGluZyA9IGZhbHNlO1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIHRoaXMubG9nS2V5ID0gXCJoZWFkVG91Y2hUZXN0XCI7XG4gICAgICAgIHRoaXMubG9nRGF0YSA9IHt9O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddID0ge1wicGFzc2VkXCI6IHVuZGVmaW5lZH07XG4gICAgICAgIHRoaXMubG9nRGF0YVsndGltZSddID0ge1widGVzdER1cmF0aW9uXCI6IHVuZGVmaW5lZH07XG4gICAgICAgIHRoaXMubG9nRGF0YVsndG91Y2hwYWRzJ10gPSB7XCJpc0FjdGl2YXRlZFwiOlt1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZF19XG4gICAgfVxuXG4gICAgZW50ZXIoKSB7XG4gICAgICAgIENvbW1vbi5jZW50ZXJSb2JvdCgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdlbnRlciB0b3VjaHBhZHMgdGVzdCcpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgdGhpcy50b3VjaHBhZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG91Y2hwYWRzJyk7XG5cbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCd0b3VjaHBhZC0zJywgJzEwMjVweCcsICcyNTBweCcpO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvdWNocGFkLTQnLCAnMTAyNXB4JywgJzM3NXB4Jyk7XG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigndG91Y2hwYWQtNScsICcxMDI1cHgnLCAnNTAwcHgnKTtcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCd0b3VjaHBhZC0wJywgJzkwMHB4JywgJzI1MHB4Jyk7XG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigndG91Y2hwYWQtMScsICc5MDBweCcsICczNzVweCcpO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvdWNocGFkLTInLCAnOTAwcHgnLCAnNTAwcHgnKTtcblxuICAgICAgICBsZXQgbmV4dENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgLy9sb2cgdGltZVxuICAgICAgICAgICAgdGhpcy5jdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXS50ZXN0RHVyYXRpb24gPSAoTWF0aC5hYnModGhpcy5jdXJUaW1lIC0gdGhpcy5zdGFydFRpbWUpKTtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiY2xlYXJcIik7XG4gICAgICAgICAgICBNYWluLnN0YXJ0TmV4dFRlc3QoKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdzdWNjZXNzLWJ1dHRvbicsIFwiMjc1cHhcIiwgXCIzMDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgXCIxMDBweFwiLCBcIjMwMHB4XCIsIG5leHRDYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2ZhaWx1cmUtYnV0dG9uJywgXCIyNzVweFwiLCBcIjUwMHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10ucGFzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgXCIxMDBweFwiLCBcIjMwMHB4XCIsIG5leHRDYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2NlbnRlci1idXR0b24nLCAnNTc1cHgnLCAnNDAwcHgnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRlc3RpbmcgPSB0cnVlO1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMoc3VjY2Vzc0J1dHRvbiwgZmFpbHVyZUJ1dHRvbiwgXCJjbGVhclwiKTtcbiAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignY2VudGVyLWJ1dHRvbicsICc1MDBweCcsICc0MDBweCcsIG51bGwsICdSRURPJyk7XG4gICAgICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgJzYwMDBweCcsICc1MDBweCcpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPDY7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3RvdWNocGFkQ29udHJvbChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG91Y2hwYWQtJytpKSwgaSwgXCJyZXNldFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgJ1RFU1QnKTtcblxuICAgICAgICBsZXQgdGVtcDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDEnKTtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luVG9wID0gXCItMzAwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUuZm9udFNpemUgPSBcIjQwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDInKTtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luVG9wID0gXCIyNXB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLmZvbnRTaXplID0gXCI0MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwzJyk7XG4gICAgICAgIHRlbXAzLnN0eWxlLm1hcmdpblRvcCA9IFwiMzBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5mb250U2l6ZSA9IFwiNDBweFwiO1xuXG4gICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlRFU1QgNDogSEVBRCBUT1VDSCBTRU5TT1JTXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJSdWIgaGFuZHMgYWxvbmcgYmFjayBvZiBoZWFkIHNldmVyYWwgdGltZXMuICBDaG9vc2UgRkFJTFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWYgYW55IHNlbnNvciBkb2VzIG5vdCBhY3RpdmF0ZVwiKTtcbiAgICB9XG5cbiAgICBleGl0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnZXhpdCB0b3VjaHBhZHMgdGVzdCcpO1xuXG4gICAgICAgIHRoaXMudG91Y2hwYWRzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwxJykuc3R5bGUubWFyZ2luVG9wID0gXCIwcHhcIjtcbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiXCIpO1xuICAgICAgICBDb21tb24uX2NsZWFyQnV0dG9uRnJvbVNjcmVlbihbJ25leHQtYnV0dG9uJywnY2VudGVyLWJ1dHRvbicsJ3N1Y2Nlc3MtYnV0dG9uJywnZmFpbHVyZS1idXR0b24nXSk7XG4gICAgfVxuXG4gICAgX3RvdWNocGFkQ29udHJvbChidXR0b24sIGluZGV4LCBtb2RlKXtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2YXRlZCcsICdyZXNldCcpO1xuICAgICAgICBpZihtb2RlID09PSBcImFjdGl2YXRlZFwiKXtcbiAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmF0ZWQnKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsndG91Y2hwYWRzJ10uaXNBY3RpdmF0ZWRbaW5kZXhdID0gaW5kZXggKyBcIjogXCIgKyB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmKG1vZGUgPT09IFwicmVzZXRcIil7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVzZXQnKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsndG91Y2hwYWRzJ10uaXNBY3RpdmF0ZWRbaW5kZXhdID0gaW5kZXggKyBcIjogXCIgKyBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vcGVyZm9ybSB0ZXN0IGluIGhlcmVcbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGlmKHRoaXMudGVzdGluZyl7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpPDY7IGkrKyl7XG4gICAgICAgICAgICAgICAgaWYoamliby5zeXN0ZW0uYnMudG91Y2hTdGF0ZS5wYWRfc3RhdGVbaV0pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90b3VjaHBhZENvbnRyb2woZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvdWNocGFkLScraSksIGksIFwiYWN0aXZhdGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoZWFkVG91Y2hUZXN0O1xuIiwiaW1wb3J0IEJhc2VUZXN0IGZyb20gXCIuLi90ZXN0XCI7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL2NvbW1vbic7XG5sZXQgamlibyA9IHJlcXVpcmUoJ2ppYm8nKTtcbmxldCBNYWluID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5sZXQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmxldCBwcm9qZWN0Um9vdCA9IHJlcXVpcmUoJy4uL3Byb2plY3Qtcm9vdCcpO1xuaW1wb3J0IGJ0cyBmcm9tICcuLi9idHMnO1xuXG4vKlxuKiBUZXN0IExFRCByaW5nXG4qICovXG5cbmxldCBjZW50ZXJCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2VudGVyLWJ1dHRvbicpO1xubGV0IHN1Y2Nlc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2Vzcy1idXR0b24nKTtcbmxldCBmYWlsdXJlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhaWx1cmUtYnV0dG9uJyk7XG5cbmNsYXNzIExFRFRlc3QgZXh0ZW5kcyBCYXNlVGVzdCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5maW5pc2hlZFRlc3QgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmxlZExpc3RJbmRleCA9IDA7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICB0aGlzLmxvZ0tleSA9IFwibGVkVGVzdFwiO1xuICAgICAgICB0aGlzLmxvZ0RhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10gPSB7XCJ0ZXN0RHVyYXRpb25cIjogdW5kZWZpbmVkfTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXSA9IHtcInBhc3NlZFwiOiB1bmRlZmluZWR9O1xuXG4gICAgICAgIHRoaXMubGVkTGlzdCA9IFtbXCJSRURcIixbMSwwLDBdLCBcImxpbmVhci1ncmFkaWVudCh0byBib3R0b20sICNmZjAwMDAsICNiNDAwMDApXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgW1wiR1JFRU5cIixbMCwxLDBdLFwibGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgIzAwZmYwMCwgIzAwYjQwMClcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbXCJCTFVFXCIsWzAsMCwxXSwgXCJsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjMDAwMGZmLCAjMDAwMGI0KVwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcIldISVRFXCIsIFsxLDEsMV0sXCJsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjZmZmZmZmLCAjYjRiNGI0KVwiXV1cbiAgICB9XG5cbiAgICBfd2FybVVwKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYm9keSB3YXJtdXBcIik7XG4gICAgICAgIHRoaXMucm9vdCA9IGppYm8uYnQuY3JlYXRlKGJ0c1snV2FybVVwTW92ZW1lbnRzJ10pO1xuICAgICAgICB0aGlzLnJvb3Quc3RhcnQoKTtcbiAgICAgICAgaWYoIXRoaXMuc3RhcnRlZFRlc3Qpe1xuICAgICAgICAgICAgdGhpcy5zdGFydGVkVGVzdCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbnRlcigpIHtcbiAgICAgICAgQ29tbW9uLmNlbnRlclJvYm90KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coJ2VudGVyIExFRCB0ZXN0Jyk7XG5cbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICB0aGlzLl93YXJtVXAoKTtcblxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2NlbnRlci1idXR0b24nLCAnNTQwcHgnLCAnNTAwcHgnLCAoKSA9PiB7XG4gICAgICAgICAgICAvL2lmIHJlc2V0IGZsYWcgaXMgc2V0LCBzdGFydCB0ZXN0IG92ZXIgYWdhaW5cbiAgICAgICAgICAgIGlmKHRoaXMuZmluaXNoZWRUZXN0ID09IHRydWUpe1xuICAgICAgICAgICAgICAgIHRoaXMubGVkTGlzdEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmlzaGVkVGVzdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vY2xlYXIgc2NyZWVuIHRleHQgYW5kIG5leHQgYnV0dG9uXG4gICAgICAgICAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiXCIpO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnbmV4dC1idXR0b24nLCdzdWNjZXNzLWJ1dHRvbicsJ2ZhaWx1cmUtYnV0dG9uJ10pO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiY2xlYXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0aGlzLmxlZExpc3RJbmRleCA8IHRoaXMubGVkTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvL1NQSU5cbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QgPSBqaWJvLmJ0LmNyZWF0ZShidHNbJ2hlYWQtQ0NXLXBlbHZpcy1DVyddKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3Quc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAvL2NsZWFyIG5leHQgYnV0dG9uIGFuZCBzY3JlZW4gdGV4dFxuICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlRFU1QgNTogTElHSFQgUklOR1wiLFwiSW5zcGVjdCBsaWdodCByaW5nXCIpO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignY2VudGVyLWJ1dHRvbicsIFwiNTQwcHhcIiwgXCI1MDBweFwiLCBudWxsLCB0aGlzLmxlZExpc3RbdGhpcy5sZWRMaXN0SW5kZXhdWzBdKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2VudGVyLWJ1dHRvbicpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sZWRMaXN0W3RoaXMubGVkTGlzdEluZGV4XVsyXTtcbiAgICAgICAgICAgICAgICAvL3NldCBMRUQgdG8gY29sb3IgZnJvbSBhYm92ZSBsaXN0XG4gICAgICAgICAgICAgICAgQ29tbW9uLnNldExFRCh0aGlzLmxlZExpc3RbdGhpcy5sZWRMaXN0SW5kZXhdWzFdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZExpc3RJbmRleCsrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBDb21tb24ucmVzZXRMRUQoKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2VudGVyLWJ1dHRvbicpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjMjhhNmZhLCAjMjI4MGJhKVwiO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlRFU1QgNjogTElHSFQgUklOR1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJDaG9vc2UgRkFJTCBpZiBhbnkgTEVEcyBkaWQgbm90IGlsbHVtaW5hdGVcIik7XG4gICAgICAgICAgICAgICAgLy9maW5pc2hlZCBjeWNsaW5nIHRocm91Z2ggaW1hZ2UgZGlzcGxheVxuICAgICAgICAgICAgICAgIGNlbnRlckJ1dHRvbi5pbm5lckhUTUwgPSBcIlJFRE9cIjtcbiAgICAgICAgICAgICAgICAvL3NldCBmbGFnIHRoYXQgdGVzdCBjeWNsZSBmaW5pc2hlZCwgaW4gY2FzZSByZWRvXG4gICAgICAgICAgICAgICAgdGhpcy5maW5pc2hlZFRlc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGxldCBuZXh0Q2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vbG9nIHRpbWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsndGltZSddLnRlc3REdXJhdGlvbiA9IChNYXRoLmFicyh0aGlzLmN1clRpbWUgLSB0aGlzLnN0YXJ0VGltZSkpO1xuICAgICAgICAgICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcImNsZWFyXCIpO1xuICAgICAgICAgICAgICAgICAgICBNYWluLnN0YXJ0TmV4dFRlc3QoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignc3VjY2Vzcy1idXR0b24nLCBcIjI3NXB4XCIsIFwiMzAwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10ucGFzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCduZXh0LWJ1dHRvbicsIFwiMTAwcHhcIiwgXCIzMDBweFwiLCBuZXh0Q2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignZmFpbHVyZS1idXR0b24nLCBcIjgwMHB4XCIsIFwiMzAwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcImZhaWx1cmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10ucGFzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignbmV4dC1idXR0b24nLCBcIjEwMHB4XCIsIFwiMzAwcHhcIiwgbmV4dENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgJ1RFU1QnKTtcblxuICAgICAgICBsZXQgdGVtcDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDEnKTtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luVG9wID0gXCItMjgwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDInKTtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luVG9wID0gXCIyNXB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLmZvbnRTaXplID0gXCI1MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwzJyk7XG4gICAgICAgIHRlbXAzLnN0eWxlLm1hcmdpblRvcCA9IFwiMjVweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wNCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsNCcpO1xuICAgICAgICB0ZW1wNC5zdHlsZS5tYXJnaW5Ub3AgPSBcIjI1cHhcIjtcbiAgICAgICAgdGVtcDQuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDQuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJURVNUIDU6IExJR0hUIFJJTkdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlByZXNzIFRFU1QgdG8gYmVnaW4uICBDeWNsZSB0aHJvdWdoIGVhY2ggY29sb3IgYW5kXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2aXN1YWxseSBpbnNwZWN0IGxpZ2h0IHJpbmcuICBDaG9vc2UgRkFJTCBpZiBhbnlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkxFRHMgZG8gbm90IGlsbHVtaW5hdGUgY29ycmVjdGx5LlwiKTtcbiAgICB9XG5cbiAgICBleGl0KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImV4aXQgTEVEIHRlc3RcIik7XG4gICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlwiKTtcbiAgICAgICAgQ29tbW9uLl9jbGVhckJ1dHRvbkZyb21TY3JlZW4oWyduZXh0LWJ1dHRvbicsJ2NlbnRlci1idXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzcy1idXR0b24nLCdmYWlsdXJlLWJ1dHRvbiddKTtcbiAgICB9XG5cbiAgICAvL3BlcmZvcm0gdGVzdCBpbiBoZXJlXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5leGl0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTEVEVGVzdDtcbiIsImltcG9ydCBCYXNlVGVzdCBmcm9tIFwiLi4vdGVzdFwiO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9jb21tb24nO1xubGV0IHByb2plY3RSb290ID0gcmVxdWlyZSgnLi4vcHJvamVjdC1yb290Jyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xubGV0IGppYm8gPSByZXF1aXJlKCdqaWJvJyk7XG5sZXQgTWFpbiA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuaW1wb3J0IGJ0cyBmcm9tICcuLi9idHMnO1xuXG4vKlxuKiBzdGFsbCBDQ1d0ZXN0XG4qICovXG52YXIgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xudmFyIGJ1ZmZlciA9IG51bGw7XG5cbmxldCBuZWNrUGFzc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWNjZXNzLWJ1dHRvbicpO1xubGV0IG5lY2tGYWlsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhaWx1cmUtYnV0dG9uJyk7XG5sZXQgdG9yc29QYXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Y2Nlc3MtYnV0dG9uLTInKTtcbmxldCB0b3Jzb0ZhaWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFpbHVyZS1idXR0b24tMicpO1xubGV0IHBlbHZpc1Bhc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2Vzcy1idXR0b24tMycpO1xubGV0IHBlbHZpc0ZhaWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFpbHVyZS1idXR0b24tMycpO1xuXG5jbGFzcyBTdGFsbENDV1Rlc3QgZXh0ZW5kcyBCYXNlVGVzdCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVBdWRpbyhcIi9hdWRpby9GWF9CbGVlcC5tcDNcIik7XG5cbiAgICAgICAgdGhpcy5zdGFydGVkVGVzdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZlbFRocmVzaCA9IC4yNVxuICAgICAgICB0aGlzLnBsYXlTb3VuZCA9IFt0cnVlLHRydWUsdHJ1ZV07XG5cbiAgICAgICAgdGhpcy5ib2R5RGF0YSA9IFwiXCI7XG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICB0aGlzLmxvZ0tleSA9IFwic3RhbGxDQ1dUZXN0XCI7XG4gICAgICAgIHRoaXMubG9nRGF0YSA9IHt9O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ25lY2snXSA9IHtcImN1ckFycmF5XCI6W10sIFwidmVsQXJyYXlcIjpbXX07XG4gICAgICAgIHRoaXMubG9nRGF0YVsndG9yc28nXSA9IHtcImN1ckFycmF5XCI6W10sIFwidmVsQXJyYXlcIjpbXX07XG4gICAgICAgIHRoaXMubG9nRGF0YVsncGVsdmlzJ10gPSB7XCJjdXJBcnJheVwiOltdLCBcInZlbEFycmF5XCI6W119O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXSA9IHtcInRlc3REdXJhdGlvblwiOiB1bmRlZmluZWR9O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddID0ge1wic3RhbGxDQ1dUZXN0TmVja09ic2VydmF0aW9uXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFsbENDV1Rlc3RUb3Jzb09ic2VydmF0aW9uXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFsbENDV1Rlc3RQZWx2aXNPYnNlcnZhdGlvblwiOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydmYXVsdHMnXSA9IHtcInN0YWxsQ0NXVGVzdE5lY2tGYXVsdFwiOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFsbENDV1Rlc3RUb3Jzb0ZhdWx0XCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ0NXVGVzdFBlbHZpc0ZhdWx0XCI6IHVuZGVmaW5lZH1cbiAgICB9XG5cbiAgICBfd2FybVVwKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYm9keSB3YXJtdXBcIik7XG4gICAgICAgIHRoaXMucm9vdCA9IGppYm8uYnQuY3JlYXRlKCBidHNbJ1dhcm1VcE1vdmVtZW50cyddKTtcbiAgICAgICAgdGhpcy5yb290LnN0YXJ0KCk7XG4gICAgICAgIGlmKCF0aGlzLnN0YXJ0ZWRUZXN0KXtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRlZFRlc3QgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZW50ZXIoKSB7XG4gICAgICAgIENvbW1vbi5jZW50ZXJSb2JvdCgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZW50ZXIgc3RhbGwgQ0NXIHRlc3RcIik7XG5cbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENDV1Rlc3ROZWNrT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENDV1Rlc3RUb3Jzb09ic2VydmF0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDQ1dUZXN0UGVsdmlzT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5heGlzU29ja2V0ID0gbmV3IFdlYlNvY2tldChcIndzOi8vbG9jYWxob3N0OjgyODIvYXhpc19zdGF0ZVwiKTtcblxuICAgICAgICB0aGlzLl93YXJtVXAoKTtcblxuICAgICAgICAvL25lY2sgc3BpblxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25lY2stYnV0dG9uJywgXCI5MDBweFwiLCBcIjI1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheVNvdW5kWzBdID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3NldFNwaW5Mb2dpYyh0cnVlLCAnbmVjaycpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy90b3JzbyBzcGluXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigndG9yc28tYnV0dG9uJywgXCI5MDBweFwiLCBcIjQwMHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheVNvdW5kWzFdID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3NldFNwaW5Mb2dpYyh0cnVlLCAndG9yc28nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vcGVsdmlzIHNwaW5cbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdwZWx2aXMtYnV0dG9uJywgXCI5MDBweFwiLCBcIjU1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheVNvdW5kWzJdID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3NldFNwaW5Mb2dpYyh0cnVlLCAncGVsdmlzJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vbmVjayBwYXNzXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignc3VjY2Vzcy1idXR0b24nLCBcIjYwMHB4XCIsIFwiMjUwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMobmVja1Bhc3NCdXR0b24sIG5lY2tGYWlsQnV0dG9uLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ0NXVGVzdE5lY2tPYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICAvL25lY2sgZmFpbFxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2ZhaWx1cmUtYnV0dG9uJywgXCIzMDBweFwiLCBcIjI1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKG5lY2tQYXNzQnV0dG9uLCBuZWNrRmFpbEJ1dHRvbiwgXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENDV1Rlc3ROZWNrT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vdG9yc28gcGFzc1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3N1Y2Nlc3MtYnV0dG9uLTInLCBcIjYwMHB4XCIsIFwiNDAwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnModG9yc29QYXNzQnV0dG9uLCB0b3Jzb0ZhaWxCdXR0b24sIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDQ1dUZXN0VG9yc29PYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICAvL3RvcnNvIGZhaWxcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdmYWlsdXJlLWJ1dHRvbi0yJywgXCIzMDBweFwiLCBcIjQwMHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHRvcnNvUGFzc0J1dHRvbiwgdG9yc29GYWlsQnV0dG9uLCBcImZhaWx1cmVcIik7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ0NXVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vcGVsdmlzIHBhc3NcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdzdWNjZXNzLWJ1dHRvbi0zJywgXCI2MDBweFwiLCBcIjU1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHBlbHZpc1Bhc3NCdXR0b24sIHBlbHZpc0ZhaWxCdXR0b24sIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDQ1dUZXN0UGVsdmlzT2JzZXJ2YXRpb24gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy9wZWx2aXMgZmFpbFxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2ZhaWx1cmUtYnV0dG9uLTMnLCBcIjMwMHB4XCIsIFwiNTUwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMocGVsdmlzUGFzc0J1dHRvbiwgcGVsdmlzRmFpbEJ1dHRvbiwgXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENDV1Rlc3RQZWx2aXNPYnNlcnZhdGlvbiA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgJzEwMHB4JywgJzMwMHB4JywgKCkgPT4ge1xuICAgICAgICAgICAgLy9sb2cgdGltZVxuICAgICAgICAgICAgdGhpcy5jdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXS50ZXN0RHVyYXRpb24gPSAoTWF0aC5hYnModGhpcy5jdXJUaW1lIC0gdGhpcy5zdGFydFRpbWUpKTtcbiAgICAgICAgICAgIGlmKHRoaXMuYm9keURhdGEpe1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnZmF1bHRzJ10uc3RhbGxDQ1dUZXN0TmVja0ZhdWx0ID0gKHRoaXMuYm9keURhdGEubmVjay5mYXVsdF9zdGF0dXMpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnZmF1bHRzJ10uc3RhbGxDQ1dUZXN0VG9yc29GYXVsdCA9ICh0aGlzLmJvZHlEYXRhLnRvcnNvLmZhdWx0X3N0YXR1cyk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydmYXVsdHMnXS5zdGFsbENDV1Rlc3RQZWx2aXNGYXVsdCA9ICh0aGlzLmJvZHlEYXRhLnBlbHZpcy5mYXVsdF9zdGF0dXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTWFpbi5zdGFydE5leHRUZXN0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCB0ZW1wMSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMScpO1xuICAgICAgICB0ZW1wMS5zdHlsZS5tYXJnaW5Ub3AgPSBcIi0zMDBweFwiO1xuICAgICAgICB0ZW1wMS5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMS5zdHlsZS5mb250U2l6ZSA9IFwiNDBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMicpO1xuICAgICAgICB0ZW1wMi5zdHlsZS5tYXJnaW5Ub3AgPSBcIjIwcHhcIjtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDIuc3R5bGUuZm9udFNpemUgPSBcIjQwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDMnKTtcbiAgICAgICAgdGVtcDMuc3R5bGUubWFyZ2luVG9wID0gXCIyMHB4XCI7XG4gICAgICAgIHRlbXAzLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAzLnN0eWxlLmZvbnRTaXplID0gXCI0MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXA0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWw0Jyk7XG4gICAgICAgIHRlbXA0LnN0eWxlLm1hcmdpblRvcCA9IFwiMjBweFwiO1xuICAgICAgICB0ZW1wNC5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wNC5zdHlsZS5mb250U2l6ZSA9IFwiNDBweFwiO1xuXG4gICAgICAgIENvbW1vbi5fc2V0U2NyZWVuVGV4dChcIlRFU1QgODogU1RBTEwgREVURUNUSU9OIENPVU5URVItQ0xPQ0tXSVNFXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTZWxlY3QgYSBzZWdtZW50IHRvIHRlc3QuICBHcmFiIGFuZCBob2xkIHNlZ21lbnQgdW50aWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInlvdSBoZWFyIGEgdG9uZS4gIENob29zZSBGQUlMIGlmIHNlZ21lbnQgZG9lcyBub3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJlaGF2ZSBub3JtYWxseS5cIik7XG5cbiAgICAgICAgLy9jb2xsZWN0IGNhbGxiYWNrIG9mIGJvZHlEYXRhXG4gICAgICAgIHRoaXMudGVzdEFQSSggKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmJvZHlEYXRhID0gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXRpYWxpemVBdWRpbyhhdWRpb1N0cil7XG4gICAgICAgIHRoaXMuYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgbGV0IHVybCA9IHBhdGgubm9ybWFsaXplKGdsb2JhbC5fX2Rpcm5hbWUgKyBhdWRpb1N0cik7XG4gICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gRGVjb2RlIGFzeW5jaHJvbm91c2x5XG4gICAgICAgICAgICBhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHJlcXVlc3QucmVzcG9uc2UsIGZ1bmN0aW9uKF9idWZmZXIpIHtcbiAgICAgICAgICAgICAgICBidWZmZXIgPSBfYnVmZmVyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfVxuXG4gICAgLy9BUEkgdG8gY29sbGVjdCBib2R5IGRhdGEgYW5kIHBhcnNlXG4gICAgdGVzdEFQSShjYil7XG4gICAgICAgIHRoaXMuYXhpc1NvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBjYihKU09OLnBhcnNlKGV2ZW50LmRhdGEpKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBleGl0KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImV4aXQgc3RhbGwgQ0NXIHRlc3RcIik7XG4gICAgICAgIGlmKHRoaXMucm9vdCl7XG4gICAgICAgICAgICB0aGlzLnJvb3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJcIik7XG5cbiAgICAgICAgQ29tbW9uLl9jbGVhckJ1dHRvbkZyb21TY3JlZW4oWyduZWNrLWJ1dHRvbicsJ3BlbHZpcy1idXR0b24nLCd0b3Jzby1idXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N1Y2Nlc3MtYnV0dG9uJywgJ2ZhaWx1cmUtYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzLWJ1dHRvbi0yJywgJ2ZhaWx1cmUtYnV0dG9uLTInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N1Y2Nlc3MtYnV0dG9uLTMnLCAnZmFpbHVyZS1idXR0b24tMycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25leHQtYnV0dG9uJ10pO1xuICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhuZWNrUGFzc0J1dHRvbiwgbmVja0ZhaWxCdXR0b24sIFwiY2xlYXJcIik7XG4gICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHRvcnNvUGFzc0J1dHRvbiwgdG9yc29GYWlsQnV0dG9uLCBcImNsZWFyXCIpO1xuICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhwZWx2aXNQYXNzQnV0dG9uLCBwZWx2aXNGYWlsQnV0dG9uLCBcImNsZWFyXCIpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRlZFRlc3QgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBfc2V0U3BpbkxvZ2ljKGJvZHlCdXR0b24sIGJvZHkpe1xuICAgICAgICBpZiAodGhpcy5yb290KSB7XG4gICAgICAgICAgICB0aGlzLnJvb3Quc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJvb3QgPSBqaWJvLmJ0LmNyZWF0ZShidHNbYm9keSArICctc3Bpbi0zNjAtJyArIFwiQ0NXXCIgXSk7XG4gICAgICAgIHRoaXMucm9vdC5zdGFydCgpO1xuICAgICAgICAvL2luZGljYXRlIHRlc3QgaGFzIHN0YXJ0ZWQgdG8gYWxsb3cgcm9vdCB1cGRhdGluZ1xuICAgICAgICBpZighdGhpcy5zdGFydGVkVGVzdCl7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWRUZXN0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9wbGF5U291bmRBbmRMb2coaW5kZXgpe1xuICAgICAgICBpZih0aGlzLnBsYXlTb3VuZFtpbmRleF0pe1xuICAgICAgICAgICAgdGhpcy5fc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5fcGxheSgpO1xuICAgICAgICAgICAgdGhpcy5wbGF5U291bmRbaW5kZXhdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfc3RvcCgpe1xuICAgICAgICBpZiAoIXRoaXMuYnVmZmVyU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZSA9IG51bGw7XG4gICAgfVxuXG4gICAgX3BsYXkoKXtcbiAgICAgICAgaWYgKCFidWZmZXIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXVkaW8gYnVmZmVyIG5vdCBsb2FkZWQgeWV0Li4uXCIpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5zdGFydCgwKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAvL0xvZ2dpbmcgbG9naWNcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIGlmKHRoaXMuYm9keURhdGEubmVjayAhPSB1bmRlZmluZWQgJiYgdGhpcy5ib2R5RGF0YS5uZWNrLnZlbCA+IHRoaXMudmVsVGhyZXNoKXtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnbmVjayddLmN1ckFycmF5LnB1c2godGhpcy5ib2R5RGF0YS5uZWNrLmN1ci50b0ZpeGVkKDUpKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnbmVjayddLnZlbEFycmF5LnB1c2godGhpcy5ib2R5RGF0YS5uZWNrLnZlbC50b0ZpeGVkKDUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMuYm9keURhdGEudG9yc28gIT0gdW5kZWZpbmVkICYmIHRoaXMuYm9keURhdGEudG9yc28udmVsID4gdGhpcy52ZWxUaHJlc2gpe1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyd0b3JzbyddLmN1ckFycmF5LnB1c2godGhpcy5ib2R5RGF0YS50b3Jzby5jdXIudG9GaXhlZCg1KSk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RvcnNvJ10udmVsQXJyYXkucHVzaCh0aGlzLmJvZHlEYXRhLnRvcnNvLnZlbC50b0ZpeGVkKDUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMuYm9keURhdGEucGVsdmlzICE9IHVuZGVmaW5lZCAmJiB0aGlzLmJvZHlEYXRhLnBlbHZpcy52ZWwgPiB0aGlzLnZlbFRocmVzaCl7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3BlbHZpcyddLmN1ckFycmF5LnB1c2godGhpcy5ib2R5RGF0YS5wZWx2aXMuY3VyLnRvRml4ZWQoNSkpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydwZWx2aXMnXS52ZWxBcnJheS5wdXNoKHRoaXMuYm9keURhdGEucGVsdmlzLnZlbC50b0ZpeGVkKDUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMuYm9keURhdGEpe1xuICAgICAgICAgICAgaWYodGhpcy5ib2R5RGF0YS5uZWNrLmZhdWx0X3N0YXR1cyAmIDB4MDIpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMucGxheVNvdW5kWzBdKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kQW5kTG9nKDApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXlTb3VuZFswXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHRoaXMuYm9keURhdGEudG9yc28uZmF1bHRfc3RhdHVzICYgMHgwMil7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5wbGF5U291bmRbMV0pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5U291bmRBbmRMb2coMSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheVNvdW5kWzFdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodGhpcy5ib2R5RGF0YS5wZWx2aXMuZmF1bHRfc3RhdHVzICYgMHgwMil7XG4gICAgICAgICAgICAgICAgaWYodGhpcy5wbGF5U291bmRbMl0pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5U291bmRBbmRMb2coMik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheVNvdW5kWzJdID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgLy9vbmx5IHVwZGF0ZSBpZiB0ZXN0IGhhcyBzdGFydGVkXG4gICAgICAgIGlmKHRoaXMuc3RhcnRlZFRlc3Qpe1xuICAgICAgICAgICAgdGhpcy5yb290LnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWxsQ0NXVGVzdDtcbiIsImltcG9ydCBCYXNlVGVzdCBmcm9tIFwiLi4vdGVzdFwiO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9jb21tb24nO1xubGV0IHByb2plY3RSb290ID0gcmVxdWlyZSgnLi4vcHJvamVjdC1yb290Jyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xubGV0IGppYm8gPSByZXF1aXJlKCdqaWJvJyk7XG5sZXQgTWFpbiA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuaW1wb3J0IGJ0cyBmcm9tICcuLi9idHMnO1xuXG4vKlxuKiBzdGFsbCBDVyB0ZXN0XG4qICovXG52YXIgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xudmFyIGJ1ZmZlciA9IG51bGw7XG5cbmxldCBuZWNrUGFzc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWNjZXNzLWJ1dHRvbicpO1xubGV0IG5lY2tGYWlsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhaWx1cmUtYnV0dG9uJyk7XG5sZXQgdG9yc29QYXNzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N1Y2Nlc3MtYnV0dG9uLTInKTtcbmxldCB0b3Jzb0ZhaWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFpbHVyZS1idXR0b24tMicpO1xubGV0IHBlbHZpc1Bhc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2Vzcy1idXR0b24tMycpO1xubGV0IHBlbHZpc0ZhaWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmFpbHVyZS1idXR0b24tMycpO1xuXG5jbGFzcyBTdGFsbENXVGVzdCBleHRlbmRzIEJhc2VUZXN0IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUF1ZGlvKFwiL2F1ZGlvL0ZYX0JsZWVwLm1wM1wiKTtcblxuICAgICAgICB0aGlzLnN0YXJ0ZWRUZXN0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmVsVGhyZXNoID0gLjI1XG4gICAgICAgIHRoaXMucGxheVNvdW5kID0gW3RydWUsdHJ1ZSx0cnVlXTtcblxuICAgICAgICB0aGlzLmJvZHlEYXRhID0gXCJcIjtcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIHRoaXMubG9nS2V5ID0gXCJzdGFsbENXVGVzdFwiO1xuICAgICAgICB0aGlzLmxvZ0RhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWyduZWNrJ10gPSB7XCJjdXJBcnJheVwiOltdLCBcInZlbEFycmF5XCI6W119O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RvcnNvJ10gPSB7XCJjdXJBcnJheVwiOltdLCBcInZlbEFycmF5XCI6W119O1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ3BlbHZpcyddID0ge1wiY3VyQXJyYXlcIjpbXSwgXCJ2ZWxBcnJheVwiOltdfTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10gPSB7XCJ0ZXN0RHVyYXRpb25cIjogdW5kZWZpbmVkfTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXSA9IHtcInN0YWxsQ1dUZXN0TmVja09ic2VydmF0aW9uXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFsbENXVGVzdFRvcnNvT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ1dUZXN0UGVsdmlzT2JzZXJ2YXRpb25cIjogdW5kZWZpbmVkfTtcblxuICAgICAgICB0aGlzLmxvZ0RhdGFbJ2ZhdWx0cyddID0ge1wic3RhbGxDV1Rlc3ROZWNrRmF1bHRcIjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhbGxDV1Rlc3RUb3Jzb0ZhdWx0XCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YWxsQ1dUZXN0UGVsdmlzRmF1bHRcIjogdW5kZWZpbmVkfVxuICAgIH1cblxuICAgIF93YXJtVXAoKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJib2R5IHdhcm11cFwiKTtcbiAgICAgICAgdGhpcy5yb290ID0gamliby5idC5jcmVhdGUoIGJ0c1snV2FybVVwTW92ZW1lbnRzJ10pO1xuICAgICAgICB0aGlzLnJvb3Quc3RhcnQoKTtcbiAgICAgICAgaWYoIXRoaXMuc3RhcnRlZFRlc3Qpe1xuICAgICAgICAgICAgdGhpcy5zdGFydGVkVGVzdCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbnRlcigpIHtcbiAgICAgICAgQ29tbW9uLmNlbnRlclJvYm90KCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJlbnRlciBzdGFsbCBDVyB0ZXN0XCIpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDV1Rlc3ROZWNrT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdFBlbHZpc09ic2VydmF0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYXhpc1NvY2tldCA9IG5ldyBXZWJTb2NrZXQoXCJ3czovL2xvY2FsaG9zdDo4MjgyL2F4aXNfc3RhdGVcIik7XG5cbiAgICAgICAgdGhpcy5fd2FybVVwKCk7XG5cbiAgICAgICAgLy9uZWNrIHNwaW5cbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCduZWNrLWJ1dHRvbicsIFwiOTAwcHhcIiwgXCIyNTBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlTb3VuZFswXSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zZXRTcGluTG9naWModHJ1ZSwgJ25lY2snKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vdG9yc28gc3BpblxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvcnNvLWJ1dHRvbicsIFwiOTAwcHhcIiwgXCI0MDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlTb3VuZFsxXSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zZXRTcGluTG9naWModHJ1ZSwgJ3RvcnNvJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvL3BlbHZpcyBzcGluXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigncGVsdmlzLWJ1dHRvbicsIFwiOTAwcHhcIiwgXCI1NTBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlTb3VuZFsyXSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9zZXRTcGluTG9naWModHJ1ZSwgJ3BlbHZpcycpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL25lY2sgcGFzc1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3N1Y2Nlc3MtYnV0dG9uJywgXCI2MDBweFwiLCBcIjI1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKG5lY2tQYXNzQnV0dG9uLCBuZWNrRmFpbEJ1dHRvbiwgXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdE5lY2tPYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICAvL25lY2sgZmFpbFxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2ZhaWx1cmUtYnV0dG9uJywgXCIzMDBweFwiLCBcIjI1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKG5lY2tQYXNzQnV0dG9uLCBuZWNrRmFpbEJ1dHRvbiwgXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdE5lY2tPYnNlcnZhdGlvbiA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy90b3JzbyBwYXNzXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignc3VjY2Vzcy1idXR0b24tMicsIFwiNjAwcHhcIiwgXCI0MDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyh0b3Jzb1Bhc3NCdXR0b24sIHRvcnNvRmFpbEJ1dHRvbiwgXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy90b3JzbyBmYWlsXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignZmFpbHVyZS1idXR0b24tMicsIFwiMzAwcHhcIiwgXCI0MDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyh0b3Jzb1Bhc3NCdXR0b24sIHRvcnNvRmFpbEJ1dHRvbiwgXCJmYWlsdXJlXCIpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydyZXN1bHQnXS5zdGFsbENXVGVzdFRvcnNvT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vcGVsdmlzIHBhc3NcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdzdWNjZXNzLWJ1dHRvbi0zJywgXCI2MDBweFwiLCBcIjU1MHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHBlbHZpc1Bhc3NCdXR0b24sIHBlbHZpc0ZhaWxCdXR0b24sIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10uc3RhbGxDV1Rlc3RQZWx2aXNPYnNlcnZhdGlvbiA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICAvL3BlbHZpcyBmYWlsXG4gICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbignZmFpbHVyZS1idXR0b24tMycsIFwiMzAwcHhcIiwgXCI1NTBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhwZWx2aXNQYXNzQnV0dG9uLCBwZWx2aXNGYWlsQnV0dG9uLCBcImZhaWx1cmVcIik7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnN0YWxsQ1dUZXN0UGVsdmlzT2JzZXJ2YXRpb24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCduZXh0LWJ1dHRvbicsICcxMDBweCcsICczMDBweCcsICgpID0+IHtcbiAgICAgICAgICAgIC8vbG9nIHRpbWVcbiAgICAgICAgICAgIHRoaXMuY3VyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyd0aW1lJ10udGVzdER1cmF0aW9uID0gKE1hdGguYWJzKHRoaXMuY3VyVGltZSAtIHRoaXMuc3RhcnRUaW1lKSk7XG4gICAgICAgICAgICBpZih0aGlzLmJvZHlEYXRhKXtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2ZhdWx0cyddLnN0YWxsQ1dUZXN0TmVja0ZhdWx0ID0gKHRoaXMuYm9keURhdGEubmVjay5mYXVsdF9zdGF0dXMpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nRGF0YVsnZmF1bHRzJ10uc3RhbGxDV1Rlc3RUb3Jzb0ZhdWx0ID0gKHRoaXMuYm9keURhdGEudG9yc28uZmF1bHRfc3RhdHVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ2ZhdWx0cyddLnN0YWxsQ1dUZXN0UGVsdmlzRmF1bHQgPSAodGhpcy5ib2R5RGF0YS5wZWx2aXMuZmF1bHRfc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE1haW4uc3RhcnROZXh0VGVzdCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgdGVtcDEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDEnKTtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luVG9wID0gXCItMzAwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDEuc3R5bGUuZm9udFNpemUgPSBcIjQwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDInKTtcbiAgICAgICAgdGVtcDIuc3R5bGUubWFyZ2luVG9wID0gXCIyMHB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAyLnN0eWxlLmZvbnRTaXplID0gXCI0MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwzJyk7XG4gICAgICAgIHRlbXAzLnN0eWxlLm1hcmdpblRvcCA9IFwiMjBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMy5zdHlsZS5mb250U2l6ZSA9IFwiNDBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wNCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsNCcpO1xuICAgICAgICB0ZW1wNC5zdHlsZS5tYXJnaW5Ub3AgPSBcIjIwcHhcIjtcbiAgICAgICAgdGVtcDQuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDQuc3R5bGUuZm9udFNpemUgPSBcIjQwcHhcIjtcblxuICAgICAgICBDb21tb24uX3NldFNjcmVlblRleHQoXCJURVNUIDc6IFNUQUxMIERFVEVDVElPTiBDTE9DS1dJU0VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlNlbGVjdCBhIHNlZ21lbnQgdG8gdGVzdC4gIEdyYWIgYW5kIGhvbGQgc2VnbWVudCB1bnRpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwieW91IGhlYXIgYSB0b25lLiAgQ2hvb3NlIEZBSUwgaWYgc2VnbWVudCBkb2VzIG5vdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmVoYXZlIG5vcm1hbGx5LlwiKTtcblxuICAgICAgICAvL2NvbGxlY3QgY2FsbGJhY2sgb2YgYm9keURhdGFcbiAgICAgICAgdGhpcy50ZXN0QVBJKCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYm9keURhdGEgPSByZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZUF1ZGlvKGF1ZGlvU3RyKXtcbiAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgICAgICBsZXQgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICBsZXQgdXJsID0gcGF0aC5ub3JtYWxpemUoZ2xvYmFsLl9fZGlybmFtZSArIGF1ZGlvU3RyKTtcbiAgICAgICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBEZWNvZGUgYXN5bmNocm9ub3VzbHlcbiAgICAgICAgICAgIGF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEocmVxdWVzdC5yZXNwb25zZSwgZnVuY3Rpb24oX2J1ZmZlcikge1xuICAgICAgICAgICAgICAgIGJ1ZmZlciA9IF9idWZmZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICB9XG5cbiAgICAvL0FQSSB0byBjb2xsZWN0IGJvZHkgZGF0YSBhbmQgcGFyc2VcbiAgICB0ZXN0QVBJKGNiKXtcbiAgICAgICAgdGhpcy5heGlzU29ja2V0Lm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgIGNiKEpTT04ucGFyc2UoZXZlbnQuZGF0YSkpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGV4aXQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZXhpdCBzdGFsbCBDVyB0ZXN0XCIpO1xuICAgICAgICBpZih0aGlzLnJvb3Qpe1xuICAgICAgICAgICAgdGhpcy5yb290LnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiXCIpO1xuXG4gICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnbmVjay1idXR0b24nLCdwZWx2aXMtYnV0dG9uJywndG9yc28tYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzLWJ1dHRvbicsICdmYWlsdXJlLWJ1dHRvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzcy1idXR0b24tMicsICdmYWlsdXJlLWJ1dHRvbi0yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzLWJ1dHRvbi0zJywgJ3N1Y2Nlc3MtYnV0dG9uLTMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICduZXh0LWJ1dHRvbiddKTtcbiAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMobmVja1Bhc3NCdXR0b24sIG5lY2tGYWlsQnV0dG9uLCBcImNsZWFyXCIpO1xuICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyh0b3Jzb1Bhc3NCdXR0b24sIHRvcnNvRmFpbEJ1dHRvbiwgXCJjbGVhclwiKTtcbiAgICAgICAgQ29tbW9uLl9zZXRQYXNzRmFpbEJ1dHRvbnMocGVsdmlzUGFzc0J1dHRvbiwgcGVsdmlzRmFpbEJ1dHRvbiwgXCJjbGVhclwiKTtcblxuICAgICAgICB0aGlzLnN0YXJ0ZWRUZXN0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX3NldFNwaW5Mb2dpYyhib2R5QnV0dG9uLCBib2R5KXtcbiAgICAgICAgaWYodGhpcy5yb290KXtcbiAgICAgICAgICAgIHRoaXMucm9vdC5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLnJvb3QgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucm9vdCA9IGppYm8uYnQuY3JlYXRlKCBidHNbYm9keSArICctc3Bpbi0zNjAtJyArIFwiQ1dcIl0pO1xuICAgICAgICB0aGlzLnJvb3Quc3RhcnQoKTtcbiAgICAgICAgLy9pbmRpY2F0ZSB0ZXN0IGhhcyBzdGFydGVkIHRvIGFsbG93IHJvb3QgdXBkYXRpbmdcbiAgICAgICAgaWYoIXRoaXMuc3RhcnRlZFRlc3Qpe1xuICAgICAgICAgICAgdGhpcy5zdGFydGVkVGVzdCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcGxheVNvdW5kQW5kTG9nKGluZGV4KXtcbiAgICAgICAgaWYodGhpcy5wbGF5U291bmRbaW5kZXhdKXtcbiAgICAgICAgICAgIHRoaXMuX3N0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuX3BsYXkoKTtcbiAgICAgICAgICAgIHRoaXMucGxheVNvdW5kW2luZGV4XSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3N0b3AoKXtcbiAgICAgICAgaWYgKCF0aGlzLmJ1ZmZlclNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgIH1cblxuICAgIF9wbGF5KCl7XG4gICAgICAgIGlmICghYnVmZmVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1ZGlvIGJ1ZmZlciBub3QgbG9hZGVkIHlldC4uLlwiKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgICAgdGhpcy5idWZmZXJTb3VyY2Uuc3RhcnQoMCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgLy9Mb2dnaW5nIGxvZ2ljXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICBpZih0aGlzLmJvZHlEYXRhLm5lY2sgIT0gdW5kZWZpbmVkICYmIHRoaXMuYm9keURhdGEubmVjay52ZWwgPiB0aGlzLnZlbFRocmVzaCl7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ25lY2snXS5jdXJBcnJheS5wdXNoKHRoaXMuYm9keURhdGEubmVjay5jdXIudG9GaXhlZCg1KSk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ25lY2snXS52ZWxBcnJheS5wdXNoKHRoaXMuYm9keURhdGEubmVjay52ZWwudG9GaXhlZCg1KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmJvZHlEYXRhLnRvcnNvICE9IHVuZGVmaW5lZCAmJiB0aGlzLmJvZHlEYXRhLnRvcnNvLnZlbCA+IHRoaXMudmVsVGhyZXNoKXtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsndG9yc28nXS5jdXJBcnJheS5wdXNoKHRoaXMuYm9keURhdGEudG9yc28uY3VyLnRvRml4ZWQoNSkpO1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWyd0b3JzbyddLnZlbEFycmF5LnB1c2godGhpcy5ib2R5RGF0YS50b3Jzby52ZWwudG9GaXhlZCg1KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmJvZHlEYXRhLnBlbHZpcyAhPSB1bmRlZmluZWQgJiYgdGhpcy5ib2R5RGF0YS5wZWx2aXMudmVsID4gdGhpcy52ZWxUaHJlc2gpe1xuICAgICAgICAgICAgdGhpcy5sb2dEYXRhWydwZWx2aXMnXS5jdXJBcnJheS5wdXNoKHRoaXMuYm9keURhdGEucGVsdmlzLmN1ci50b0ZpeGVkKDUpKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncGVsdmlzJ10udmVsQXJyYXkucHVzaCh0aGlzLmJvZHlEYXRhLnBlbHZpcy52ZWwudG9GaXhlZCg1KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmJvZHlEYXRhKXtcbiAgICAgICAgICAgIGlmKHRoaXMuYm9keURhdGEubmVjay5mYXVsdF9zdGF0dXMgJiAweDAyKXtcbiAgICAgICAgICAgICAgICBpZih0aGlzLnBsYXlTb3VuZFswXSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlTb3VuZEFuZExvZygwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5U291bmRbMF0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0aGlzLmJvZHlEYXRhLnRvcnNvLmZhdWx0X3N0YXR1cyAmIDB4MDIpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMucGxheVNvdW5kWzFdKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kQW5kTG9nKDEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXlTb3VuZFsxXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHRoaXMuYm9keURhdGEucGVsdmlzLmZhdWx0X3N0YXR1cyAmIDB4MDIpe1xuICAgICAgICAgICAgICAgIGlmKHRoaXMucGxheVNvdW5kWzJdKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheVNvdW5kQW5kTG9nKDIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXlTb3VuZFsyXSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAvL29ubHkgdXBkYXRlIGlmIHRlc3QgaGFzIHN0YXJ0ZWRcbiAgICAgICAgaWYodGhpcy5zdGFydGVkVGVzdCl7XG4gICAgICAgICAgICB0aGlzLnJvb3QudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhbGxDV1Rlc3Q7XG4iLCJpbXBvcnQgQmFzZVRlc3QgZnJvbSBcIi4uL3Rlc3RcIjtcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vY29tbW9uJztcbmxldCBNYWluID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5cbi8qXG4qIFRlc3QgdG91Y2hzY3JlZW5cbiogKi9cbmxldCB0MUNvbmZpcm1CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG91Y2hzY3JlZW4xJyk7XG5sZXQgdDJDb25maXJtQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvdWNoc2NyZWVuMicpO1xubGV0IHQzQ29uZmlybUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b3VjaHNjcmVlbjMnKTtcbmxldCB0NENvbmZpcm1CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG91Y2hzY3JlZW40Jyk7XG5sZXQgdDVDb25maXJtQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvdWNoc2NyZWVuNScpO1xubGV0IHN1Y2Nlc3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2Vzcy1idXR0b24nKTtcbmxldCBmYWlsdXJlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZhaWx1cmUtYnV0dG9uJyk7XG5cbmNsYXNzIFRvdWNoU2NyZWVuVGVzdCBleHRlbmRzIEJhc2VUZXN0IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZpbmlzaGVkVGVzdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmltYWdlTGlzdEluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5OID0gMDtcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgdGhpcy5sb2dLZXkgPSBcInRvdWNoc2NyZWVuVGVzdFwiO1xuICAgICAgICB0aGlzLmxvZ0RhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5sb2dEYXRhWydidXR0b25zJ10gPSB7J3N1Y2Nlc3NBcnJheSc6W3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXX07XG4gICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10gPSB7J3Bhc3NlZCc6IHVuZGVmaW5lZH07XG4gICAgICAgIHRoaXMubG9nRGF0YVsndGltZSddID0ge1widGVzdER1cmF0aW9uXCI6IHVuZGVmaW5lZH07XG4gICAgfVxuXG4gICAgZW50ZXIoKSB7XG4gICAgICAgIENvbW1vbi5jZW50ZXJSb2JvdCgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdlbnRlciB0b3VjaHNjcmVlbiB0ZXN0Jyk7XG5cbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvdWNoc2NyZWVuMScsIFwiMTE1MHB4XCIsIFwiNjAwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdG91Y2hTY3JlZW5CdXR0b25QcmVzc2VkKHQxQ29uZmlybUJ1dHRvbiwgMCk7XG4gICAgICAgIH0pO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvdWNoc2NyZWVuMicsIFwiNTBweFwiLCBcIjYwMHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3RvdWNoU2NyZWVuQnV0dG9uUHJlc3NlZCh0MkNvbmZpcm1CdXR0b24sIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCd0b3VjaHNjcmVlbjMnLCBcIjExNTBweFwiLCBcIjUwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdG91Y2hTY3JlZW5CdXR0b25QcmVzc2VkKHQzQ29uZmlybUJ1dHRvbiwgMik7XG4gICAgICAgIH0pO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvdWNoc2NyZWVuNCcsIFwiNTBweFwiLCBcIjUwcHhcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdG91Y2hTY3JlZW5CdXR0b25QcmVzc2VkKHQ0Q29uZmlybUJ1dHRvbiwgMyk7XG4gICAgICAgIH0pO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvdWNoc2NyZWVuNScsIFwiNjAwcHhcIiwgXCIzMDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl90b3VjaFNjcmVlbkJ1dHRvblByZXNzZWQodDVDb25maXJtQnV0dG9uLCA0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgbmV4dENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ25leHQgdGVzdCcpO1xuICAgICAgICAgICAgLy9sb2cgdGltZVxuICAgICAgICAgICAgdGhpcy5jdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3RpbWUnXS50ZXN0RHVyYXRpb24gPSAoTWF0aC5hYnModGhpcy5jdXJUaW1lIC0gdGhpcy5zdGFydFRpbWUpKTtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiY2xlYXJcIik7XG4gICAgICAgICAgICBNYWluLnN0YXJ0TmV4dFRlc3QoKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ29tbW9uLl9zaG93QnV0dG9uKCdzdWNjZXNzLWJ1dHRvbicsIFwiODAwcHhcIiwgXCI0MDBweFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBDb21tb24uX3NldFBhc3NGYWlsQnV0dG9ucyhzdWNjZXNzQnV0dG9uLCBmYWlsdXJlQnV0dG9uLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICB0aGlzLmxvZ0RhdGFbJ3Jlc3VsdCddLnBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgXCIxMDBweFwiLCBcIjMwMHB4XCIsIG5leHRDYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2ZhaWx1cmUtYnV0dG9uJywgXCIyNzVweFwiLCBcIjQwMHB4XCIsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiZmFpbHVyZVwiKTtcbiAgICAgICAgICAgIHRoaXMubG9nRGF0YVsncmVzdWx0J10ucGFzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ25leHQtYnV0dG9uJywgXCIxMDBweFwiLCBcIjMwMHB4XCIsIG5leHRDYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ2NlbnRlci1idXR0b24nLCBcIjU0MHB4XCIsICc2MDBweCcsICgpID0+IHtcbiAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigndG91Y2hzY3JlZW4xJywgXCIxMTUwcHhcIiwgXCI2MDBweFwiKTtcbiAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigndG91Y2hzY3JlZW4yJywgXCI1MHB4XCIsIFwiNjAwcHhcIik7XG4gICAgICAgICAgICBDb21tb24uX3Nob3dCdXR0b24oJ3RvdWNoc2NyZWVuMycsIFwiMTE1MHB4XCIsIFwiNTBweFwiKTtcbiAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigndG91Y2hzY3JlZW40JywgXCI1MHB4XCIsIFwiNTBweFwiKTtcbiAgICAgICAgICAgIENvbW1vbi5fc2hvd0J1dHRvbigndG91Y2hzY3JlZW41JywgXCI2MDBweFwiLCBcIjMwMHB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLl90b3VjaFNjcmVlbkJ1dHRvblJlc2V0KHQxQ29uZmlybUJ1dHRvbiwgMCk7XG4gICAgICAgICAgICB0aGlzLl90b3VjaFNjcmVlbkJ1dHRvblJlc2V0KHQyQ29uZmlybUJ1dHRvbiwgMSk7XG4gICAgICAgICAgICB0aGlzLl90b3VjaFNjcmVlbkJ1dHRvblJlc2V0KHQzQ29uZmlybUJ1dHRvbiwgMik7XG4gICAgICAgICAgICB0aGlzLl90b3VjaFNjcmVlbkJ1dHRvblJlc2V0KHQ0Q29uZmlybUJ1dHRvbiwgMyk7XG4gICAgICAgICAgICB0aGlzLl90b3VjaFNjcmVlbkJ1dHRvblJlc2V0KHQ1Q29uZmlybUJ1dHRvbiwgNCk7XG5cbiAgICAgICAgICAgIENvbW1vbi5fc2V0UGFzc0ZhaWxCdXR0b25zKHN1Y2Nlc3NCdXR0b24sIGZhaWx1cmVCdXR0b24sIFwiY2xlYXJcIik7XG5cbiAgICAgICAgICAgIENvbW1vbi5fY2xlYXJCdXR0b25Gcm9tU2NyZWVuKFsnbmV4dC1idXR0b24nXSk7XG4gICAgICAgIH0sICdSRURPJyk7XG5cbiAgICAgICAgbGV0IHRlbXAxID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwxJyk7XG4gICAgICAgIHRlbXAxLnN0eWxlLm1hcmdpblRvcCA9IFwiLTI4MHB4XCI7XG4gICAgICAgIHRlbXAxLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXAxLnN0eWxlLmZvbnRTaXplID0gXCI1MHB4XCI7XG5cbiAgICAgICAgbGV0IHRlbXAyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3QtbGFiZWwyJyk7XG4gICAgICAgIHRlbXAyLnN0eWxlLm1hcmdpblRvcCA9IFwiMjVweFwiO1xuICAgICAgICB0ZW1wMi5zdHlsZS5tYXJnaW5SaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB0ZW1wMi5zdHlsZS5mb250U2l6ZSA9IFwiNTBweFwiO1xuXG4gICAgICAgIGxldCB0ZW1wMyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0LWxhYmVsMycpO1xuICAgICAgICB0ZW1wMy5zdHlsZS5tYXJnaW5Ub3AgPSBcIjI1cHhcIjtcbiAgICAgICAgdGVtcDMuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgdGVtcDMuc3R5bGUuZm9udFNpemUgPSBcIjUwcHhcIjtcblxuICAgICAgICBsZXQgdGVtcDQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdC1sYWJlbDQnKTtcbiAgICAgICAgdGVtcDQuc3R5bGUubWFyZ2luVG9wID0gXCIyNXB4XCI7XG4gICAgICAgIHRlbXA0LnN0eWxlLm1hcmdpblJpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIHRlbXA0LnN0eWxlLmZvbnRTaXplID0gXCI1MHB4XCI7XG5cbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiVEVTVCAyOiBUT1VDSCBTQ1JFRU5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlByZXNzIGFsbCA1IGNpcmNsZXMuICBDaG9vc2UgRkFJTCBpZiBjaXJjbGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRvZXMgbm90IGNoYW5nZSBjb2xvciwgb3IgaWYgaXQgdGFrZXMgbW9yZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGhhbiAyIGF0dGVtcHRzIHRvIGNoYW5nZS5cIik7XG4gICAgfVxuXG4gICAgX2NsZWFyNSgpe1xuICAgICAgICBDb21tb24uX2NsZWFyQnV0dG9uRnJvbVNjcmVlbihbJ3RvdWNoc2NyZWVuMScsJ3RvdWNoc2NyZWVuMicsJ3RvdWNoc2NyZWVuMycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndG91Y2hzY3JlZW40JywgJ3RvdWNoc2NyZWVuNSddKTtcbiAgICB9XG5cbiAgICBleGl0KCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImV4aXQgdG91Y2hzY3JlZW4gdGVzdFwiKTtcbiAgICAgICAgQ29tbW9uLl9zZXRTY3JlZW5UZXh0KFwiXCIpO1xuICAgICAgICBDb21tb24uX2NsZWFyQnV0dG9uRnJvbVNjcmVlbihbJ3RvdWNoc2NyZWVuMScsJ3RvdWNoc2NyZWVuMicsJ3RvdWNoc2NyZWVuMycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndG91Y2hzY3JlZW40JywgJ3RvdWNoc2NyZWVuNScsJ25leHQtYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzLWJ1dHRvbicsICdmYWlsdXJlLWJ1dHRvbiddKTtcbiAgICB9XG5cbiAgICBfdG91Y2hTY3JlZW5CdXR0b25QcmVzc2VkKGJ1dHRvbiwgaW5kZXgpIHtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ3VudG91Y2hlZCcpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgndG91Y2hlZCcpO1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ2J1dHRvbnMnXS5zdWNjZXNzQXJyYXlbaW5kZXhdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBfdG91Y2hTY3JlZW5CdXR0b25SZXNldChidXR0b24sIGluZGV4KXtcbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3VudG91Y2hlZCcpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgndG91Y2hlZCcpO1xuICAgICAgICB0aGlzLmxvZ0RhdGFbJ2J1dHRvbnMnXS5zdWNjZXNzQXJyYXlbaW5kZXhdID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy9wZXJmb3JtIHRlc3QgaW4gaGVyZVxuICAgIHVwZGF0ZSgpIHtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVG91Y2hTY3JlZW5UZXN0O1xuIl19
