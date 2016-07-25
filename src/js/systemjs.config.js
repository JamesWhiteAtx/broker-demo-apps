System.import('config/systemjs.config.json!js/json.js')
.then(function(config) { 
  //console.log('loaded json', config);
  return System.config(config);
})
.then(function(config) { 
  return System.import('app');
})
.catch(function(reason) {
  console.error(reason);
});