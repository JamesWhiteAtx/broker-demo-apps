(function(global) {

  var map = {
    'app': 'app',
    '@angular': 'node_modules/@angular',
    'rxjs': 'node_modules/rxjs',

    'ts': 'plugin-typescript/',
    'typescript': 'node_modules/typescript/lib/'
  };

  var packages = {
    app: {
      main: 'main.ts', 
      defaultExtension: 'ts'
    },
    rxjs: { main: 'Rx', defaultExtension: 'js' },
    ts: {
      main: "plugin.js"
    },
    typescript: {
      main: 'typescript.js', 
      meta: {
        'typescript.js': {
          exports: 'ts'
        }
      }
    }    
  };

 [  'core',
 	  'compiler',
    'common',
    'platform-browser',
    'platform-browser-dynamic',
    'http',
    'router'
  ].forEach(function(name) {
    packages['@angular/'+name] = { main: 'index', defaultExtension: 'js' };
  });

  var typescriptOptions = {
    tsconfig: false  
  }


  System.config({
    baseURL: '/',
    transpiler: 'ts', //typescript',
    typescriptOptions: typescriptOptions,
    map: map,
    packages: packages
  });

})(this);

