const browserSync = require('browser-sync').create();
const Builder = require('systemjs-builder');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const merge2 = require('merge2');
const path = require('path');
const pkg = require('./package.json');
const through = require('through2');
const $ = require('gulp-load-plugins')();

const npmPath = 'node_modules/';
const sourcePath = 'src/';
const appPkg = 'app';
const appPath = appPkg + '/';
const vendorPkg = 'vendor';
const vendorPath = vendorPkg + '/';
const ubidPath = 'ubid/';
const bootPath = 'bootstrap/';
const ngPkg = '@angular';
const ngPath = ngPkg + '/';
const rxjsPkg = 'rxjs';
const stylePath = 'style/';
const tsPkg = 'typescript';
const tsPath = tsPkg + "/";
const sysjsPkg = "systemjs";
const sysjsPath = sysjsPkg + "/";
const plugintsPkg = "plugints";
const plugintsPath = plugintsPkg + "/";
const configPath = 'config/';

const defaultDist = 'dist/';
//const docsDist = '/Users/jameswhite/Source/deploy/ib2/docs/demo/';

var proxyTarget;
var distPath = '';
var cfg = {}

function configure(dist) {
  distPath = path.normalize(dist + '/');

  cfg = {
    prod: false,
    src: {
      html: sourcePath + '**/*.html',
      app: sourcePath + appPath + '**/*.*',
      scss: sourcePath + stylePath + '**/*.scss',
      script: sourcePath + 'js/**/*.js',
      img: sourcePath + 'img/**/*.*',
      config: sourcePath + 'config/**/*.*',
      vendor: {
        ubid: sourcePath + vendorPath + ubidPath + '**/*.*',
        bootstrap: sourcePath + vendorPath + bootPath + 'bootbase.scss',
        awesome: npmPath + 'font-awesome/scss/font-awesome.scss',
        fonts: [
          npmPath + 'font-awesome/fonts/*.*',
          npmPath + 'bootstrap-sass/assets/fonts/**/*.*'
        ],
        npm: [
          npmPath + 'jquery/dist/jquery.js',
          npmPath + 'bootstrap-sass/assets/javascripts/bootstrap.js',
          npmPath + 'reflect-metadata/Reflect.js',
          npmPath + 'zone.js/dist/zone.js',
          npmPath + 'core-js/client/shim.min.js',

          npmPath + 'typescript/lib/typescript.js'
        ],
        ts: {
          npm: npmPath + 'typescript/lib/typescript.js'
        },        
        sysjs: {
          npm: npmPath + 'systemjs/dist/system.src.js',
          plugints: npmPath + 'plugin-typescript/lib/*.js',
          load: sourcePath + vendorPath + sysjsPath + '*.js'
        }, 
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
      //reload: distPath + '**/*.{html,htm,css,js,ts,json}',
      clean: distPath + '**/*',
      app: distPath + 'app/',
      font: distPath + 'fonts/',
      img: distPath + 'img/',
      style: distPath + stylePath,
      config: distPath + configPath,
      vendor: distPath + vendorPath,
      ubid: distPath + vendorPath + ubidPath,
      ng: distPath + vendorPath + ngPath,
      ts: distPath + vendorPath + tsPath,
      sysjs: distPath + vendorPath + sysjsPath,
      plugints: distPath + vendorPath + sysjsPath + plugintsPath, 
      styles: {
        app: 'app.css',
        vendor: 'vendor.css'
      },
      delay: 0
    }
  };
}

// default to configuring for local development server
configDist();

function getArg(key) {
  var index = process.argv.indexOf(key);
  var next = process.argv[index + 1];
  return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
}

function configDist(cb) {
  var dist = getArg("--dist");
  configure(dist || defaultDist);
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
            .pipe($.sass(cfg.src.sassopts).on('error', $.sass.logError)),
        gulp.src(cfg.src.vendor.bootstrap)
            .pipe($.sass(cfg.src.sassopts).on('error', $.sass.logError))
            .pipe($.rename('bootstrap.css'))
        )
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
        .pipe($.sass(cfg.src.sassopts).on('error', $.sass.logError))
        .pipe($.concat(cfg.dist.styles.app))
        .pipe(typeHeader())
        .pipe(gulp.dest(cfg.dist.style));
}

