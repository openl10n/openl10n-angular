var gulp = require('gulp')
var gutil = require('gulp-util')
var concat = require('gulp-concat')
var connect = require('gulp-connect')
var jshint = require('gulp-jshint')
var karma = require('gulp-karma')
var minifyCSS = require('gulp-minify-css')
var ngAnnotate = require('gulp-ng-annotate')
var plumber = require('gulp-plumber')
var protractor = require("gulp-protractor").protractor;
var rimraf = require('rimraf')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var streamqueue = require('streamqueue')
var templateCache = require('gulp-angular-templatecache')
var uglify = require('gulp-uglify')


//
// Variables
//
var srcDir = './src';
var distDir = './dist';
var vendorDir = './bower_components';
var isDebug = !gutil.env.prod;

var vendorFiles = [
  vendorDir + '/jquery/dist/jquery.js',
  vendorDir + '/lodash/dist/lodash.js',
  vendorDir + '/string/lib/string.js',
  vendorDir + '/hammerjs/hammer.js',
  vendorDir + '/webfontloader/webfontloader.js',

  vendorDir + '/angular/angular.js',
  vendorDir + '/angular-messages/angular-messages.js',
  vendorDir + '/angular-ui-router/release/angular-ui-router.js',
  vendorDir + '/angular-animate/angular-animate.js',
  vendorDir + '/angular-aria/angular-aria.js',
  vendorDir + '/angular-material/angular-material.js',

  vendorDir + '/restangular/dist/restangular.js',
  vendorDir + '/angular-gravatar/build/md5.js',
  vendorDir + '/angular-gravatar/build/angular-gravatar.js',
  vendorDir + '/angular-hotkeys/build/hotkeys.js',
  vendorDir + '/angular-elastic/elastic.js',
  vendorDir + '/angular-scroll/angular-scroll.js',
  vendorDir + '/ngInfiniteScroll/build/ng-infinite-scroll.js',
];
var sourceFiles = [
  srcDir + '/core/bootstrap.js',
  srcDir + '/core/app.js',
  srcDir + '/**/*.js',
  '!' + srcDir + '/core/templates.js',
  '!' + srcDir + '/core/icons.js',
  '!' + srcDir + '/**/*.spec.js',
  '!' + srcDir + '/**/*.e2e.js',
  '!' + srcDir + '/public/**/*.js',
];
var testFiles = [
  vendorDir + '/angular-mocks/angular-mocks.js',
  srcDir + '/**/*.spec.js',
  // 'test/**/*.js'
];

//
// Default
//
gulp.task('default', ['build'], function() {
  gulp.start('watch');
});

//
// Clean
//
gulp.task('clean', function(cb) {
  rimraf(distDir, cb);
});

//
// Build
//
gulp.task('build', ['clean'], function() {
  gulp.start('scripts', 'styles', 'public', 'templates');
});

//
// Watch
//
gulp.task('watch', ['server'], function() {
  gulp.watch(srcDir + '/**/*.js', ['scripts']);

  gulp.watch(srcDir + '/**/*.scss', ['styles']);

  gulp.watch(srcDir + '/public/**/*', ['public']);

  gulp.watch(srcDir + '/views/**/*', ['templates']);

  // gulp.src(vendorFiles.concat(sourceFiles).concat(testFiles))
  //   .pipe(karma({
  //     configFile: 'karma.conf.js',
  //     action: 'watch'
  //   }));
});

//
// Server
//
gulp.task('server', function() {
  connect.server({
    root: distDir,
    port: 3000,
    livereload: false
  });
});

//
// Static files
//
gulp.task('public', function () {
  // Versionned assets
  gulp.src(srcDir + '/public/**/*')
    .pipe(gulp.dest(distDir))

  // Flags icons
  gulp.src(vendorDir + '/flag-icon-css/flags/**/*')
    .pipe(gulp.dest(distDir + '/images/flags'))
})

//
// Templates
//
gulp.task('templates', function () {
  gulp.src(srcDir + '/views/**/*')
    .pipe(gulp.dest(distDir + '/views'))
})

//
// Javascript
//
gulp.task('scripts', function () {
  var templates, icons;

  var bootstrap = gulp.src(srcDir + '/bootstrap.js');

  var vendor = gulp.src(vendorFiles)

  var src = gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(ngAnnotate())


  // Inline templates in prod mode
  if (isDebug) {
    templates = gulp.src(srcDir + '/core/templates.js')
    icons = gulp.src(srcDir + '/core/icons.js')
  } else {
    templates = gulp.src(srcDir + '/views/**/*.html')
      .pipe(templateCache('templates.js', {
        root: 'views',
        standalone: true,
      }))

    icons = gulp.src(srcDir + '/public/icons/**/*.svg')
      .pipe(templateCache('icons.js', {
        root: 'icons',
        module: 'icons',
        standalone: true,
      }))
  }

  // Combine into a single app script
  var queue = new streamqueue({ objectMode: true })
    .queue(bootstrap)
    .queue(vendor)
    .queue(templates)
    .queue(icons)
    .queue(src)

  queue.done()
    .pipe(isDebug ? sourcemaps.init() : gutil.noop())
      .pipe(concat('app.js', {newLine: ';'}))
      .pipe(isDebug ? gutil.noop() : uglify({
        mangle: false
      }))
    .pipe(isDebug ? sourcemaps.write() : gutil.noop())
    .pipe(gulp.dest(distDir))
})

//
// Stylesheet
//
gulp.task('styles', function () {
  var vendor = gulp.src(vendorDir + '/angular-material/angular-material.css')
    .pipe(isDebug ? sourcemaps.init() : gutil.noop())
      .pipe(concat('vendor.css'))
    .pipe(isDebug ? sourcemaps.write() : gutil.noop())

  var src = gulp.src(srcDir + '/styles/app.scss')
    .pipe(plumber())
    // .pipe(isDebug ? sourcemaps.init() : gutil.noop())
      .pipe(sass({
        outputStyle: isDebug ? 'nested' : 'compressed'
      }))
    // .pipe(isDebug ? sourcemaps.write() : gutil.noop())

  var queue = new streamqueue({ objectMode: true })
    .queue(vendor)
    .queue(src)

  queue.done()
    .pipe(isDebug ? sourcemaps.init({loadMaps: true}) : gutil.noop())
      .pipe(concat('app.css'))
      .pipe(isDebug ? gutil.noop() : minifyCSS({keepSpecialComments: 0}))
    .pipe(isDebug ? sourcemaps.write() : gutil.noop())
    .pipe(gulp.dest(distDir))
})

//
// Lint
//
gulp.task('lint', function() {
  return gulp.src(sourceFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

//
// Tests
//
gulp.task('test', function() {
    gulp.start('test:spec', 'test:e2e');
});

gulp.task('test:spec', function () {
  return;

  var files = [srcDir + '/bootstrap.js']
    .concat(vendorFiles)
    .concat(sourceFiles)
    .concat(testFiles)

  return gulp.src(files)
    .pipe(karma({
      configFile: __dirname + '/karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});

gulp.task('test:e2e', function() {
  gulp.src(srcDir + '/**/*.e2e.js')
    .pipe(protractor({
      configFile: __dirname + '/protractor-local.conf.js',
      args: [
        '--baseUrl', 'http://127.0.0.1:3000/#',
        '--no-sandbox',
        // '--browser', 'firefox'
      ]
    }))
    .on('error', function(e) { throw e })
});
