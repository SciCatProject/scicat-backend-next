// var loopbackApiTesting = require('loopback-api-testing');
var loopbackApiTesting = require("./testGenerator");
var tests = require("./config/tests.json");
var config = require("./config/settings.json");
var server = require("../server/server.js");

// This codes initializes the "generated" mocha tests.
// Note that these tests run using a local http server on port 3000

loopbackApiTesting.run(tests, server, config, function(err) {
  if (err) {
    console.log(err);
  }
});
