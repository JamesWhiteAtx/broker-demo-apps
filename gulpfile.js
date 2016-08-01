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
const appPkg = 'app';
const sourcePath = 'src/';
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

var cfg = {}

configDist();

function configDist(cb) {
  configure(getArg("--dist"),
    getArg("--proxy"),
    getArg("--base"));
 
  if (cb) {
    cb();
  }
}

function configure(dist, proxy, base) {
  var distPath = dist ? path.normalize(dist + '/') : 'dist/';
  var basePath = base ? path.normalize('/' + base + '/') : '/.';
  var proxyTarget = proxy ? proxy + basePath : undefined;

//console.log('dist',distPath);console.log('proxyTarget',proxyTarget);console.log('basePath',basePath);

  cfg = {
    proxyTarget: proxyTarget,
    basePath: basePath,
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
          npmPath + 'core-js/client/shim.min.js'
          // ?? npmPath + 'typescript/lib/typescript.js'
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
      path: distPath,
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


function getArg(key) {
  var index = process.argv.indexOf(key);
  var next = process.argv[index + 1];
  return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
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
    .pipe($.replace(/<base [^>]*href=\"(.*?)\">/ig, 
      '<base href="' + cfg.basePath + '">'))
    .pipe(typeHeader())
    .pipe(gulp.dest(cfg.dist.path));
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
    .pipe(typeHeader())
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

////////////////

  map.app = sourcePath + appPkg;
  map[tsPkg] = npmPath + 'typescript/lib';
	map[plugintsPkg] = npmPath + 'plugin-typescript/lib';

  packages[appPkg] = {
      "main": "main.ts",
      "defaultExtension": "ts",
      "meta": {
        "*.ts": {
          "loader": "plugints"
        }
      }
    };

	packages[tsPkg] = {
      "main": "typescript.js",
      "defaultExtension": "js",
      "meta": {
        "typescript.js": {
          "exports": "ts"
        }
      }
    };

	packages[plugintsPkg] = {
      "main": "plugin.js",
      "defaultExtension": "js"
    };

////////////////

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
  var distFile = cfg.dist.path + bundleName;

  return builder.bundle(trace, distFile)
  .then(function(output) {
    var sysJsCfg = getDistSysJsCfg();
    sysJsCfg.bundles = sysJsCfg.bundles || {};
    sysJsCfg.bundles[bundleName] = output.modules;
    return sysJsCfg.bundles[bundleName];
  })
}

function libBundles() {
  var sysCfg = makeBundleSysJsCfg();
  var builder = new Builder();
  builder.config(sysCfg);

  var ngPkgs = makeNgPkgNames();
  var allPkgs = ngPkgs.concat(appPkg);
  var allPkgExpr = allPkgs.join(' + ');

  var noNgExpr = ngPkgs.map(function (pkg) {
    return '['+pkg+']';
  }).join(' - ');

  var noAppNgExpr = noNgExpr + ' - [app/**/*]';

  return builder.trace('(' + allPkgExpr + ') - ' + noAppNgExpr)
  .then(function (trace) {
    return writePkgBundle(builder, 'lib', trace);
  })
  .then(function () {
    var sysJsCfg = getDistSysJsCfg();
    return fs.writeFile(cfg.dist.sysjs + 'config.json', 
      JSON.stringify(sysJsCfg, null, 2) , 'utf-8');
  })
  ;
}

gulp.task('bundles:lib', libBundles);

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
  libBundles); 

gulp.task('build', build);

// SERVER

function server(cb) {
    var serverCfg = {
      "injectChanges": false,
      "files": [cfg.dist.path + "**/*.{html,htm,css,js,ts,json}"],
      "watchOptions": {
        "ignored": ["node_modules", "plugin-typescript"]  
      },
      notify: false
    };

    if (! cfg.proxyTarget) {
      serverCfg.server = {
        "baseDir": cfg.dist.path
      };
    } else {
      serverCfg.proxy = {
        target: cfg.proxyTarget
      };
    }

    browserSync.init(serverCfg, cb);
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
    settings,
    buildWatch
));

function settings(cb) {
  $.util.log($.util.colors.magenta('Dist path:'), $.util.colors.cyan(cfg.dist.path));
  $.util.log($.util.colors.magenta('Proxy target:'), $.util.colors.cyan(cfg.proxyTarget));
  $.util.log($.util.colors.magenta('base path:'), $.util.colors.cyan(cfg.basePath));
  cb();
}

gulp.task('bundles', function(cb) {
 
  function getSubTrace(builder, allExpr, subExpr) {
    var noSubExpr, allTrace;

    noSubExpr = '(' + allExpr + ') - ['+subExpr+'/**/*]';
    
    return builder.trace(allExpr)
    .then(function (trace) {
      allTrace = trace;
    })
    .then(function (trace) {
      return builder.trace(noSubExpr);
    })
    .then(function (noSubTrace) {
      return builder.subtractTrees(allTrace, noSubTrace);
    })
  }
  
  var sysCfg = makeBundleSysJsCfg();
  var builder = new Builder();
  builder.config(sysCfg);
  
  getSubTrace(builder, appPkg, rxjsPkg)
  .then(function (trace) {
    return builder.bundle(trace)
  })
  .then(function(justRxOutput) {
    console.log('just Rx', justRxOutput.modules.length);
    console.log('just Rx', justRxOutput.modules);
    return justRxOutput.modules;
  })

  // .then(function(allAppOutput) {
  //   console.log('all app', allAppOutput.modules.length);
  //   console.log('all app', allAppOutput.modules);
  //   return allAppOutput.modules;
  // })

  //   return builder.bundle(allTrace)


  ;

  // builder.trace(appPkg)
  // .then(function (trace) {
  //   return builder.bundle(trace)
  // })
  // .then(function(output) {
  //   console.log('all app', output.modules.length);
  //   return output.modules;
  // })
  // ;

  cb();
  // .then(function (trace) {
  //   justNgTrace = trace;
  //   return writePkgBundle(builder, ngPkg, justNgTrace);
  // })
  // .then(function (justNgTrace) {
  //   return builder.subtractTrees(allNgTrace, justNgTrace);
  // })
  // .then(function (trace) {
  //   ngRxTrace = trace;
  //   return writePkgBundle(builder, rxjsPkg, ngRxTrace);
  // })
  // .then(function () {
  //   var sysJsCfg = getDistSysJsCfg();
  //   return fs.writeFile(cfg.dist.sysjs + 'config.json', 
  //     JSON.stringify(sysJsCfg, null, 2) , 'utf-8');
  // })
  //;

});

function
 test(cb) {
   cb();
}

gulp.task('test', test);

    // /Users/jameswhite/Source/deploy/ib2/docs/demo/';
