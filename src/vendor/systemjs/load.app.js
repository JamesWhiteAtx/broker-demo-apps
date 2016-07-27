System.config({
  "paths": {
    "sysjs/*": "vendor/systemjs/*"
  },
  "map": {
    "pluginjson": "sysjs/json.js"
  },
  "meta": {
    "*.json": {
      "loader": "pluginjson"
    }
  }  
});
System.import('sysjs/config.json')
.then(function(config) { 
  return System.config(config);
})
.then(function(config) { 
  return System.import('app');
})
.catch(function(reason) {
  console.error(reason);
});