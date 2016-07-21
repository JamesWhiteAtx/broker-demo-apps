(function(global) {

  var map = {
    app: 'app'
  };

  var packages = {
    app: {
      main: 'main.ts', 
      defaultExtension: 'ts'
    }
  };

  var typescriptOptions = {
    tsconfig: true,
    // target: 'es5',
    // module: 'commonjs',
    // sourceMap: true,
    sourceMap: false
    // emitDecoratorMetadata: true,
    // experimentalDecorators: true,
    // removeComments: false,
    // noImplicitAny: false
  }

  var config = {
    baseURL: '/',
    transpiler: 'ts', //typescript',
    map: map,
    packages: packages,
    typescriptOptions: typescriptOptions
  };

  System.config(config);

})(this);

