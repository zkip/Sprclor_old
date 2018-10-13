var gulp = require('gulp'),
    rename = require('gulp-rename'),
    sprclor = require('gulp-sprclor'),
    beautify = require('gulp-beautify'),
    uglify = require('gulp-uglify-es').default,
    concat = require('gulp-concat');

let glob_Sprclor = ["Sprclor/src/*.js", "!Sprclor/src/export.js"];
let glob_Paper = ["Paper/src/*.js", "!Paper/src/export.js"];
gulp.task('default', function () {
    gulp.start('Sprclor', 'Paper');
});
gulp.task('Sprclor', function () {
    gulp.watch(glob_Sprclor, ["Sprclor"]);
    return gulp.src(glob_Sprclor)
        .pipe(concat("main.js"))
        .pipe(sprclor("sprclor", "Sprclor/src/export.js"))
        .pipe(beautify({
            indent_size: 4
        }))
        .pipe(gulp.dest("dest"))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest("Sprclor/dest"));
});

gulp.task('Paper', function () {
    gulp.watch(glob_Paper, ["Paper"]);
    return gulp.src(glob_Paper)
        .pipe(concat("main.js"))
        .pipe(sprclor("sprclor", "Paper/src/export.js"))
        .pipe(beautify({
            indent_size: 4
        }))
        .pipe(gulp.dest("dest"))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest("Paper/dest"));
});