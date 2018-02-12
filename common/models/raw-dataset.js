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
        if (!ctx.args.fields)
            ctx.args.fields = {};
        ctx.args.fields.type = 'raw';
        utils.handleOwnerGroups(ctx, userDetails, next);
    });
};