gulp.task('style:app', appStyle);

//CONSOLIDATED STYLE TASKS

var style = gulp.parallel(vendorStyle, vendorFont, appImg, appStyle);

gulp.task('style', style);

// CONFIG
function appConfig() {
  return gulp
    .src(cfg.src.config)
    .pipe(gulp.dest(cfg.dist.config));
}

gulp.task('config:app', appConfig);

cfg.copyMsg = 
` * Copyright (c) ${new Date().getFullYear()} UnboundID Corp.
 * All Rights Reserved. 
 * ${pkg.name} - ${pkg.description}
 * @version ${pkg.version}
 * @link ${pkg.homepage}
 * @license ${pkg.license}`;

function typeHeader() {

  function tansformStream(file, enc, cb) {
    if (file.extname.match(/(.*?)\.(js|ts|html|htm|css|scss)$/igm)) {
  
      if (file.extname.match(/(.*?)\.(js|ts)$/igm)) {
        header = '/**\n' + cfg.copyMsg + '\n */\n\n';
      } else  if (file.extname.match(/(.*?)\.(html|htm)$/igm)) {
        header = '<!--\n' + cfg.copyMsg + '\n-->\n\n';
      } else  if (file.extname.match(/(.*?)\.(css|scss)$/igm)) {
        header = '/*!\n' + cfg.copyMsg + '\n */\n\n';        
      }

      var headerStream = $.header(header, {pkg: pkg} ); 
      headerStream.once('data', function(newFile) {
          file.contents = newFile.contents;
      })

      headerStream.write(file);
    }
    this.push(file);
    return cb();
  }

  return through.obj(tansformStream);
 }

// ANGULAR APP
function ngApp() {
  return gulp
    .src(cfg.src.app)
    .pipe(typeHeader())
    .pipe(gulp.dest(cfg.dist.app));
  }

gulp.task('app:ng', ngApp);

// NPM SCRIPTS

function npmScript() {
  return gulp
    .src(cfg.src.vendor.npm)
    .pipe(gulp.dest(cfg.dist.vendor));
}

gulp.task('script:npm', npmScript);

// ANGULAR MODULES 

function ngScript() {
  var ngPkgs = cfg.src.vendor.ng.pkgs.map(function(pkgName) {
    return cfg.src.vendor.ng.root + pkgName + '/bundles/' + pkgName + '.umd.js';
  });
  return gulp
    .src(ngPkgs)
    .pipe(gulp.dest(cfg.dist.ng)); 
}

gulp.task('script:ng', ngScript);

// SYSTEMJS SCRIPT

function sysjsNpm() {
  return gulp
    .src(cfg.src.vendor.sysjs.npm)
    .pipe(gulp.dest(cfg.dist.sysjs));
}

gulp.task('script:sysjs:npm', sysjsNpm);

// SYSTEMJS TYPESCRIPT PLUGIN SCRIPT

function sysjsTs() {
  return gulp
    .src(cfg.src.vendor.sysjs.plugints)
    .pipe(gulp.dest(cfg.dist.plugints));
}

gulp.task('script:sysjs:ts', sysjsTs);

// SYSTEMJS LOAD SCRIPTS

function sysjsLoad() {
  return gulp
    .src(cfg.src.vendor.sysjs.load)
    .pipe(gulp.dest(cfg.dist.sysjs));
}

gulp.task('script:sysjs:load', sysjsLoad);

//CONSOLIDATED SYSTEMJS TASKS

var sysjsScript = gulp.parallel(sysjsNpm, sysjsTs, sysjsLoad);

// HTML
function appHtml() {
	return gulp
        .src(cfg.src.html)
        .pipe(gulp.dest(distPath));
}

gulp.task('html:app', appHtml);

// TYPESCRIPT

function tsScript() {
  return gulp
    .src(cfg.src.vendor.ts.npm)
    .pipe(gulp.dest(cfg.dist.ts));
}

gulp.task('script:ts:npm', tsScript);

// UBID

