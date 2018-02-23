// var loopbackApiTesting = require('loopback-api-testing');
var loopbackApiTesting = require('./testGenerator');
var tests = require('./config/tests.json');
var config = require('./config/settings.json');
var server = require('../server/server.js');
 
loopbackApiTesting.run(tests, server, config, function(err) {
  if (err) {
    console.log(err);
  }
});