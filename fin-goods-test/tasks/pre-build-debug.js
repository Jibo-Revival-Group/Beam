module.exports = function(gulp, options, plugins) {
    gulp.task('pre-build-debug', function(done){
        plugins.sequence(
            'behaviors',
            done
        );
    });
};
