'use strict';
const util = require('util')
module.exports = function (Ownable) {
    // to get access to other models
    var app = require('../../server/server');

    Ownable.observe('access', function (ctx, next) {
        // console.log("+++++ Access ctx.options:",ctx.options)
        const groups = ctx.options && ctx.options.currentGroups;
        // append group based conditions unless functional accounts with global access role
        if (groups && groups.length > 0 && groups.indexOf("globalaccess")<0) {
            var groupCondition = {
                or: [{
                        ownerGroup: {
                            inq: groups
                        }
                    },
                    {
                        accessGroups: {
                            inq: groups
                        }
                    }
                ]
            };
            if (!ctx.query.where) {
                ctx.query.where = groupCondition
            } else {
                ctx.query.where = {
                    and: [ctx.query.where, groupCondition]
                }
            }
            console.log("000000000 ctx.query.where", util.inspect(ctx.query, {showHidden: false, depth: null}))
        }
        next()
    });

    Ownable.isValid = function (instance, next) {
        var ds = new Ownable(instance)
        ds.isValid(function (valid) {
            if (!valid) {
                next(null, {
                    'errors': ds.errors,
                    'valid': false
                })
            } else {
                next(null, {
                    'valid': true
                })
            }
        });
    }

    Ownable.observe('before save', function (ctx, next) {


        if (ctx.instance) {
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function (err, instance) {
                    if (instance) {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = instance.username;
                        } else {
                            ctx.instance.createdBy = instance.username
                        }
                    } else {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = "anonymous";
                        } else {
                            ctx.instance.createdBy = "anonymous"
                        }
                    }
                    next()
                })
            } else {
                if (ctx.instance.createdBy) {
                    ctx.instance.updatedBy = "anonymous";
                } else {
                    ctx.instance.createdBy = "anonymous"
                }
                next();
            }
        } else if (ctx.data) {
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function (err, instance) {
                    if (instance) {
                        ctx.data.updatedBy = instance.username
                    } else {
                        ctx.data.updatedBy = "anonymous";
                    }
                    next()
                })
            } else {
                ctx.data.updatedBy = "anonymous";
                next();
            }
        }
    });
};