function ubidSript() {
  return gulp
    .src(cfg.src.vendor.ubid)
    .pipe(gulp.dest(cfg.dist.ubid));
}

gulp.task('script:ubid', ubidSript);

// BUNDELS

function makeNgPkgNames() {
  return cfg.src.vendor.ng.pkgs.map(function(pkg) {
    return ngPath + pkg;
  });
}

function makeBundleSysJsCfg() {
  var map = {
    [rxjsPkg]: npmPath + rxjsPkg,
    [ngPkg]: npmPath + ngPkg
  };
  var packages = {
    rxjs: {
      defaultExtension: 'js' 
    }
  };

  cfg.src.vendor.ng.pkgs.forEach(function(pkgName) {
    packages[ngPath + pkgName] = { main: 'bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  });

  var sysCfg = {
    'paths': { [vendorPath + '*']: npmPath + '*' },
    'map': map,
    'packages': packages
  };

  return sysCfg;  
}

function makeDistSysJsCfg() {
  var map = {
    [appPkg]: appPkg,
    [tsPkg]: vendorPath + tsPkg,
    [plugintsPkg]: vendorPath + sysjsPath + plugintsPkg,
    [rxjsPkg]: vendorPath + rxjsPkg
  };

  cfg.src.vendor.ng.pkgs.forEach(function(pkgName) {
    map[ngPath + pkgName] = vendorPath + ngPath + pkgName + '.umd.js';
  });

  var packages = {
    [appPkg]:    { 
      'main': 'main.ts',  
      'defaultExtension': 'ts',
      'meta': {
        '*.ts': {
          'loader': plugintsPkg
        }
      }
    },
    [tsPkg]: {
      'main': 'typescript.js',
      'defaultExtension': 'js',
      'meta': {
        'typescript.js': {
          'exports': 'ts'
        } 
      }        
    },
    [plugintsPkg]: {
      'main': 'plugin.js',
      'defaultExtension': 'js'      
    },
      [rxjsPkg]: {
      'defaultExtension': 'js'      
    }
  };

  var sysCfg = {
    'map': map,
    'packages': packages,
    'transpiler': plugintsPkg,
    'typescriptOptions': {
      'tsconfig': appPath + 'tsconfig.json'
    }    
  };

  return sysCfg;
}

function getDistSysJsCfg() {
  if (!cfg.dist.sysJsConfig) {
    cfg.dist.sysJsConfig = makeDistSysJsCfg();
  }
  return cfg.dist.sysJsConfig;
}

function writePkgBundle(builder, pkg, trace) {
  var bundleName = vendorPath + pkg + '.bundle.js';
  var distFile = distPath + bundleName;

  return builder.bundle(trace, distFile)
  .then(function(output) {
    var sysJsCfg = getDistSysJsCfg();
    sysJsCfg.bundles = sysJsCfg.bundles || {};
    sysJsCfg.bundles[bundleName] = output.modules;
    return sysJsCfg.bundles[bundleName];
  })
}

function ngBundles() {
  var sysCfg = makeBundleSysJsCfg();
  var builder = new Builder();
  builder.config(sysCfg);
  
  var ngPkgs = makeNgPkgNames();
  var allNgExpr = ngPkgs.join(' + ');
  var justNgExpr = '(' + allNgExpr + ') - ['+rxjsPkg+'/**/*]';

  var allNgTrace;
  
  return builder.trace(allNgExpr)
  .then(function (trace) {
    allNgTrace = trace;
    return builder.trace(justNgExpr);
  })
  // .then(function (trace) {
  //   justNgTrace = trace;
  //   return writePkgBundle(builder, ngPkg, justNgTrace);
  // })
  .then(function (justNgTrace) {
    return builder.subtractTrees(allNgTrace, justNgTrace);
  })
  .then(function (trace) {
    ngRxTrace = trace;
    return writePkgBundle(builder, rxjsPkg, ngRxTrace);
  })
  .then(function () {
    var sysJsCfg = getDistSysJsCfg();
    return fs.writeFile(cfg.dist.sysjs + 'config.json', 
      JSON.stringify(sysJsCfg, null, 2) , 'utf-8');
  })
  ;
}

gulp.task('bundles:ng', ngBundles);

// BUILD
var build = gulp.parallel(
  npmScript,
  ngScript,
  sysjsScript,
  tsScript,
  ubidSript,
  appHtml, 
  style, 
  ngApp, 
  appConfig, 
  ngBundles); 

gulp.task('build', build);

// SERVER

function server(cb) {
    browserSync.init({
      "injectChanges": false,
      "files": [distPath + "**/*.{html,htm,css,js,ts,json}"],
      "watchOptions": {
        "ignored": ["node_modules", "plugin-typescript"]  
      },
      "server": {
        "baseDir": distPath
      },
      notify: false
    }, cb);
}

function buildWatch() {
  gulp.watch(cfg.src.scss, {delay: cfg.src.delay}, appStyle);
  
  gulp.watch(cfg.src.html, {delay: cfg.src.delay}, appHtml);

  gulp.watch(cfg.src.config, {delay: cfg.src.delay}, appConfig);
  
  gulp.watch(cfg.src.vendor.load, {delay: cfg.src.delay}, sysjsLoad);

  gulp.watch(cfg.src.app, {delay: cfg.src.delay}, ngApp);
}

gulp.task('watch:build', buildWatch);

// function distWatch(cb) {
//   gulp.watch(cfg.dist.reload, {delay: cfg.dist.delay}, 
//       function reload(cb) {
//         browserSync.reload();
//         cb();
//     });  
// }

// gulp.task('watch:dist', distWatch);

// SERVE
gulp.task('serve', gulp.series(
    clean,
    build,
    server,
    buildWatch
));

gulp.task('bundles', function(cb) {
  var sysCfg = {
    paths: { 'xxx/*': 'node_modules/*' },
    map: { rxjs: 'node_modules/rxjs' },
    packages: { rxjs: { defaultExtension: 'js' } },

    defaultJSExtensions: true
  }
  cfg.src.vendor.ng.pkgs.forEach(function(pkgName) {
    sysCfg.map[ngPath + pkgName] = npmPath + ngPath + pkgName + '/index.js';
  });  

  var builder = new Builder();
  builder.config(sysCfg);

  var ngPkgs = makeNgPkgNames();
  var allNgExpr = ngPkgs.join(' + ');

  return builder.trace(allNgExpr)
  .then(function(trace) {
    return builder.bundle(trace);
  })
  .then(function(output) {
    console.log(output.modules);
    return output.modules;
  })
  ;

});

function serveProxy(cb) {
    proxyTarget = getArg("--proxy");
    if (!proxyTarget) {
      throw new $.util.PluginError({
        plugin: 'Server Proxy',
        message: 'No proxy target specified.'
      });    
    }
    
    browserSync.init({
      "injectChanges": false,
      "files": [distPath + "**/*.{html,htm,css,js,ts,json}"],
      proxy: {
          target: proxyTarget
      },
      notify: false
    }, cb);
}

gulp.task('serve:proxy', serveProxy);

// PROXY
gulp.task('proxy', gulp.series(
    clean,
    build,
    serveProxy,
    buildWatch,
    function settings(cb) {
      $.util.log($.util.colors.magenta('Dist path:'), $.util.colors.cyan(distPath));
      $.util.log($.util.colors.magenta('Proxy targeth:'), $.util.colors.cyan(proxyTarget));
      cb();
    }
));

function test(cb) {
  var sysCfg = {
    map: {
      'ts': 'node_modules/plugin-typescript/lib',
      'typescript': 'node_modules/typescript/lib/typescript.js'
    },
    packages: {
      ts: {
        "main": "plugin.js",
        "defaultExtension": "js"
      }
    },
	  transpiler: 'ts',
    typescriptOptions: {
      tsconfig: "ubid/tsconfig.json"
    },
    meta: {
      'typescript': {
        "exports": "ts"
      }
    }
  };

  var builder = new Builder();
  builder.config(sysCfg);

  return builder.buildStatic('ubid/callback.ts', 'ubid/bundle.js')
  .then(function(output) {
    console.log(output.modules);
    return output.modules;
  })
  ;    
}

gulp.task('test', test);

