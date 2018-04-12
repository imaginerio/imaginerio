
const gulp = require('gulp');
const changed = require('gulp-changed');
const babel = require('gulp-babel');

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
    .pipe(gulp.dest('src/js_build')));

gulp.task('watch', () => {
  gulp.watch('src/js/*.js', ['es6']);
});

gulp.task('default', ['es6', 'watch']);
