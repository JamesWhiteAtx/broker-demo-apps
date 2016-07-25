const browserSync = require('browser-sync').create();
const Builder = require('systemjs-builder');
const del = require('del');
const extend = require('extend');
const fs = require('fs');
const gulp = require('gulp');
const merge2 = require('merge2');
const path = require('path');
const $ = require('gulp-load-plugins')();

const npmPath = 'node_modules/';
const sourcePath = 'src/';
const appPkg = 'app';
const appPath = appPkg + '/';
const rootPath = 'root/';
const vendorPkg = 'vendor';
const vendorPath = vendorPkg + '/';
const ngPkg = '@angular';
const ngPath = ngPkg + '/';
const rxjsPkg = 'rxjs';
const stylePath = 'style/';
const tsPkg = 'typescript';
const scriptPath = 'js/';
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
      script: sourcePath + 'js/**/*.js',
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
          npmPath + 'bootstrap-sass/assets/javascripts/bootstrap.js',
          npmPath + 'systemjs/dist/system.src.js',
          npmPath + 'typescript/lib/typescript.js',
          npmPath + 'plugin-typescript/lib/*.js',
          npmPath + 'reflect-metadata/Reflect.js',
          npmPath + 'zone.js/dist/zone.js',
          npmPath + 'core-js/client/shim.min.js'
        ],
        ng: {
          root: npmPath + ngPath,
          pkgs:  [ 'common', 'compiler', 'core', 'forms',
            'http', 'platform-browser', 'platform-browser-dynamic']
        }
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
      script: distPath + scriptPath,
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

// ANGLAR APP
function ngApp() {
	return gulp
        .src(cfg.src.app)
        .pipe(gulp.dest(cfg.dist.app));
}

gulp.task('app:ng', ngApp);

// APP SCRIPTS
function appScript() {
	return gulp
        .src(cfg.src.script)
        .pipe(gulp.dest(cfg.dist.script));
}

gulp.task('script:app', appScript);

// VENDOR SCRIPTS

function vendorScript() {
    return gulp
        .src(cfg.src.vendor.scripts)
        //.pipe(ifProd($.concat(cfg.dist.scripts.vendor)))
        //.pipe(ifProd($.uglify({ compress: { sequences: false, join_vars: false } })))
        //.pipe($.filenames("vendor.scripts"))
        .pipe(gulp.dest(cfg.dist.vendor));
}

gulp.task('script:vendor', vendorScript);

// ROOT
function appRoot() {
	return gulp
        .src(cfg.src.root)
        .pipe(gulp.dest(distPath));
}

gulp.task('root:app', appRoot);

// TYPESCRIPT

function configTs() {
	return gulp
        .src('tsconfig.json')
        .pipe(gulp.dest(distPath));
}

gulp.task('ts:config', configTs);


// BUNDELS

function makeNgPkgNames() {
  return cfg.src.vendor.ng.pkgs.map(function(pkg) {
    return ngPath + pkg;
  });
}

