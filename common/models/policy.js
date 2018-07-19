'use strict';

//model extension file

var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');
var own = require('./ownable.json');

module.exports = function(Policy) {
    var app = require('../../server/server');

    // for policy interactions
    // check logged in user email is a member of policy.manager
    Policy.observe('before save', (ctx, next) => {

        if (ctx.currentInstance) {
            //is a partial update currentInstance rather than instance
            var UserIdentity = app.models.UserIdentity;
            var userId = ctx.options.accessToken.userId;

            //PersistedModel Static Method call
            UserIdentity.findOne({
                //json filter
                where: {
                    userId: userId
                }
            }, function(err, instance) {
                var email = instance.profile.email;
                //console.log("email:", email);
                //console.log("manager: ", ctx.currentInstance.manager);
                if (!ctx.currentInstance.manager.includes(email)) {
                    var e = new Error('Access Not Allowed - policy manager action');
                    e.statusCode = 401;
                    next(e);
                }
                else next();
            });
        } else {
            //is an full update/insert/delete
            //should only be proposalingestor
            next();
        }
    });
};
