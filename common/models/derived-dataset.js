'use strict';

module.exports = function(Deriveddataset) {

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
};
