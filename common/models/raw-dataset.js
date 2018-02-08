"use strict";
var utils = require('./utils');

module.exports = function (Rawdataset) {
    var app = require('../../server/server');

  // filter on dataset type (raw, derived etc)
  Rawdataset.observe('access', function(ctx, next) {
      var typeCondition = {
          type: 'raw'
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

    Rawdataset.observe('before save', function (ctx, next) {
        ctx.instance.type = 'raw';
        next();
    });

    // put
    Rawdataset.beforeRemote('replaceOrCreate', function (ctx, instance, next) {
        utils.updateTimesToUTC(["endTime"], ctx.args.data)
        next();
    });

    //patch
    Rawdataset.beforeRemote('patchOrCreate', function (ctx, instance, next) {
        utils.updateTimesToUTC(["endTime"], ctx.args.data)
        next();
    });

    //post
    Rawdataset.beforeRemote('create', function (ctx, unused, next) {
        utils.updateTimesToUTC(["endTime"], ctx.args.data)
        next();
    });

    Rawdataset.beforeRemote('facet', function (ctx, userDetails, next) {
        // const token = ctx.options && ctx.options.accessToken;
        //     const userId = token && token.userId;
        ctx.args.type = 'raw';
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
