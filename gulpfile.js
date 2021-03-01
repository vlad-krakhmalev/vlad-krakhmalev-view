var { watch, src, dest, parallel, series } = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var imagemin = require('gulp-imagemin');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

// Девсервер
function devServer(cb) {
  var params = {
    watch: true,
    reloadDebounce: 150,
    notify: false,
    server: { baseDir: './build' },
  };

  browserSync.create().init(params);
  cb();
}

// Сборка
function buildPages() {
  return src('src/pages/*.pug')
    .pipe(pug())
    .pipe(dest('build/'));
}

function buildStyles(cb) {
  src('src/styles/*.scss')
    .pipe(sass())
    .pipe(sourcemaps.init())
    .pipe(postcss([
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      }),
      cssnano()
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('build/styles/'));

  src('src/styles/**/*.css')
    .pipe(dest('build/styles/'));

  cb();
}

function buildScripts() {
  return src('src/scripts/**/*.js')
    .pipe(dest('build/scripts/'));
}

function buildAssets(cb) {
  src(['src/assets/**/*.*', '!src/assets/img/**/*.*'])
    .pipe(dest('build/assets/'));

  src('src/assets/img/**/*.*')
    .pipe(imagemin())
    .pipe(dest('build/assets/img'));

  cb();
}

// Очистка билда
function clearBuild() {
  return del('build/');
}

// Отслеживание
function watchFiles() {
  watch(['src/pages/**/*.pug', 'src/templates/**/*.pug'], buildPages);
  watch('src/styles/*.scss', buildStyles);
  watch('src/scripts/**/*.js', buildScripts);
  watch('src/assets/**/*.*', buildAssets);
}

exports.default =
  series(
    clearBuild,
    parallel(
      devServer,
      series(
        parallel(buildPages, buildStyles, buildScripts, buildAssets),
        watchFiles
      )
    )
  );