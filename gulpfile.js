var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var zip = require('gulp-zip');
var csso = require('gulp-csso');
var concat = require('gulp-concat');

gulp.task('concat', function() {
	var fileList = [
		"build/js/system/game_config.js",
		"build/js/system/input.js",
		"build/js/system/camera.js",
		"build/js/system/textlog.js",

		"build/js/types/types.js",

		"build/js/util/utility.js",

		"build/js/graphics/imagecache.js",
		"build/js/graphics/spritesheet.js",
		"build/js/graphics/spritesheetcache.js",
		"build/js/system/audiopool.js",

		"build/js/ecs/components.js",
		"build/js/ecs/entity.js",
		"build/js/ecs/systems.js",

		"build/js/world/game_objs.js",
		"build/js/world/cell.js",
		"build/js/world/level.js",
		"build/js/world/cave.js",
		"build/js/world/room.js",
		"build/js/world/dungeon.js",
		"build/js/world/world.js",

		"build/js/system/game.js"
	];
  return gulp.src(fileList)
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
  gulp.watch('build/js/**/*.js', ['concat', 'minify', 'zip']);
});


gulp.task('default', ['htmlmin', 'cssmin', 'concat', 'minify', 'zip', 'watch']);
