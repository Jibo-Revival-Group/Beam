module.exports = function(gulp, options, plugins) {
    gulp.task('pre-build', function(done){
        plugins.sequence(
            'behaviors',
            done
        );
    });
};