function makeBaseSysConfig() {
  var map = {
    [rxjsPkg]: npmPath + rxjsPkg,
    //'symbol-observable': 'node_modules/symbol-observable', // rxjs@5.0.0-beta.10 https://github.com/ReactiveX/rxjs/issues/1664
    [ngPkg]: npmPath + ngPkg
  };

  var packages = {
    rxjs: {
      defaultExtension: 'js' 
    }
    //'symbol-observable': { defaultExtension: 'js', main: 'index.js'},
  };
  
  cfg.src.vendor.ng.pkgs.forEach(function(pkgName) {
    packages[ngPath + pkgName] = { main: 'bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  });

  return {
    defaultJSExtensions: true,
    map: map,
    packages: packages
  };  
}

function makeDistSysConfig() {

  var sysCfg = extend(true, makeBaseSysConfig(), {
    'transpiler': 'ts',
    'typescriptOptions': {
      'tsconfig': true
    },
    'meta': {
      'typescript': {
        'exports': 'ts'
      }
    },    
    'map': {
      [vendorPkg]: vendorPkg,
      [appPkg]: appPkg,
      [tsPkg]: vendorPkg,
      'ts': vendorPkg
    },
    'packages': {
      'app':    { 
        'main': 'main.ts',  
        'defaultExtension': 'ts',
        'meta': {
          '*.ts': {
            'loader': 'ts'
          }
        }
      },
      [tsPkg]: {
        'main': 'typescript.js',
        'meta': {
          'typescript.js': {
            'exports': 'ts'
          } 
        }        
      },
      'ts': { 
        'main': 'plugin.js', 
        'defaultExtension': 'js' 
      }
    }
  });

// 'reflect': vendorPkg
// 'reflect': {
//   'main': 'Reflect.js' 
// }
// 'depCache': {
//   '@angular/core': ['reflect']
// }

// if using the typescript plugin loader
  // pkg.app: {
  // pkg.typescript: {
  // }   
  return sysCfg;
}

function getDistSysConfig() {
  if (!cfg.dist.sysJsConfig) {
    cfg.dist.sysJsConfig = makeDistSysConfig();
  }
  return cfg.dist.sysJsConfig;
}

function writePkgBundle(builder, pkg, trace) {
  var bundleName = vendorPath + pkg + '.bundle';
  var distFile = distPath + bundleName + '.js';

  return builder.bundle(trace, distFile)
  .then(function(output) {
    var sysJsCfg = getDistSysConfig();
    sysJsCfg.bundles = sysJsCfg.bundles || {};
    sysJsCfg.bundles[bundleName] = output.modules;
    return sysJsCfg.bundles[bundleName];
  })
}

function ngBundles() {
  var sysCfg = makeBaseSysConfig();
  var builder = new Builder();
  builder.config(sysCfg);
  
  var ngPkgs = makeNgPkgNames();
  var allNgExpr = ngPkgs.join(' + ');
  var justNgExpr = '(' + allNgExpr + ') - ['+rxjsPkg+'/**/*]';

  var allNgTrace, justNgTrace, ngRxTrace;
  
  return builder.trace(allNgExpr)
  .then(function (trace) {
    allNgTrace = trace;
    return builder.trace(justNgExpr);
  })
  .then(function (trace) {
    justNgTrace = trace;
    return writePkgBundle(builder, ngPkg, justNgTrace);
  })
  .then(function () {
    return builder.subtractTrees(allNgTrace, justNgTrace);
  })
  .then(function (trace) {
    ngRxTrace = trace;
    return writePkgBundle(builder, rxjsPkg, ngRxTrace);
  })
  .then(function () {
    var sysJsCfg = getDistSysConfig();
    return fs.writeFile(cfg.dist.config + 'systemjs.config.json', 
      JSON.stringify(sysJsCfg, null, 2) , 'utf-8');
  })
  ;
}

gulp.task('bundles:ng', ngBundles);

// BUILD
var build = gulp.parallel(
  style, 
  appJson, 
  vendorScript, 
  appScript,
  configTs, 
  ngApp, 
  appRoot, 
  ngBundles); 

gulp.task('build', build);

gulp.task('watch:serve', serverWatch);

// SERVER

function server(cb) {
    browserSync.init({
        server: "./" + distPath,
        notify: false
    }, cb);
}

function serverWatch(cb) {
  gulp.watch(cfg.src.scss, {delay: cfg.src.delay}, appStyle);
  
  gulp.watch(cfg.src.root, {delay: cfg.src.delay}, appRoot);

  gulp.watch(cfg.src.json, {delay: cfg.src.delay}, appJson);
  
  gulp.watch(cfg.src.script, {delay: cfg.src.delay}, appScript);

  gulp.watch(cfg.src.app, {delay: cfg.src.delay}, ngApp);

  gulp.watch(cfg.dist.reload, {delay: cfg.dist.delay}, 
      function reload(cb) {
        browserSync.reload();
        cb();
    });  
}

// SERVE
gulp.task('serve', gulp.series(
    configServe,
    clean,
    build,
    server,
    serverWatch
));

  