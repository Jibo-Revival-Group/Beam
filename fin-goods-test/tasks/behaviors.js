module.exports = function(gulp, options, plugins) {
    gulp.task('behaviors', function () {
        gulp.src(options.behaviorsSrc)
            .pipe(plugins.behaviorify())
            .pipe(gulp.dest(options.behaviorsDest));
    });
};
