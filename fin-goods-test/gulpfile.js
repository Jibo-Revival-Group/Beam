// gulpfile.js
var gulp = require('gulp');

var options = {
    behaviorsSrc: './behaviors/**/*.bt',
    behaviorsDest: './lib/behaviors'
};

var plugins = {
    behaviorify: require('gulp-behaviorify')
};

require('jibo-gulp')(gulp, options, plugins);