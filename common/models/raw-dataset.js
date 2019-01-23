'use strict';
var utils = require('./utils');

module.exports = function(Rawdataset) {
  var app = require('../../server/server');

  Rawdataset.validatesUniquenessOf('pid');

  // filter on dataset type (raw, derived etc)
  Rawdataset.observe('access', function(ctx, next) {
    var typeCondition = {
      type: 'raw',
    };
    if (!ctx.query.where) {
      ctx.query.where = typeCondition;
    } else {
      ctx.query.where = {
        and: [ctx.query.where, typeCondition],
      };
    }
    // const scope = ctx.query.where ? JSON.stringify(ctx.query.where) : '<all records>';
    // console.log('%s: %s accessed %s:%s', new Date(), ctx.Model.modelName, scope);
    next();
  });

  Rawdataset.observe('before save', function(ctx, next) {
    if (ctx.instance) {
      ctx.instance.type = 'raw';
    }
    // check if proposal is linked, if not try to add one
    if(!ctx.instance.proposalId){
      var Proposal = app.models.Proposal
      const filter = { where: { ownerGroup: ctx.instance.ownerGroup } };
      Proposal.findOne(filter,ctx.options).then(instance => {
        if(instance){
          // console.log("Appended Proposal "+instance.proposalId+" to rawdataset "+ctx.instance.pid)
          ctx.instance.proposalId=instance.proposalId
        } 
        return next()
      })
    } else {
      return next()
    }
  });

  // put
  Rawdataset.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
    utils.updateTimesToUTC(['endTime'], ctx.args.data);
    next();
  });

  // patch
  Rawdataset.beforeRemote('patchOrCreate', function(ctx, instance, next) {
    utils.updateTimesToUTC(['endTime'], ctx.args.data);
    next();
  });

  // post
  Rawdataset.beforeRemote('create', function(ctx, unused, next) {
    utils.updateTimesToUTC(['endTime'], ctx.args.data);
    next();
  });

  Rawdataset.beforeRemote('fullfacet', function(ctx, userDetails, next) {
      if (!ctx.args.fields)
          ctx.args.fields = {};
      ctx.args.fields.type = 'raw';
      utils.handleOwnerGroups(ctx, next);
  });

  Rawdataset.beforeRemote('fullquery', function(ctx, userDetails, next) {
      if (!ctx.args.fields)
          ctx.args.fields = {};
      ctx.args.fields.type = 'raw';
      utils.handleOwnerGroups(ctx, next);
  });

  Rawdataset.isValid = function(dataset, next) {
    var ds = new Rawdataset(dataset);
    ds.isValid(function(valid) {
      if (!valid) {
        next(null, {
          'errors': ds.errors,
          'valid': false,
        });
      } else {
        next(null, {
          'valid': true,
        });
      }
    });
  };
};
