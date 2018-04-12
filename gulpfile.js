
const gulp = require('gulp');
const changed = require('gulp-changed');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const del = require('del');

const env = process.env.NODE_ENV || 'development';

gulp.task('clean', () => del(['src/js_build/*']));

gulp.task('es6', () =>
  gulp.src('src/js/*.js')
    .pipe(changed('src/js_build'))
    .pipe(babel({
      presets: ['env'],
    }))
    .on('error', function err(e) {
      console.log('error', e);
      this.emit('end');
    })
    .pipe(gulp.dest('src/js_build'))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest('src/js_build')));

gulp.task('watch', () => {
  gulp.watch('src/js/*.js', ['es6']);
});

gulp.task('default', ['clean', 'es6', 'watch']);
