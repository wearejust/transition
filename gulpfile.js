var babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    gulp = require('gulp'),
    header = require('gulp-header'),
    pkg = require('./package.json');

gulp.task('default', ['minify']); 

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', ['default']);
});

gulp.task('minify', function() {
    gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015-ie']
        }))
        .pipe(header("/** \n* <%= pkg.name %> \n* <%= pkg.description %> \n* \n* @version <%= pkg.version %> \n* @author <%= pkg.author.name %> <<%= pkg.author.email %>> \n*/\n", { pkg }))
        .pipe(concat('transition.js'))
        .pipe(gulp.dest('dist/'));
});