/*
  JSON plugin
  https://github.com/systemjs/plugin-json/blob/master/json.js
*/

define({
  translate: function(load) {
    if (this.builder) {
      load.metadata.format = 'cjs';
      return 'module.exports = ' + JSON.stringify(JSON.parse(load.source));
    }
  },
  instantiate: function(load) {
    if (!this.builder)
      return JSON.parse(load.source);
  }
});