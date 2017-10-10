'use strict';

module.exports = function(Ownable) {
    // to get access to other models
    var app = require('../../server/server');

    Ownable.observe('access', function(ctx, next) {

        const token = ctx.options && ctx.options.accessToken;
        const userId = token && token.userId;
        const user = userId ? 'user#' + userId : '<anonymous>';
        var User = app.models.User;
        // console.log("Inside access observer of Ownable for userid ",token, userId, user)
        User.findById(userId, function(err, instance) {
            if (instance) {
                // check if a normal user or an internal ROLE
                if (instance.username.split('.').length < 2) {
                    // console.log("Functional account, apply ACLs only: ",instance.username)
                    next()
                } else {
                    var filter = {
                        where: {
                            sAMAccountName: instance.username.split('.')[1]
                        }
                    };
                    var AccessUser = app.models.AccessUser;
                    AccessUser.findOne(filter, function(err, auser) {
                        if (auser) {
                            // filter pgroups p[digits]
                            var groups = auser.memberOf.filter(function(el) {
                                return /p\d+/.test(el)
                            }); // ['p12672'];
                            if (typeof groups === 'undefined') {
                                groups = []
                            }
                            console.log("Found groups:", groups);
                            var groupCondition = {
                                ownerGroup: {
                                    inq: groups
                                }
                            };
                            if (!ctx.query.where) {
                                ctx.query.where = groupCondition
                            } else {
                                ctx.query.where = {
                                    and: [ctx.query.where, groupCondition]
                                }
                            }
                            const scope = ctx.query.where ? JSON.stringify(ctx.query.where) : '<all records>';
                            console.log('%s: %s accessed %s:%s', new Date(), instance.username, ctx.Model.modelName, scope);
                        }
                        next();
                    })
                }
            }
        })
    });

};
