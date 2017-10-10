'use strict';

module.exports = function(Job) {
    Job.observe('after save', (ctx, next) => {
        if (ctx.instance) {
            console.log('Saved %s#%s', ctx.Model.modelName, ctx.instance.id);
            Job.publishJob(ctx.instance, "jobqueue")
        } else {
            console.log('Updated %s matching %j',
                ctx.Model.pluralModelName,
                ctx.where);
        }
        next();
    })
};
