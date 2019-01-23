'use strict';

module.exports = function (Deriveddataset) {
    var utils = require('./utils');

    Deriveddataset.validatesUniquenessOf('pid');

    // filter on dataset type (raw, derived etc)
    Deriveddataset.observe('access', function (ctx, next) {
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

    Deriveddataset.observe('before save', function (ctx, next) {
        if(ctx.instance){
            ctx.instance.type = 'derived';
        }
        next();
    });

    Deriveddataset.beforeRemote('fullfacet', function(ctx, userDetails, next) {
            if (!ctx.args.fields)
            ctx.args.fields = {};
        ctx.args.fields.type = 'derived';
        utils.handleOwnerGroups(ctx, next);
    })

    Deriveddataset.beforeRemote('fullquery', function(ctx, userDetails, next) {
        if (!ctx.args.fields)
            ctx.args.fields = {};
        ctx.args.fields.type = 'derived';
        utils.handleOwnerGroups(ctx, next);
    });

    Deriveddataset.isValid = function (dataset, next) {
        var ds=new Deriveddataset(dataset)
        ds.isValid(function(valid) {
            if(!valid) {
                next(null, {'errors': ds.errors, 'valid': false})
            }else{
                next(null, {'valid': true})
            }
        });
    }
};
