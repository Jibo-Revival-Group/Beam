#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

var BASE_DIR = path.resolve(__dirname, '..');
var apisDir = path.resolve(BASE_DIR, 'apis');
fs.renameSync(path.resolve(apisDir, 'metadata-sdk.json'), path.resolve(apisDir, 'metadata.json'));
var apis = fs.readdirSync(apisDir);
var metadata = JSON.parse(fs.readFileSync(path.resolve(apisDir, 'metadata.json')).toString());

for(var i = 0; i < apis.length; i++) {
  if(apis[i].match(/.+admin.+/)){
    fs.unlinkSync(path.resolve(apisDir, apis[i]));
    continue;
  }
  if(apis[i] !== 'metadata.json' && !metadata.hasOwnProperty(apis[i].split('-')[0])) {
    fs.unlinkSync(path.resolve(apisDir, apis[i]));
  }
}

var packagePath = path.resolve(BASE_DIR, 'package.json');
var npmIgnorePath = path.resolve(BASE_DIR, '.npmignore');
var packageData = JSON.parse(fs.readFileSync(packagePath).toString());
packageData.name = 'jibo-server-client';
fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
fs.appendFileSync(npmIgnorePath, '.npmrc');
