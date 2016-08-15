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
const demosPkg = 'demos';
const demosPath = demosPkg + '/';
const commonPath = 'common/';
const htmlPath = 'html/';
const appPkg = 'app';
const appPath = appPkg + '/';
const sharedPkg = 'shared';
const sharedPath = sharedPkg + '/';
const vendorPkg = 'vendor';
const vendorPath = vendorPkg + '/';
const pingPath = 'ping/';
const imgPath = 'img/';
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
    apps: ['main', 'cart', 'social'],
    src: {
      //html: sourcePath + htmlPath + '*.html',
      common: sourcePath + commonPath,
      //app: sourcePath + appPath + '**/*.*',
      scss: sourcePath + stylePath + '**/*.scss',
      script: sourcePath + 'js/**/*.js',
      img: sourcePath +  imgPath + '**/*.*',
      config: sourcePath + 'config/**/*.*',
      dsconfig: sourcePath + 'setup.dsconfig',
      demos: {
        html: sourcePath + demosPath + '**/*.html',
        app: sourcePath + demosPath + '**/!(*.html)'
      },
      vendor: {
        bootstrap: sourcePath + vendorPath + bootPath + 'bootbase.scss',
        awesome: npmPath + 'font-awesome/scss/font-awesome.scss',
        fonts: [
          npmPath + 'font-awesome/fonts/*.*',
          npmPath + 'bootstrap-sass/assets/fonts/**/*.*'
        ],
        npm: [
          npmPath + 'jquery/dist/jquery.js',
          npmPath + 'bootstrap-sass/assets/javascripts/bootstrap.js',
          npmPath + 'core-js/client/shim.min.js',
          npmPath + 'zone.js/dist/zone.js',
          npmPath + 'reflect-metadata/Reflect.js'
        ],
        ts: {
          npm: npmPath + 'typescript/lib/typescript.js'
        },        
        sysjs: {
          npm: npmPath + 'systemjs/dist/system.src.js',
          plugints: npmPath + 'plugin-typescript/lib/*.js',
          js: sourcePath + vendorPath + sysjsPath + '*.js'
        }, 
        ng: {
          root: npmPath + ngPath,
          pkgs:  [ 'common', 'compiler', 'core', 'forms', 'http', 
            'platform-browser', 'platform-browser-dynamic', 'router']
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
      reload: distPath + '**/*.{html,htm,css,js,ts,json}',
      clean: distPath + '**/*',
      demo: distPath + demosPath,
      vendor: {
        vendor: distPath + vendorPath,
        ng: distPath + vendorPath + ngPath,
        sysjs: distPath + vendorPath + sysjsPath,
        plugints: distPath + vendorPath + sysjsPath + plugintsPath,
        ts: distPath + vendorPath + tsPath,
        style: distPath + vendorPath + stylePath,
        font: distPath + vendorPath + 'fonts/',
        img: distPath + sharedPath + 'img/',
      },
      app: distPath + 'app/',
      // font: distPath + 'fonts/',
      // img: distPath + 'img/',
      // style: distPath + stylePath,
      config: distPath + configPath,
      // vendor: distPath + vendorPath,
      // ping: distPath + vendorPath + pingPath,
      // ng: distPath + vendorPath + ngPath,
      // ts: distPath + vendorPath + tsPath,
      // sysjs: distPath + vendorPath + sysjsPath,
      // plugints: distPath + vendorPath + sysjsPath + plugintsPath, 
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
        .pipe(gulp.dest(cfg.dist.vendor.style));
}

gulp.task('style:vendor', vendorStyle);

function vendorFont() {
	return gulp
        .src(cfg.src.vendor.fonts)
        .pipe(gulp.dest(cfg.dist.vendor.font));
}

gulp.task('font:vendor', vendorFont);

function appImg() {
	return gulp
        .src(cfg.src.img)
        .pipe(gulp.dest(cfg.dist.vendor.img));
}

gulp.task('img:app', appImg);

function appStyle() {
    return gulp
        .src(cfg.src.scss)
        .pipe($.sass(cfg.src.sassopts).on('error', $.sass.logError))
        .pipe($.concat(cfg.dist.styles.app))
        .pipe(typeHeader())
        .pipe(gulp.dest(cfg.dist.vendor.style));
}

gulp.task('style:app', appStyle);

//CONSOLIDATED STYLE TASKS

var style = gulp.parallel(vendorStyle, vendorFont, appImg, appStyle);

gulp.task('style', style);

cfg.copyMsg = 
` * Copyright (c) ${new Date().getFullYear()} Ping.
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


// NPM SCRIPTS

function npmScript() {
  return gulp
    .src(cfg.src.vendor.npm)
    .pipe(gulp.dest(cfg.dist.vendor.vendor));
}

gulp.task('script:npm', npmScript);

// ANGULAR MODULES 

function ngScript() {
  var ngPkgs = cfg.src.vendor.ng.pkgs.map(function(pkgName) {
    return cfg.src.vendor.ng.root + pkgName + '/bundles/' + pkgName + '.umd.js';
  });
  return gulp
    .src(ngPkgs)
    .pipe(gulp.dest(cfg.dist.vendor.ng)); 
}

gulp.task('script:ng', ngScript);

// SYSTEMJS SCRIPT

function sysjsNpm() {
  return gulp
    .src(cfg.src.vendor.sysjs.npm)
    .pipe(gulp.dest(cfg.dist.vendor.sysjs));
}

gulp.task('script:sysjs:npm', sysjsNpm);

// SYSTEMJS TYPESCRIPT PLUGIN SCRIPT

function sysjsPlug() {
  return gulp
    .src(cfg.src.vendor.sysjs.plugints)
    .pipe(gulp.dest(cfg.dist.vendor.plugints));
}

gulp.task('script:sysjs:plug', sysjsPlug);

// SYSTEMJS JS SCRIPTS

function sysjsJs() {
  return gulp
    .src(cfg.src.vendor.sysjs.js)
    .pipe(gulp.dest(cfg.dist.vendor.sysjs));
}

gulp.task('script:sysjs:js', sysjsJs);

//CONSOLIDATED SYSTEMJS TASKS

var sysjsScript = gulp.parallel(sysjsNpm, sysjsPlug, sysjsJs);

// APP HTML

function appHtml() {
  return gulp
    .src(cfg.src.demos.html)
    .pipe(typeHeader())
    .pipe(gulp.dest(cfg.dist.path));
}

gulp.task('html:app', appHtml);

// INDEX AND CALLBACK

function appCommon() {
  var tasks = [];

  var styles = ['bootstrap.css','font-awesome.css','app.css'].map(function(style) {
      return '../' + vendorPath + stylePath +  style;
    });
  var scripts = cfg.src.vendor.npm
    .map(function(script) {
      return '../' + vendorPath +  path.basename(script);
    })
    .concat('../' + vendorPath + sysjsPath +  path.basename(cfg.src.vendor.sysjs.npm));
  var sysJsScript = 'load.app.js';
  var callBackScript = '../' + sharedPath + 'callback.js';
  var images = '../' + sharedPath + imgPath;
  var shortTag = '<link href= "' + images + 'unboundid-u-transparent-16x16.ico" rel="shortcut icon">'; 

  cfg.apps.forEach(function (app) {
    var appName = app.charAt(0).toUpperCase() + app.substr(1).toLowerCase();
    var clientId = '@broker-demo-' + app + '@';
    var appPath = cfg.basePath + app;
    var callBackUrl = appPath + '/callback.html';
    var titleTag = '<title>Ping Data Broker ' + appName + ' Demo</title>';
    var baseTag = '<base href="' + appPath + '/">';

    // Index
    tasks.push(
      function index() {
        // var rgxBaseTag = /<base [^>]*href=\"(.*?)\">/ig;
        // function replaceBaseHref(contents, file) {
        //   return contents.replace(rgxBaseTag, 
        //       '<base href="' + appPath + '/">');
        // }
        var demoTag = '<' + app + '-app>Loading...</' + app + '-app>';
        var replaceCfg = {
            'title': titleTag,
            'shortcut': shortTag,
            'base': baseTag,
            'css': styles,
            'js': scripts,
            'sysjs': sysJsScript,
            'loading': demoTag
        };

        return gulp
          .src(cfg.src.common + 'index.html')
          .pipe(typeHeader())
          //.pipe($.insert.transform(replaceBaseHref))
          .pipe($.htmlReplace(replaceCfg))
          .pipe(gulp.dest(cfg.dist.path + app));
      }
    );

    // Callback
    tasks.push(
      function callback() {
        var replaceCfg = {
          'title': titleTag,
          'shortcut': shortTag,
          'js': callBackScript 
        };
        return gulp
          .src(cfg.src.common + 'callback.html')
          .pipe(typeHeader())
          .pipe($.htmlReplace(replaceCfg))
          .pipe(gulp.dest(cfg.dist.path + app));        
      }
    );

    // json
    tasks.push(
      function json() {
        var rgxAppName = /"APP_NAME".*",/ig;
        var rgxClientId = /"CLIENT_ID".*",/ig;
        var rgxCallback = /"CLIENT_REDIRECT_URL".*",/ig;
        var rgxLogo = /"logo".*"/ig;

        function replaceVals(contents, file) {
          contents = contents.replace(rgxLogo, 
              '"logo": "' + images + 'logo.svg"');
          contents = contents.replace(rgxClientId, 
              '"CLIENT_ID": "' + clientId + '",');
          contents = contents.replace(rgxAppName, 
              '"APP_NAME": "' + app + '",');
          return contents.replace(rgxCallback, 
              '"CLIENT_REDIRECT_URL": "' + callBackUrl + '",');
        }

        return gulp
          .src(cfg.src.common + '*.json')
          .pipe($.insert.transform(replaceVals))
          .pipe(gulp.dest(cfg.dist.path + app));    
      }
    );

    // dsconfig
    tasks.push(
      function dsconfig() {
        var rgxClientId = /{{clientid}}/ig;
        var rgxName = /{{name}}/ig;
        var rgxUrl = /{{url}}/ig;
        var rgxCallBack = /{{callback}}/ig;

        function replaceVals(contents, file) {
          contents = contents.replace(rgxClientId, clientId);
          contents = contents.replace(rgxUrl, appPath);
          contents = contents.replace(rgxCallBack, callBackUrl);          
          return contents.replace(rgxName, appName);
        }

        return gulp
          .src(cfg.src.common + 'setup.dsconfig')
          .pipe($.insert.transform(replaceVals))
          .pipe(gulp.dest(cfg.dist.path + app));    
      }
    );  

    // sysjs load app js
    tasks.push(
      function loadappjs() {
        var rgxBaseUrl = /"baseURL".*",/ig;
        var rgxImportApp = /{{app}}/ig;

        function replaceVals(contents, file) {
          contents = contents.replace(rgxBaseUrl, 
              '"baseURL": "../",');  
          return contents.replace(rgxImportApp, app);
        }

        return gulp
          .src(cfg.src.common + 'load.app.js')
           .pipe(typeHeader())
          .pipe($.insert.transform(replaceVals))
          .pipe(gulp.dest(cfg.dist.path + app));          
      }
    );

  });
  
  return gulp.parallel(tasks);
}

gulp.task('common:app', appCommon());

// ANGULAR APP

function appNg() {
  return gulp
    .src(cfg.src.demos.app)
    .pipe(typeHeader())
    .pipe(gulp.dest(cfg.dist.path));
  }

gulp.task('ng:app', appNg);

// TYPESCRIPT

function tsScript() {
  return gulp
    .src(cfg.src.vendor.ts.npm)
    .pipe(gulp.dest(cfg.dist.vendor.ts));
}

gulp.task('script:ts:npm', tsScript);

// BUNDELS

function makeNgPkgNames() {
  return cfg.src.vendor.ng.pkgs.map(function(pkg) {
    return ngPath + pkg;
  });
}

function makeBundleSysJsCfg() {
  var map = {
    [sharedPkg]: sourcePath + demosPath + sharedPkg,
    [rxjsPkg]: npmPath + rxjsPkg,
    [ngPkg]: npmPath + ngPkg
  };

  //app// map.app = sourcePath + appPkg;
  
  cfg.apps.forEach(function(app) {
    map[app] = sourcePath + demosPath + app + '/' + appPkg;
  });
  
  map[tsPkg] = npmPath + 'typescript/lib';
	map[plugintsPkg] = npmPath + 'plugin-typescript/lib';

  var packages = {
    [rxjsPkg]: {
      defaultExtension: 'js' 
    },
    [sharedPkg]: {
      defaultExtension: 'ts',
      "meta": {
        "*.ts": {
          "loader": "plugints"
        }
      }       
    }
  };

  cfg.src.vendor.ng.pkgs.forEach(function(pkgName) {
    packages[ngPath + pkgName] = { main: 'bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  });

/* //app//
  packages[appPkg] = {
      "main": "main.ts",
      "defaultExtension": "ts",
      "meta": {
        "*.ts": {
          "loader": "plugints"
        }
      }
    };
//app// */
  
  cfg.apps.forEach(function(app) {
    packages[app] = {
      "main": "main.ts",
      "defaultExtension": "ts",
      "meta": {
        "*.ts": {
          "loader": "plugints"
        }
      }   
    };
  });

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

  var sysCfg = {
    'paths': { [vendorPath + '*']: npmPath + '*' },
    'map': map,
    'packages': packages
  };

  return sysCfg;  
}

function makeDistSysJsCfg() {
  var map = {
    //[appPkg]: appPkg,
    [sharedPkg]: sharedPkg,
    [tsPkg]: vendorPath + tsPkg,
    [plugintsPkg]: vendorPath + sysjsPath + plugintsPkg,
    [rxjsPkg]: vendorPath + rxjsPkg
  };

  cfg.src.vendor.ng.pkgs.forEach(function(pkgName) {
    map[ngPath + pkgName] = vendorPath + ngPath + pkgName + '.umd.js';
  });

 cfg.apps.forEach(function(app) {
    map[app] = app + '/' + appPkg;
  });

  var packages = {
    [sharedPkg]:{
      'defaultExtension': 'ts'
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

 cfg.apps.forEach(function(app) {
    packages[app] = { 
      'main': 'main.ts',  
      'defaultExtension': 'ts',
      'meta': {
        '*.ts': {
          'loader': plugintsPkg
        }
      }
    };
  });

  var sysCfg = {
    'map': map,
    'packages': packages,
    'transpiler': plugintsPkg,
    'typescriptOptions': {
      'tsconfig': 'tsconfig.json'
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
  var bundlePath = vendorPath + pkg + '.bundle.js';
  var distFile = cfg.dist.path + bundlePath;
  var bundleName = bundlePath;

  return builder.bundle(trace, distFile)
  .then(function(output) {
    var sysJsCfg = getDistSysJsCfg();
    sysJsCfg.bundles = sysJsCfg.bundles || {};
    sysJsCfg.bundles[bundleName] = output.modules;
    return sysJsCfg.bundles[bundleName];
  })
}

function libBundles(cb) {
  var sysCfg = makeBundleSysJsCfg();

  var builder = new Builder();
  builder.config(sysCfg);

  var ngPkgs = makeNgPkgNames();
  var allPkgs = ngPkgs.concat(cfg.apps);
  var allPkgExpr = allPkgs.join(' + ');

  var noNgExpr = ngPkgs.map(function (pkg) {
    return '['+pkg+']';
  }).join(' - ');

  var noAppsExpr = cfg.apps.map(function (app) {
    return '['+app+'/**/*]';
  }).join(' - ');

  var noAppNgExpr = noNgExpr + ' - ' + noAppsExpr  + ' - [' + sharedPkg + '/**/*]';
  var bundleExpr = '(' + allPkgExpr + ') - ' + noAppNgExpr;

  return builder.trace(bundleExpr)
  .then(function (trace) {
    return writePkgBundle(builder, 'lib', trace);
  })
  .then(function () {
    var sysJsCfg = getDistSysJsCfg();
    return fs.writeFile(cfg.dist.vendor.sysjs + 'sysjs.config.json', 
      JSON.stringify(sysJsCfg, null, 2) , 'utf-8');
  })
  ;
}

gulp.task('bundles:lib', libBundles);

// BUILD
var build = 

gulp.series(
  gulp.parallel(
    npmScript,
    ngScript,
    sysjsScript,
    tsScript,
    style,
    appCommon(), 
    appHtml, 
    appNg), 
  libBundles
)

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
  gulp.watch(cfg.src.vendor.sysjs.js, {delay: cfg.src.delay}, sysjsJs);

  gulp.watch(cfg.src.img, {delay: cfg.src.delay}, appImg);

  gulp.watch(cfg.src.scss, {delay: cfg.src.delay}, appStyle);
  
  gulp.watch(cfg.src.common + '**/*.*', {delay: cfg.src.delay}, appCommon());
  
  gulp.watch(cfg.src.demos.html, {delay: cfg.src.delay}, appHtml);

  gulp.watch(cfg.src.demos.app, {delay: cfg.src.delay}, appNg);
}

gulp.task('watch:build', buildWatch);

/* function distWatch(cb) {
  gulp.watch(cfg.dist.reload, {delay: cfg.dist.delay}, 
      function reload(cb) {
        browserSync.reload();
        cb();
    });  
}
gulp.task('watch:dist', distWatch);
*/

// a timeout variable
var reloadTimer = null;

// actual reload function
function reloadLive() {
    var reload_args = arguments;

    // Stop timeout function to run livereload if this function is run within the last 250ms
    if (reloadTimer) {
        clearTimeout(reloadTimer);
    }

    // Check if any gulp task is still running
    if (!gulp.isRunning) {
        reloadTimer = setTimeout(function() {
            $.livereload.changed.apply(null, reload_args);
        }, 250);
    }
} 

function reloadWatch(cb) {
  $.livereload.listen();
  
  $.util.log($.util.colors.magenta('Reload watching:'), $.util.colors.cyan(cfg.dist.reload));
  
  gulp.watch(cfg.dist.reload, {delay: cfg.dist.delay}, function dummy(cb) {cb();}).on('change', reloadLive);
}

gulp.task('watch:reload', reloadWatch);

function settings(cb) {
  $.util.log($.util.colors.magenta('Dist path:'), $.util.colors.cyan(cfg.dist.path));
  $.util.log($.util.colors.magenta('Proxy target:'), $.util.colors.cyan(cfg.proxyTarget));
  $.util.log($.util.colors.magenta('base path:'), $.util.colors.cyan(cfg.basePath));
  cb();
}

// SERVE BROWSER SYNC
gulp.task('serve:lite', gulp.series(
    clean,
    build,
    server,
    settings,
    buildWatch
));

// SERVE LIVE RELOAD
gulp.task('serve:reload', gulp.series(
    clean,
    build,
    settings,
    gulp.parallel(buildWatch, reloadWatch)
));

gulp.task('release', gulp.series(
    clean,
    build
));

// /Users/jameswhite/Source/deploy/ib2/docs/demo/';
// gulp serve:reload --dist /Users/jameswhite/Source/deploy/ib2/docs/demo  --base docs/demo
