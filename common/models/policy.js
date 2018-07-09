'use strict';

module.exports = function(Policy) {

};

//model extension file

/*var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');
var dsl = require('./dataset-lifecycle.json');
var ds = require('./dataset.json');
var dsr = require('./raw-dataset.json');
var dsd = require('./derived-dataset.json');
var own = require('./ownable.json');

module.exports = function(Policy) {
        var app = require('../../server/server');
        console.log("Log: policy.js 1!");

        // check logged in user email is a member of policy.manager
        Policy.observe('before save', (ctx, next) => {
          console.log("I am her!!!!!!!!");
            if (ctx.instance) {
                var email
                var login
                if (user && user.profile) {
                    login = user.profile.login
                    email = user.profile.email
                } else {
                    login = Object.keys(ctx.options.authorizedRoles)[0]
                    email = login
                }

            }
            next();
        });
      };
*/
