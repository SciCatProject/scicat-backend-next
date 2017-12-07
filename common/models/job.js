'use strict';

module.exports = function(Job) {

    Job.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            // auto fill dataOfLastMessage
            var now = new Date();
            if (!ctx.instance.dateOfLastMessage) {
                ctx.instance.dateOfLastMessage = now.toISOString()
            }
        }
        next();
    })

    Job.observe('after save', (ctx, next) => {
        if (ctx.instance) {
            if(ctx.isNewInstance) {
                // TODO THIS should go to RABBIT OR KAFKA OR ANY QUEUING SYSTEM
                // Job.publishJob(ctx.instance, "jobqueue")
                console.log('Saved Job %s#%s and published to message broker', ctx.Model.modelName, ctx.instance.id);
            }
        } else {
            console.log('Updated %s matching %j',
                ctx.Model.pluralModelName,
                ctx.where);
        }
        next();
    })
};
