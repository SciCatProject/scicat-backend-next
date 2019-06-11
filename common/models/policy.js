'use strict';

//model extension file

var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');
var own = require('./ownable.json');

module.exports = function (Policy) {
    var app = require('../../server/server');

    // check that the user has authority to change a record
    // input ownerGroup of the record being changed
    Policy.validatePermission = function (ownerGroup, userEmail, next) {
        Policy.findOne({
            where: { ownerGroup }
        }, function (err, policy) {
            if(err){
                return next(new Error("No policy found for group", ownerGroup));
            }
            if (policy.manager.includes(userEmail)) {
                return next();
            }
            return next(new Error("User not authorised for action based on policy"));
        });
    };

    // mass update of policy records
    Policy.updatewhere = function (where, data, ctx, next) {
        // with manager validation
        // where should look like {{"or":[{"ownerGroup":"p17079"}]}}
        var UserIdentity = app.models.UserIdentity;
        // WARNING: ctx changes based on the position in the callback
        const userId = ctx.req.accessToken.userId;
        UserIdentity.findOne({
            where: {
                userId: userId
            }
        }, function (err, identity) {
            if (err) {
                err.statusCode = '404';
                return next(err);
            }
            
            if (!identity) {
                err = new Error("No user identity found");
                err.statusCode = '404';
                return next(err);
            }
            where.or.forEach(function (object) {
                Policy.validatePermission(object.ownerGroup, identity.profile.email, function (err) {
                    if (err) {
                        err.statusCode = '404';
                        return next(err);
                    } else {
                        Policy.update(where, data, function (err){
                            if (err){
                                return next(err);
                            }
                        });
                    }
                });
            });
            return next(err, "successful policy update");
        });
    };

    Policy.remoteMethod("updatewhere", {
        accepts: [{
                arg: "where",
                type: "object",
                required: true
            }, {
                arg: "data",
                type: "object",
                required: true
            },
            {
                arg: 'options',
                type: 'object',
                http: {
                    source: 'context'
                }
            }
        ],
        http: {
            path: "/updatewhere",
            verb: "post"
        },
        returns: {
            type: "Object",
            root: true
        }
    });

    Policy.validatesUniquenessOf('ownerGroup');
};
