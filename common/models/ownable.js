'use strict';

module.exports = function(Ownable) {
    // to get access to other models
    var app = require('../../server/server');

    Ownable.observe('access', function(ctx, next) {
        const token = ctx.options && ctx.options.accessToken;
        const userId = token && token.userId;
        // const user = userId ? 'user#' + userId : '<anonymous>';
        var UserIdentity = app.models.UserIdentity;
        UserIdentity.findOne({where: {userId: userId}},function(err, instance) {
            // console.log("UserIdentity Instance:",instance)
            if (instance && instance.profile) {
                var groups=instance.profile.accessGroups
                // check if a normal user or an internal ROLE
                if (typeof groups === 'undefined') {
                    groups = []
                }
                // console.log("Found groups:", groups);
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
                console.log('%s: %s accessed %s:%s', new Date(), instance.profile.login, ctx.Model.modelName, scope);
                next()
            } else {
              // According to: https://loopback.io/doc/en/lb3/Operation-hooks.html
              var e = new Error('Access Not Allowed');
              e.statusCode = 401;
              next(e);
            }
        })
    });

};
