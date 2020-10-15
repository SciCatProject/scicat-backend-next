"use strict";
const util = require("util");
module.exports = function (Ownable) {
    // to get access to other models
    var app = require("../../server/server");

    Ownable.observe("access", function (ctx, next) {
        // console.log("+++++ Access ctx.options:",ctx.options)
        if (
            ctx.Model.modelName === "Dataset" &&
            ctx.query.where &&
            ctx.query.where.isPublished
        ) {
            next();
        } else {
            const groups = ctx.options && ctx.options.currentGroups;
            // append group based conditions unless functional accounts with global access role
            if (groups && groups.length > 0 && groups.indexOf("globalaccess") < 0) {
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
                    ctx.query.where = groupCondition;
                } else {
                    ctx.query.where = {
                        and: [ctx.query.where, groupCondition]
                    };
                }
            }
            next();
        }
    });

    Ownable.isValid = function (instance, next) {
        var ds = new Ownable(instance);
        ds.isValid(function (valid) {
            if (!valid) {
                next(null, {
                    errors: ds.errors,
                    valid: false
                });
            } else {
                next(null, {
                    valid: true
                });
            }
        });
    };

    Ownable.observe("before save", function (ctx, next) {
        // make sure that only ownerGroup members have modify rights
        if (ctx.data && ctx.options && !ctx.options.validate) {
            let groups = []
            if (ctx.options && ctx.options.currentGroups) {
                // ("Your groups are:", ctx.options.currentGroups)
                groups = ctx.options.currentGroups
            };
            // however allow history updates
            if (!ctx.data['history'] && ctx.currentInstance) {
                // modify operations are forbidden unless you are member of ownerGroup or have globalaccess role  
                if ((groups.indexOf("globalaccess") < 0) && !ctx.isNewInstance && groups.indexOf(ctx.currentInstance.ownerGroup) < 0) {
                    var e = new Error();
                    e.statusCode = 403;
                    e.message = 'You must be in ownerGroup ' + ctx.currentInstance.ownerGroup + " or have global role to modify document, your groups are:" + groups
                    return next(e);
                }
            }
        }
        // add some admin infos automatically
        if (ctx.instance) {
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function (
                    err,
                    instance
                ) {
                    if (instance) {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = instance.username;
                        } else {
                            ctx.instance.createdBy = instance.username;
                        }
                    } else {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = "anonymous";
                        } else {
                            ctx.instance.createdBy = "anonymous";
                        }
                    }
                    return next();
                });
            } else {
                if (ctx.instance.createdBy) {
                    ctx.instance.updatedBy = "anonymous";
                } else {
                    ctx.instance.createdBy = "anonymous";
                }
                return next();
            }
        } else if (ctx.data) {
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function (
                    err,
                    instance
                ) {
                    if (instance) {
                        ctx.data.updatedBy = instance.username;
                    } else {
                        ctx.data.updatedBy = "anonymous";
                    }
                    return next();
                });
            } else {
                ctx.data.updatedBy = "anonymous";
                return next();
            }
        }
    });
};
