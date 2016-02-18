var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var zip = require('gulp-zip');
var csso = require('gulp-csso');
var concat = require('gulp-concat');

gulp.task('concat', function() {
  return gulp.src(['build/js/game_objs.js','build/js/cave.js', 'build/js/dungeon.js','build/js/input.js','build/js/game.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('minify', ['concat'], function() {
  return gulp.src('build/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/temp'));
});

gulp.task('cssmin', function() {
    return gulp.src('build/main.css')
        .pipe(csso())
        .pipe(gulp.dest('dist/temp'));
});

gulp.task('htmlmin', function() {
  return gulp.src('build/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/temp'));
});

gulp.task('zip', [ 'htmlmin', 'minify', 'cssmin' ], function() {
  return gulp.src('dist/temp/*')
      .pipe(zip('dist.zip'))
      .pipe(gulp.dest('dist'));
});

gulp.task("watch", function() {
  gulp.watch('build/*.css', ['cssmin', 'zip']);
  gulp.watch('build/*.html', ['htmlmin', 'zip']);
  gulp.watch('build/js/*.js', ['concat', 'minify', 'zip']);
});


gulp.task('default', ['htmlmin', 'cssmin', 'concat', 'minify', 'zip', 'watch']);
