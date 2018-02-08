'use strict';

module.exports = function(Deriveddataset) {
    var app = require('../../server/server');

    // filter on dataset type (raw, derived etc)
    Deriveddataset.observe('access', function(ctx, next) {
        var typeCondition = {
            type: 'derived'
        };
        if (!ctx.query.where) {
            ctx.query.where = typeCondition
        } else {
            ctx.query.where = {
                and: [ctx.query.where, typeCondition]
            }
        }
        // const scope = ctx.query.where ? JSON.stringify(ctx.query.where) : '<all records>';
        // console.log('%s: %s accessed %s:%s', new Date(), ctx.Model.modelName, scope);
        next()
    });

    Deriveddataset.observe('before save', function(ctx, next) {
        ctx.instance.type = 'derived';
        next();
    });

    Deriveddataset.beforeRemote('facet', function (ctx, userDetails, next) {
        // const token = ctx.options && ctx.options.accessToken;
        //     const userId = token && token.userId;
        ctx.args.type = 'derived';
        const userId = ctx.req.accessToken && ctx.req.accessToken.userId;
        if (userId === null) {
            userId = ctx.req.args.accessToken;
        }
        // const user = userId ? 'user#' + userId : '<anonymous>';
        var UserIdentity = app.models.UserIdentity;
        var User = app.models.User;
        if (!userId) {
            var e = new Error('Cannot find access token');
            e.statusCode = 401;
            next(e);
        }
        // console.log(ctx.req);
        // TODO add check for functional accounts and ignore below if true
        User.findById(userId, function (err, user) {
            if (err) {
                next(err);
            } else if (user['username'].indexOf('.') === -1) {
                ctx.args.ownerGroup = [];
                next()
            } else {
                let groups = ctx.args.ownerGroup ? ctx.args.ownerGroup : [];
                UserIdentity.findOne({
                    where: {
                        userId: userId
                    }
                }, function (err, instance) {
                    console.log("UserIdentity Instance:", instance)
                    if (instance && instance.profile) {
                        var foundGroups = instance.profile.accessGroups
                        // check if a normal user or an internal ROLE
                        if (typeof foundGroups === 'undefined') {
                            ctx.args.ownerGroup = [];
                            next()
                        }
                        var a = new Set(groups);
                        var b = new Set(foundGroups);
                        var intersection = new Set([...a].filter(x => b.has(x)));
                        var subgroups = Array.from(intersection);
                        if (subgroups.length === 0) {
                            var e = new Error('User has no group access');
                            e.statusCode = 401;
                            next(e);
                        } else {
                            ctx.args.ownerGroup = subgroups;
                            next();
                        }
                    } else {
                        // According to: https://loopback.io/doc/en/lb3/Operation-hooks.html
                        var e = new Error('Access Not Allowed');
                        e.statusCode = 401;
                        next(e);
                    }
                })
            }
            console.log(ctx)

        });
    });
};
