'use strict';
var config = require('../../server/config.local');
var DataSource = require('loopback-datasource-juggler').DataSource;

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
        if (ctx.instance && ctx.isNewInstance) {
            if ('queue' in config.local && config.local.queue === 'rabbitmq') {
                Job.publishJob(ctx.instance, "jobqueue")
                console.log('Saved Job %s#%s and published to message broker', ctx.Model.modelName, ctx.instance.id);
            } else if ('queue' in config.local && config.local.queue === 'rabbitmq') {
                // Execute specific commands for Kafka here. Sample connection string added below.
                var options = {
                    connectionString: 'localhost:2181/'
                };
                var dataSource = new DataSource('kafka', options);
            }
        } else {
            console.log('Updated %s matching %j',
                ctx.Model.pluralModelName,
                ctx.where);
        }
        next();
    })
};
