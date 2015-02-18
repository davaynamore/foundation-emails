'use strict'

// Foundation for Emails
//
// The tasks are grouped into these categories:
//   1. Libraries
//   2. Variables
//   3. Cleaning files
//   4. Stylesheets
//   5. HTML
//   6. Syntax Transformer
//   7. GO FORTH AND BUILD
//   8. Serve/Watch Tasks

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var gulp       = require('gulp'),
    sass       = require('gulp-ruby-sass'),
    html2txt   = require('gulp-html2txt'),
    inlineCss  = require('gulp-inline-css'),
    rename     = require('gulp-rename'),
    connect    = require('gulp-connect'),
    minifyHTML = require('gulp-minify-html'),
    concat     = require('gulp-concat'),
    zfEmail    = require('gulp-zurb-foundation-email'),
    rimraf     = require('rimraf'),
    jasmine    = require('gulp-jasmine');

// 2. VARIABLES
// - - - - - - - - - - - - - - -

var dirs = {
  styles: 'scss/*.scss',
  html: 'html/*.html',
  js: 'js/**/*.js',
  build: './build',
  spec: './spec'
};

// 3. CLEANIN' FILES
// - - - - - - - - - - - - - - -

// Clean build directory
gulp.task('clean', function(cb) {
  rimraf(dirs.build, cb);
});


// 4. STYLESHEETS
// - - - - - - - - - - - - - - -

// Compile SASS files
gulp.task('sass', function() {
  return gulp.src(dirs.styles)
    .pipe(sass({ "sourcemap=none": true, style: 'compact' }))
    .pipe(gulp.dest(dirs.build + '/css'))
    .pipe(connect.reload())
});

// Inline Styles
gulp.task('inline', function() {
  return gulp.src(dirs.build + '/*.html')
    .pipe(inlineCss())
    .pipe(rename(function(path) {
      path.basename += '-inline'
    }))
    .pipe(gulp.dest(dirs.build))
});

// 5. HTML
// - - - - - - - - - - - - - - -

// Minify and smoosh together HTML
gulp.task('minify-html', function() {
  var opts = {
    comments: false,
    spare: true
  };

  gulp.src(dirs.build)
    .pipe(minifyHTML(opts))
    .pipe(connect.reload())
});

// Convert HTML to plain text, just in caseies
gulp.task('html-plaintext', function() {
  gulp.src(dirs.html)
    .pipe(html2txt())
    .pipe(rename(function(path) {
      path.basename += '-plaintext'
    }))
    .pipe(gulp.dest(dirs.build));
});

// Task to copy HTML directly, without minifying
gulp.task('copy-html', function() {
  return gulp.src(dirs.html)
  .pipe(gulp.dest(dirs.build))
  .pipe(connect.reload())
});

// 6. Syntax Transformer
// - - - - - - - - - - - - - - -

gulp.task('inky-prime', function() {
  return gulp.src('node_modules/gulp-zurb-foundation-email/node_modules/gulp-zurb-inky/index.js')
    .pipe(gulp.dest('./output/gulp-zurb-inky'));
})

gulp.task('js', function() {
  gulp.start('inky-prime');
});

// get the HTML from the body and run it through Inky parser

gulp.task('query', function() {
  gulp.src(dirs.html)
    .pipe(zfEmail())
    .pipe(gulp.dest(dirs.build))
    .pipe(connect.reload());
});

// 7. Testing
// - - - - - - - - - - - - - - -

// Starts a server
// Default Port: 8080
gulp.task('test', function () {
  return gulp.src(dirs.spec + '/*.js')
    .pipe(jasmine({
      verbose: true
    }));
});

// 8. GO FORTH AND BUILD
// - - - - - - - - - - - - - - -

// Wipes build folder, then compiles SASS, then minifies and copies HTML
gulp.task('build', ['clean', 'sass', 'query'], function() {
  gulp.start('minify-html');
});

// 9. Serve/Watch Tasks
// - - - - - - - - - - - - - - -

// Starts a server
// Default Port: 8080
gulp.task('serve', function() {
  return connect.server({
    root: dirs.build,
    livereload: true
  });
});

// Start a server
// Watch all HTML files and SCSS files for changes
// Live reloads on change
gulp.task('watch', ['serve'], function() {
  gulp.watch([dirs.html], ['query','minify-html']);
  gulp.watch(['node_modules/gulp-zurb-foundation-email/node_modules/gulp-zurb-inky/index.js'], ['query'])
  gulp.watch([dirs.styles], ['sass']);
});


gulp.task('deploy', ['minify-html', 'inline']);
// Default task
gulp.task('default', ['serve', 'watch']);