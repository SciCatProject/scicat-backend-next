'use strict';

var loopback = require('loopback');
var path = require('path');
var boot = require('loopback-boot');
var base64js = require('base64-js');
var fs = require('fs');



var app = module.exports = loopback();
var configLocal = require('./config.local');

const uuidv3 = require('uuid/v3');

// Create an instance of PassportConfigurator with the app instance
var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// enhance the profile definition to allow for applying regexp based substitution rules to be applied
// to the outcome of e.g. LDAP queries. This can for example be exploited to define the groups
// a user belongs to by scanning the output of the memberOf fields of a user
//
// example of a profile entry in providers.json:
// "accessGroups": ["memberOf", {match-string}, {substitution-string}]
//
// Please note: the match and substitution strings must escape the backslash and
// double quote characters inside providers.json by prepending a backslash

passportConfigurator.buildUserLdapProfile = function(user, options) {
    var profile = {};

    for (var profileAttributeName in options.profileAttributesFromLDAP) {
        var profileAttributeValue = options.profileAttributesFromLDAP[profileAttributeName];


        if (profileAttributeValue.constructor === Array) {
            var regex = new RegExp(profileAttributeValue[1], 'g')
            // transform array elements to simple group names
            // then filter relevant elements by applying regular expression on element names
            var newList = []
            var memberOfList=user[profileAttributeValue[0]]
            if ( memberOfList instanceof Array) {
                user[profileAttributeValue[0]].map(function(elem) {
                    if (elem.match(regex)) {
                        newList.push(elem.replace(regex, profileAttributeValue[2]))
                    }
                })
            } else if ( typeof memberOfList == 'string'){
                if (memberOfList.match(regex)) {
                    newList.push(memberOfList.replace(regex, profileAttributeValue[2]))
                }
            }
            profile[profileAttributeName] = newList
        } else {
            if (profileAttributeValue in user){
              profile[profileAttributeName] = JSON.parse(JSON.stringify(user[profileAttributeValue]));
          } else {
               profile[profileAttributeName]=''
          }
        }
    }
    // If missing, add profile attributes required by UserIdentity Model
    if (!profile.username) {
        profile.username = [].concat(user['cn'])[0];
    }
    if (!profile.thumbnailPhoto2) {
        if (user.hasOwnProperty('_raw') ) {
            var img = user._raw.thumbnailPhoto;
            profile.thumbnailPhoto ="data:image/jpeg;base64," + img.toString("base64");
        } else {
            profile.thumbnailPhoto = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        }
    }
    if (!profile.id) {
        profile.id = user['uid'];
		if (!('uid' in user)){
			const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
			const generated_id = uuidv3( user['mail'], MY_NAMESPACE);
			profile.id = generated_id;
		}
    }
    if (!profile.emails) {
        var email = [].concat(user['mail'])[0];
        if (!!email) {
            profile.emails = [{
                value: email
            }];
        }
    }

    if (configLocal.site === 'ESS') {
        if (!profile.accessGroups) {
            profile.accessGroups = ['ess', 'loki', 'odin'];
        }
    }

    console.log("++++++++++ Profile:", profile)
    return profile;
};

if ('queue' in configLocal) {
    var msg = 'Queue configured to be ';
    switch(configLocal.queue) {
        case 'rabbitmq':
            console.log(msg + 'RabbitMQ');
            break;
        case 'kafka':
            console.log(msg + 'Apache Kafka');
            break;
        default:
            console.log('Queuing system not configured.');
            break;
    }
}

if ('smtpSettings' in configLocal) {
    console.log('Email settings detected');
}

var bodyParser = require('body-parser');
var ENV = process.env.NODE_ENV || 'local';
app.start = function () {
    // start the web server
    return app.listen(function () {
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
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json({
    limit: '50mb'
}));
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
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
