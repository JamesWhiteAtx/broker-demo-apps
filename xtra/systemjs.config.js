(function(global) {

  var vendorPath = 'vendor/';

  //map tells the System loader where to look for things
  var  map = {
    'app':        'app',
    '@angular':   vendorPath + '@angular',
    'rxjs':       vendorPath + 'rxjs',
    'ts':         vendorPath + 'plugin-typescript/lib/',
    'typescript': vendorPath + 'typescript/lib/'
 };

  //packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'app':    { 
      'main': 'main.ts',  
      'defaultExtension': 'ts',
      'meta': {
        '*.ts': {
          'loader': 'ts'
        }
      } 
    },
    'rxjs':	  { 'defaultExtension': 'js' },
    'ts':     { 'main': 'plugin.js', 'defaultExtension': 'js' },
    'typescript': {
      'main': 'typescript.js', 
      'meta': {
        'typescript.js': {
          'exports': 'ts'
        } 
      }
    }
  };

  [ 'common',
    'compiler',
    'core',
    'http',
    'platform-browser',
    'platform-browser-dynamic'
  ].forEach(function(pkgName) {
    packages['@angular/'+pkgName] = { 'main': '/bundles/' + pkgName + '.umd.js', 'defaultExtension': 'js' };
  });

  var config = {
    'transpiler': 'ts',
    'typescriptOptions': {
      'tsconfig': true
    },
    'meta': {
      'typescript': {
        'exports': 'ts'
      }
    },
    'map': map,
    'packages': packages
  };

  System.config(config);

})(this);