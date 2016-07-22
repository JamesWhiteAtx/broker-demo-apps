const browserSync = require('browser-sync').create();
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const merge2 = require('merge2');
const path = require('path');
const $ = require('gulp-load-plugins')();

const npmPath = 'node_modules/';
const sourcePath = 'src/';
const appPath = 'app/';
const rootPath = 'root/';
const vendorPath = 'vendor/';
const ngPath = '@angular/';
const stylePath = 'style/';
// const scriptPath = 'js/';
// const templatePath = 'templates/';
const serveDist = 'dist/';
const configPath = 'config/';
const docsDist = '/Users/jameswhite/Source/deploy/ib2/docs/demo/';

var distPath = '';
var cfg = {}

function configure(dist) {
  distPath = dist;
  cfg = {
    prod: false,
    src: {
      app:  sourcePath + appPath + '**/*.*',
      root:  sourcePath + rootPath + '**/*.*',
      scss: sourcePath + stylePath + '**/*.scss',
      //script: sourcePath + 'js/**/*.js',
      img: sourcePath + 'img/**/*.*',
      json: sourcePath + 'json/**/*.*',
      vendor: {
        bootstrap: sourcePath + vendorPath + 'bootbase.scss',
        awesome: npmPath + 'font-awesome/scss/font-awesome.scss',
        fonts: [
          npmPath + 'font-awesome/fonts/*.*',
          npmPath + 'bootstrap-sass/assets/fonts/**/*.*'
        ],
        scripts: [
          npmPath + 'jquery/dist/jquery.js',
          npmPath + 'bootstrap-sass/assets/javascripts/bootstrap.js'
        ],
        ngRoot: npmPath + ngPath
      },
      delay: 0,
      sassopts: {
        outputStyle: 'nested',
        precison: 10,
        errLogToConsole: true,
        includePaths: [npmPath + 'bootstrap-sass/assets/stylesheets']
      }
    },
    dist: {
      reload: distPath + '**/*.{html,htm,css,js,ts,json}',
      clean: distPath + '**/*',
      app: distPath + 'app/',
      font: distPath + 'fonts/',
      img: distPath + 'img/',
      style: distPath + stylePath,
      config: distPath + configPath,
      vendor: distPath + vendorPath,
      //script: distPath + scriptPath,
      styles: {
        app: 'app.css',
        vendor: 'vendor.css'
      },
      // scripts: {
      //   app: 'app.js',
      //   vendor: 'vendor.js'
      // },
      delay: 0
    }
    // reload: {
    //   styles: {},
    //   scripts: {}
    // }
  };
}

// default to configuring for local development server
configServe();

function configServe(cb) {
  configure(serveDist);
  if (cb) {
    cb();
  }
}

function configDocs(cb) {
	configure(docsDist);
  if (cb) {
    cb();
  }
}

// CLEAN
// remove all of the dist files
function clean() {
  return del([ cfg.dist.clean ], {force: true});
}

gulp.task('clean', clean);

// STYLE

function vendorStyle() {
    return  merge2(
        gulp.src(cfg.src.vendor.awesome)
            .pipe($.sass().on('error', $.sass.logError)),
        gulp.src(cfg.src.vendor.bootstrap)
            .pipe($.sass(cfg.src.sassopts))
            .pipe($.rename('bootstrap.css'))
        )
        .pipe($.filenames("vendor.styles"))
        .pipe(gulp.dest(cfg.dist.style));
}

gulp.task('style:vendor', vendorStyle);

function vendorFont() {
	return gulp
        .src(cfg.src.vendor.fonts)
        .pipe(gulp.dest(cfg.dist.font));
}

gulp.task('font:vendor', vendorFont);

function appImg() {
	return gulp
        .src(cfg.src.img)
        .pipe(gulp.dest(cfg.dist.img));
}

gulp.task('img:app', appImg);

function appStyle() {
    return gulp
        .src(cfg.src.scss)
        .pipe($.sass(cfg.src.sassopts))
        .pipe($.concat(cfg.dist.styles.app))
        .pipe($.filenames("app.styles"))
        .pipe(gulp.dest(cfg.dist.style));
}

gulp.task('style:app', appStyle);

var style = gulp.parallel(vendorStyle, vendorFont, appImg, appStyle
);

gulp.task('style', style);

// JSON
function appJson() {
	return gulp
        .src(cfg.src.json)
        .pipe(gulp.dest(cfg.dist.config));
}

gulp.task('json:app', appJson);

// APP
function appApp() {
	return gulp
        .src(cfg.src.app)
        .pipe(gulp.dest(cfg.dist.app));
}

gulp.task('app:app', appApp);

// ROOT
function appRoot() {
	return gulp
        .src(cfg.src.root)
        .pipe(gulp.dest(distPath));
}

gulp.task('root:app', appRoot);

// BUILD
var build = gulp.series(
    gulp.parallel(style, appJson, appApp, appRoot) 
    );

gulp.task('build', build);

// SERVER

function server(cb) {
    browserSync.init({
        server: "./" + distPath,
        notify: false
    }, cb);
}

// SERVE
gulp.task('serve', gulp.series(
    configServe,
    clean,
    build,
    server
    //serverWatch
));

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

gulp.task('test', function(cb) {
//  console.log(cfg.src.vendor.scripts);

  var ngDirs = getFolders(cfg.src.vendor.ngRoot);
  var ngBundles = ngDirs.map(function (pkg) {
    return cfg.src.vendor.ngRoot + pkg + '/bundles/' + pkg + '.umd.js';
  });
  var all = cfg.src.vendor.scripts.concat(ngBundles);

  console.log(all);

  
  return gulp
    .src(cfg.src.vendor.scripts)
    .pipe(gulp.dest(cfg.dist.vendor));

});

