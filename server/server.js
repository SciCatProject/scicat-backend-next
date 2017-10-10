'use strict';

function isObjectAndNotArray(object) {
    return (typeof object === 'object' && !Array.isArray(object));
}

// 'createNew' defaults to false
function overwriteKeys(baseObject, overrideObject, createNew) {
  if (!baseObject) {
    baseObject = {};
  }
  if (createNew) {
    baseObject = JSON.parse(JSON.stringify(baseObject));
  }
  Object.keys(overrideObject).forEach(function(key) {
    if (isObjectAndNotArray(baseObject[key]) && isObjectAndNotArray(overrideObject[key])) {
      overwriteKeys(baseObject[key], overrideObject[key]);
    }
    else {
      baseObject[key] = overrideObject[key];
    }
  });
  return baseObject;
}

var loopback = require('loopback');
var path = require('path');
var boot = require('loopback-boot');

var app = module.exports = loopback();

// Create an instance of PassportConfigurator with the app instance
var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);


var bodyParser = require('body-parser');
var ENV = process.env.NODE_ENV || 'local';
console.log(ENV);
app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json({limit: '50mb'}));
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  limit: '50mb', extended: true,
}));
// // The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.accessToken,
}));

// Load the provider configurations
var config = {};
try {
    config = require('./providers.json');
} catch (err) {
    console.error('Please configure your passport strategy in `providers.json`.');
    process.exit(1);
}
var configLocal={};
try {
    configLocal = require('./providers.local');
} catch (err) {
    console.error('Info: No providers.local.js(on) file found`.');
    process.exit(1);
}
var configEnv={};
try {
    configEnv = require('./providers.' + ENV);
} catch (err) {
    console.error('Info: No environment specific providers file found`.');
}

// merge values into config
for (var s in configLocal) {
    config[s]=configLocal[s];
}
// override with values in configEnv
var merged=overwriteKeys(configLocal,configEnv,false);

// Initialize passport
passportConfigurator.init();

// Set up related models
passportConfigurator.setupModels({
    userModel: app.models.user,
    userIdentityModel: app.models.userIdentity,
    userCredentialModel: app.models.userCredential
});
// Configure passport strategies for third party auth providers
for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
}
