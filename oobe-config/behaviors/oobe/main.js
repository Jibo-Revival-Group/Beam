'use strict';
var jibo = require('jibo');
module.exports = function (blackboard, notepad, result, emitter) {
    return {
        '1': {
            'id': '1',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': [1503594419, 1024537321800953, '10bd4e95-d3fc-4a43-b7b0-40f9437d7aff', 'a90f5b1d-145c-4c00-aea5-17dcb8e82485', '4bdcefa9-9df1-4b27-8fe7-23c1f9b23184', '744a2ce9-1d40-40c8-9939-eb4e236bfdc3', 'b549ec76-1999-42b9-8a7b-9b4016cb4d9f', '7a0a7c76-8165-470e-84bc-6e497bf8da8f', '4da75ef1-209d-4af0-8eb8-f393215c6cce', '350cad5e-3e87-4a55-8052-44249dade9d2'],
            'decorators': [],
            'options': {}
        },
        '1503594419': (function (self) {
            return {
                'id': '1503594419',
                'name': 'initialize jibo-wifi events &  get current mode',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.fromError = false;
                        notepad.curMode = 'oobe';
                        jibo.wifi.on('state-change', function (data) {
                            console.log('Wi-Fi state change: old = ' + data.oldState + '  new = ' + data.newState);
                        });
                        jibo.systemManager.getMode(function (error, curMode) {
                            if (!error && curMode) {
                                notepad.curMode = curMode;
                            }
                            notepad.log.info('Current mode is', notepad.curMode);
                            succeed();
                        });
                    }
                }
            };
        })({}),
        '1024537321800953': (function (self) {
            return {
                'id': '1024537321800953',
                'name': 'setup OOBE MC',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC = new pixiflash_lib.EVTStartupMC();
                        notepad.oobeMC.gotoAndStop(0);
                        notepad.oobeMC.powerWarning.visible = false;
                        blackboard.app.display.stage.addChild(notepad.oobeMC);
                        jibo.systemManager.getIdentity(function (err, id) {
                            if (err) {
                                notepad.log.error('getIdentity failed: ', err);
                            }
                            var macString = 'MAC Address: ' + id.wifi_mac;
                            notepad.oobeMC.errorMessage.macAddress.text = macString;
                            notepad.oobeMC.openApp.macAddress.text = macString;
                            notepad.oobeMC.nextCode.macAddress.text = macString;
                        });
                    }
                }
            };
        })({}),
        '1024537321801057': (function (self) {
            return {
                'id': '1024537321801057',
                'name': 'Install Updates',
                'parent': '350cad5e-3e87-4a55-8052-44249dade9d2',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': ['79beff56-9fac-4966-ad08-c294db5c36a7'],
                'options': {
                    'exec': function exec(succeed, fail) {
                        var throwError = function throwError() {
                            var errorMessage = blackboard.errorMessages.otax;
                            notepad.oobeMC.errorMessage.errorCode.text = errorMessage.code;
                            notepad.oobeMC.errorMessage.message.text = errorMessage.message;
                            notepad.oobeMC.errorMessage.instructions.text = '';
                            blackboard.app.animator.play(notepad.oobeMC, {
                                anim: 'wifiError',
                                audio: 'error'
                            });
                        };
                        jibo.systemManager.checkForUpdates(function (error, updateList) {
                            if (error) {
                                notepad.log.error('checkForUpdates error at install time: ', error);
                                throwError();
                                return;
                            }
                            var data = { ids: [] };
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = updateList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var update = _step.value;

                                    if (update.downloaded) {
                                        data.ids.push(update.id);
                                    } else {
                                        throwError();
                                        break;
                                    }
                                }
                            } catch (err) {
                                _didIteratorError = true;
                                _iteratorError = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion && _iterator['return']) {
                                        _iterator['return']();
                                    }
                                } finally {
                                    if (_didIteratorError) {
                                        throw _iteratorError;
                                    }
                                }
                            }

                            jibo.systemManager.installUpdates(data, function (error) {
                                if (error) {
                                    notepad.log.error('installUpdates error: ', error);
                                    notepad.log.info('Setting current mode back to ', notepad.curMode);
                                    jibo.systemManager.setMode(notepad.curMode, function (error) {
                                        if (error) {
                                            notepad.log.error('Error setting mode back to ', notepad.curMode, error);
                                        }
                                        throwError();
                                    });
                                } else {
                                    succeed();
                                }
                            });
                        }, blackboard.otaFilter);
                    }
                }
            };
        })({}),
        '7a0a7c76-8165-470e-84bc-6e497bf8da8f': (function (self) {
            return {
                'id': '7a0a7c76-8165-470e-84bc-6e497bf8da8f',
                'name': 'Time2Reboot!',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        blackboard.app.animator.play(notepad.oobeMC, 'timeToReboot', succeed);
                    }
                }
            };
        })({}),
        '10bd4e95-d3fc-4a43-b7b0-40f9437d7aff': (function (self) {
            return {
                'id': '10bd4e95-d3fc-4a43-b7b0-40f9437d7aff',
                'name': 'show the logo',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.log.debug('Display Logo, then QR Prompt');
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'jiboLogo',
                            audio: {
                                alias: 'jiboBumperIn',
                                start: 233
                            }
                        }, succeed);
                    }
                }
            };
        })({}),
        '4bdcefa9-9df1-4b27-8fe7-23c1f9b23184': {
            'id': '4bdcefa9-9df1-4b27-8fe7-23c1f9b23184',
            'name': 'check if we\'re plugged in',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['79ad7ab1-95a6-4191-a6e3-3a8a7ccedb28'],
            'options': {}
        },
        'afaafc80-1ad2-4da7-b440-c02f3fa7e09d': (function (self) {
            return {
                'id': 'afaafc80-1ad2-4da7-b440-c02f3fa7e09d',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !jibo.system.pluggedIn;
                    }
                }
            };
        })({}),
        '79ad7ab1-95a6-4191-a6e3-3a8a7ccedb28': {
            'id': '79ad7ab1-95a6-4191-a6e3-3a8a7ccedb28',
            'name': 'plz plug me in',
            'parent': '4bdcefa9-9df1-4b27-8fe7-23c1f9b23184',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['3f70d370-0630-4a8c-9ea1-ea7d01aca0aa', 'fb328668-03bd-44c1-abe1-9da7f6547774'],
            'decorators': ['afaafc80-1ad2-4da7-b440-c02f3fa7e09d'],
            'options': {}
        },
        'fb328668-03bd-44c1-abe1-9da7f6547774': (function (self) {
            return {
                'id': 'fb328668-03bd-44c1-abe1-9da7f6547774',
                'name': 'transition out plugin screen',
                'parent': '79ad7ab1-95a6-4191-a6e3-3a8a7ccedb28',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.log.info('Jibo plugged-in');
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'pluggedIn',
                            audio: 'pluggedIn'
                        }, succeed);
                    }
                }
            };
        })({}),
        '91529b83-6d9f-446f-9cef-c0df92710bc8': (function (self) {
            return {
                'id': '91529b83-6d9f-446f-9cef-c0df92710bc8',
                'asset-pack': 'core',
                'class': 'SucceedOnCondition',
                'options': {
                    'init': function init() {},
                    'conditional': function conditional() {
                        return jibo.system.pluggedIn;
                    }
                }
            };
        })({}),
        '3f70d370-0630-4a8c-9ea1-ea7d01aca0aa': (function (self) {
            return {
                'id': '3f70d370-0630-4a8c-9ea1-ea7d01aca0aa',
                'name': 'show plugIn screen until plugged in',
                'parent': '79ad7ab1-95a6-4191-a6e3-3a8a7ccedb28',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': ['91529b83-6d9f-446f-9cef-c0df92710bc8'],
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.log.info('Jibo unplugged at start-time');
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'plugIn',
                            audio: 'plugIn'
                        });
                    }
                }
            };
        })({}),
        '744a2ce9-1d40-40c8-9939-eb4e236bfdc3': {
            'id': '744a2ce9-1d40-40c8-9939-eb4e236bfdc3',
            'name': 'Main Loop (wifi connection, cloud init, ota download)',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['fc448fd0-782a-462b-a3c5-9f9cf9f5ed12', '7e7feafd-fbd8-428b-9c6c-f7a6df576b9e', '4aa26475-31cb-4005-973b-9a7644095c0c', '7bec2b0d-d3b5-4e32-b12c-7ee5454bef90'],
            'decorators': ['b410d976-73da-4e64-a603-f78e342933fc'],
            'options': {}
        },
        'b410d976-73da-4e64-a603-f78e342933fc': (function (self) {
            return {
                'id': 'b410d976-73da-4e64-a603-f78e342933fc',
                'asset-pack': 'core',
                'class': 'WhileCondition',
                'options': {
                    'init': function init() {
                        notepad.networkConnected = false;
                        notepad.cloudAuthorized = false;
                        notepad.otaComplete = false;
                    },
                    'conditional': function conditional() {
                        return !notepad.networkConnected || !notepad.cloudAuthorized || !notepad.otaComplete;
                    }
                }
            };
        })({}),
        '4aa26475-31cb-4005-973b-9a7644095c0c': {
            'id': '4aa26475-31cb-4005-973b-9a7644095c0c',
            'name': 'did wifi config succeed',
            'parent': '744a2ce9-1d40-40c8-9939-eb4e236bfdc3',
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['dd543435-7557-40e3-a6c4-0f43395609de'],
            'options': {}
        },
        '7bec2b0d-d3b5-4e32-b12c-7ee5454bef90': {
            'id': '7bec2b0d-d3b5-4e32-b12c-7ee5454bef90',
            'name': 'WiFi + Cloud Success?',
            'parent': '744a2ce9-1d40-40c8-9939-eb4e236bfdc3',
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['f389fab9-97f6-4e88-9790-b34bdd71fed3', '9b6b8119-5203-490b-89f8-98521f3186ba'],
            'options': {}
        },
        '9b6b8119-5203-490b-89f8-98521f3186ba': {
            'id': '9b6b8119-5203-490b-89f8-98521f3186ba',
            'parent': '7bec2b0d-d3b5-4e32-b12c-7ee5454bef90',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['42d62593-c772-46cb-b48b-5885580d08cd'],
            'decorators': ['3e500d4a-44f0-4c69-b5f6-e12a7143e83f'],
            'options': {}
        },
        'f389fab9-97f6-4e88-9790-b34bdd71fed3': (function (self) {
            return {
                'id': 'f389fab9-97f6-4e88-9790-b34bdd71fed3',
                'name': 'show wifi error message',
                'parent': '7bec2b0d-d3b5-4e32-b12c-7ee5454bef90',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': ['5f0d465e-a2fa-47c0-b091-cebcd84d5225'],
                'options': {
                    'exec': function exec(succeed, fail) {
                        jibo.wifi.removeNetwork(notepad.ssid, function (error) {
                            if (error) {
                                notepad.log.error('removeNetwork error (NBD):', error);
                            }
                        });
                        var errorMessage;
                        if (notepad.errorCode.code) {
                            errorMessage = blackboard.errorMessages['wifi' + notepad.errorCode.code];
                            notepad.log.info('Connecting error: ' + notepad.errorCode.code + ' ' + notepad.errorCode.description);
                        } else {
                            notepad.log.info('Connecting error: ', notepad.errorCode);
                        }
                        notepad.log.info('Connecting error occurred after ' + blackboard.timer.stop() + ' seconds.');
                        errorMessage = errorMessage || blackboard.errorMessages.wifix;
                        notepad.oobeMC.errorMessage.errorCode.text = errorMessage.code;
                        notepad.oobeMC.errorMessage.message.text = errorMessage.message;
                        notepad.oobeMC.errorMessage.instructions.text = errorMessage.instructions;
                        blackboard.app.animator.play(notepad.oobeMC, {
                            anim: 'wifiError',
                            audio: 'error'
                        });
                        blackboard.app.display.stage.once('click', function () {
                            notepad.fromError = true;
                            succeed();
                        });
                    }
                }
            };
        })({}),
        '5f0d465e-a2fa-47c0-b091-cebcd84d5225': (function (self) {
            return {
                'id': '5f0d465e-a2fa-47c0-b091-cebcd84d5225',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.networkConnected || !notepad.cloudAuthorized;
                    }
                }
            };
        })({}),
        '3e500d4a-44f0-4c69-b5f6-e12a7143e83f': (function (self) {
            return {
                'id': '3e500d4a-44f0-4c69-b5f6-e12a7143e83f',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return notepad.networkConnected && notepad.cloudAuthorized;
                    }
                }
            };
        })({}),
        'b549ec76-1999-42b9-8a7b-9b4016cb4d9f': {
            'id': 'b549ec76-1999-42b9-8a7b-9b4016cb4d9f',
            'name': 'only proceed if plugged in',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Switch',
            'children': ['b4a892e3-7c68-4dbe-ba7c-6ac97b9835c4'],
            'options': {}
        },
        'd18f8517-e8f2-4255-b8c8-5c1a3378cebe': (function (self) {
            return {
                'id': 'd18f8517-e8f2-4255-b8c8-5c1a3378cebe',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !jibo.system.pluggedIn;
                    }
                }
            };
        })({}),
        'b4a892e3-7c68-4dbe-ba7c-6ac97b9835c4': {
            'id': 'b4a892e3-7c68-4dbe-ba7c-6ac97b9835c4',
            'name': 'is unplugged?',
            'parent': 'b549ec76-1999-42b9-8a7b-9b4016cb4d9f',
            'asset-pack': 'core',
            'class': 'Sequence',
            'children': ['1a883893-5122-4bea-afb7-c6019f65c380', 'ad32ff4d-c562-4a16-98a9-d486398d5a25'],
            'decorators': ['d18f8517-e8f2-4255-b8c8-5c1a3378cebe'],
            'options': {}
        },
        'ad32ff4d-c562-4a16-98a9-d486398d5a25': (function (self) {
            return {
                'id': 'ad32ff4d-c562-4a16-98a9-d486398d5a25',
                'name': 'Thanks',
                'parent': 'b4a892e3-7c68-4dbe-ba7c-6ac97b9835c4',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.oobeMC.powerWarning.visible = false;
                        blackboard.app.sound.play('pluggedIn');
                        notepad.log.info('Jibo plugged-in - proceeding with install');
                    }
                }
            };
        })({}),
        '5da40fce-2876-4252-a483-0d626dfe595e': (function (self) {
            return {
                'id': '5da40fce-2876-4252-a483-0d626dfe595e',
                'asset-pack': 'core',
                'class': 'SucceedOnCondition',
                'options': {
                    'init': function init() {},
                    'conditional': function conditional() {
                        return jibo.system.pluggedIn;
                    }
                }
            };
        })({}),
        '1a883893-5122-4bea-afb7-c6019f65c380': (function (self) {
            return {
                'id': '1a883893-5122-4bea-afb7-c6019f65c380',
                'name': 'PLUG ME BACK IN!',
                'parent': 'b4a892e3-7c68-4dbe-ba7c-6ac97b9835c4',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': ['5da40fce-2876-4252-a483-0d626dfe595e'],
                'options': {
                    'exec': function exec(succeed, fail) {
                        notepad.oobeMC.powerWarning.visible = true;
                        blackboard.app.sound.play('plugIn');
                        notepad.log.info('Jibo unplugged at download complete - waiting for power to install');
                    }
                }
            };
        })({}),
        '7e7feafd-fbd8-428b-9c6c-f7a6df576b9e': (function (self) {
            return {
                'id': '7e7feafd-fbd8-428b-9c6c-f7a6df576b9e',
                'name': 'clear fromError',
                'parent': '744a2ce9-1d40-40c8-9939-eb4e236bfdc3',
                'asset-pack': 'core',
                'class': 'ExecuteScript',
                'options': {
                    'exec': function exec() {
                        notepad.fromError = false;
                    }
                }
            };
        })({}),
        'a90f5b1d-145c-4c00-aea5-17dcb8e82485': (function (self) {
            return {
                'id': 'a90f5b1d-145c-4c00-aea5-17dcb8e82485',
                'name': 'index!',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        jibo.expression.indexRobot().then(function () {
                            succeed();
                        })['catch'](function (error) {
                            console.error(error);
                            succeed();
                        });
                    }
                }
            };
        })({}),
        '4da75ef1-209d-4af0-8eb8-f393215c6cce': (function (self) {
            return {
                'id': '4da75ef1-209d-4af0-8eb8-f393215c6cce',
                'name': 'set mode to normal if we are in oobe',
                'parent': 1,
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'options': {
                    'exec': function exec(succeed, fail) {
                        if (notepad.curMode === 'oobe') {
                            notepad.log.info('Setting current mode to normal');
                            jibo.systemManager.setMode('normal', function (error) {
                                if (error) {
                                    notepad.log.error('Error setting mode to \'normal\'', error);
                                }
                                succeed();
                            });
                        } else {
                            notepad.log.info('Not setting current mode to normal; currently ', notepad.curMode);
                            succeed();
                        }
                    }
                }
            };
        })({}),
        'fc448fd0-782a-462b-a3c5-9f9cf9f5ed12': (function (self) {
            return {
                'id': 'fc448fd0-782a-462b-a3c5-9f9cf9f5ed12',
                'name': 'config: QR code, WiFi config',
                'parent': '744a2ce9-1d40-40c8-9939-eb4e236bfdc3',
                'asset-pack': 'core',
                'class': 'SubtreeJs',
                'options': {
                    'getTree': function getTree(cb) {
                        return cb(require('./config'));
                    },
                    'getNotepad': function getNotepad() {
                        return {
                            log: notepad.log,
                            oobeMC: notepad.oobeMC,
                            networkConnected: notepad.networkConnected,
                            fromError: notepad.fromError
                        };
                    },
                    'onResult': function onResult(treeResult) {
                        notepad.networkConnected = treeResult.networkConnected;
                        notepad.accessToken = treeResult.accessToken;
                        notepad.errorCode = treeResult.errorCode;
                        notepad.ssid = treeResult.ssid;
                        console.log('here is treeResult and notepad');
                        console.log(treeResult);
                        console.log(notepad);
                    }
                }
            };
        })({}),
        '0228dba7-1bf2-476a-bc91-95c467d6dd24': (function (self) {
            return {
                'id': '0228dba7-1bf2-476a-bc91-95c467d6dd24',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return notepad.networkConnected;
                    }
                }
            };
        })({}),
        'dd543435-7557-40e3-a6c4-0f43395609de': (function (self) {
            return {
                'id': 'dd543435-7557-40e3-a6c4-0f43395609de',
                'name': 'cloud-init',
                'parent': '4aa26475-31cb-4005-973b-9a7644095c0c',
                'asset-pack': 'core',
                'class': 'SubtreeJs',
                'decorators': ['0228dba7-1bf2-476a-bc91-95c467d6dd24'],
                'options': {
                    'getTree': function getTree(cb) {
                        return cb(require('./cloud-init'));
                    },
                    'getNotepad': function getNotepad() {
                        return {
                            ssid: notepad.ssid,
                            log: notepad.log,
                            accessToken: notepad.accessToken,
                            curMode: notepad.curMode
                        };
                    },
                    'onResult': function onResult(treeResult) {
                        notepad.cloudAuthorized = treeResult.cloudAuthorized;
                        notepad.accessKey = treeResult.accessKey;
                        notepad.errorCode = treeResult.errorCode;
                    }
                }
            };
        })({}),
        '42d62593-c772-46cb-b48b-5885580d08cd': (function (self) {
            return {
                'id': '42d62593-c772-46cb-b48b-5885580d08cd',
                'name': 'OTA update download: handle loading bar and start OTA update',
                'parent': '9b6b8119-5203-490b-89f8-98521f3186ba',
                'asset-pack': 'core',
                'class': 'SubtreeJs',
                'decorators': [],
                'options': {
                    'getTree': function getTree(cb) {
                        return cb(require('./ota-download'));
                    },
                    'getNotepad': function getNotepad() {
                        return {
                            log: notepad.log,
                            oobeMC: notepad.oobeMC,
                            accessKey: notepad.accessKey,
                            otaComplete: notepad.otaComplete,
                            ssid: notepad.ssid
                        };
                    },
                    'onResult': function onResult(treeResult) {
                        notepad.otaComplete = treeResult.otaComplete;
                        notepad.fromError = !notepad.otaComplete;
                        notepad.skipInstallAttempt = treeResult.skipInstallAttempt;
                    }
                }
            };
        })({}),
        '350cad5e-3e87-4a55-8052-44249dade9d2': {
            'id': '350cad5e-3e87-4a55-8052-44249dade9d2',
            'parent': 1,
            'asset-pack': 'core',
            'class': 'Switch',
            'children': [1024537321801057, 'c153c5ee-a5e2-4c50-8415-a9136acd272b'],
            'options': {}
        },
        '79beff56-9fac-4966-ad08-c294db5c36a7': (function (self) {
            return {
                'id': '79beff56-9fac-4966-ad08-c294db5c36a7',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return !notepad.skipInstallAttempt;
                    }
                }
            };
        })({}),
        'c153c5ee-a5e2-4c50-8415-a9136acd272b': (function (self) {
            return {
                'id': 'c153c5ee-a5e2-4c50-8415-a9136acd272b',
                'name': 'Don\'t attempt install: reboot',
                'parent': '350cad5e-3e87-4a55-8052-44249dade9d2',
                'asset-pack': 'core',
                'class': 'ExecuteScriptAsync',
                'decorators': ['778ded2f-ff4a-4e0a-b1dd-87360ca16173'],
                'options': {
                    'exec': function exec(succeed, fail) {
                        jibo.systemManager.reboot(function (err) {
                            if (err) {
                                notepad.log.err('failure to reboot after skipping OTA');
                            } else {
                                notepad.log.info('rebooting after skipping OTA');
                            }
                        });
                    }
                }
            };
        })({}),
        '778ded2f-ff4a-4e0a-b1dd-87360ca16173': (function (self) {
            return {
                'id': '778ded2f-ff4a-4e0a-b1dd-87360ca16173',
                'asset-pack': 'core',
                'class': 'Case',
                'options': {
                    'conditional': function conditional() {
                        return notepad.skipInstallAttempt;
                    }
                }
            };
        })({})
    };
};