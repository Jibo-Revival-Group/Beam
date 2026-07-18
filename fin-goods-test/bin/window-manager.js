/**
 * Simpler version of jibo-wm that does not have any dependencies and is the entry point for electron
 * and launches the provided skill's index.html that is passed as the first parameter.
 */

// Early out of the process if no skill path argument was provided
var skillPath = process.argv[3];

if(!skillPath){
    console.log('skill path argument must be provided');
    process.exit();
}

var app = require('app'),
    BrowserWindow = require('browser-window'),
    Menu = require('menu'),
    path = require('path'),
    ipc = require('ipc'),
    mainWindow = null;

app.on('window-all-closed', function () {
    if (process.platform != 'darwin')
        app.quit();
});

function loadSkill(registryHost) {
    var options = {width: 1280, height: 720};
    options.frame = false
    mainWindow = new BrowserWindow(options);
    ipc.on('get-registry-host', function (event, arg) {
        event.sender.send('set-registry-host', {
            registryHost: registryHost,
            runtimeTranspile: false
        });
    });
    var indexPath = skillPath;
    mainWindow.loadUrl('file://' + indexPath);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

//the simulation will return the registry data
ipc.on('registry-init', function (event, registryHost) {
    loadSkill(registryHost);
});

app.on('ready', function () {
    // Make sure there are no menus
    Menu.setApplicationMenu(Menu.buildFromTemplate([]));

    loadSkill('http://127.0.0.1:8181/registry');
});
