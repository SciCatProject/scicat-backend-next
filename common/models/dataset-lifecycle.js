'use strict';
var config = require('../../server/config.local');
var utils = require('./utils');


module.exports = function(Datasetlifecycle) {

    var app = require('../../server/server');
    // put
    Datasetlifecycle.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(['dateOfLastMessage'], ctx.args.data);
        next();
    });

    //patch
    Datasetlifecycle.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(['dateOfLastMessage'], ctx.args.data);

        next();
    });


    //post
    Datasetlifecycle.beforeRemote('create', function(ctx, unused, next) {
        utils.updateTimesToUTC(['dateOfLastMessage'], ctx.args.data);
        next();
    });


    Datasetlifecycle.observe('before save', (ctx, next) => {
        console.log('about to save');
        if (ctx.instance) { // Is this not stored in ctx.currentInstance or ctx.data?
            // auto fill retention and publishing time
            var now = new Date();
            if (!ctx.instance.dateOfLastMessage) {
                ctx.instance.dateOfLastMessage = now.toISOString();
            }
            if (!ctx.instance.archiveRetentionTime) {
                var retention = new Date(now.setFullYear(now.getFullYear() + config.policyRetentionShiftInYears));
                ctx.instance.archiveRetentionTime = retention.toISOString().substring(0, 10);
            }
            if (!ctx.instance.dateOfPublishing) {
                now = new Date(); // now was modified above
                var pubDate = new Date(now.setFullYear(now.getFullYear() + config.policyPublicationShiftInYears));
                ctx.instance.dateOfPublishing = pubDate.toISOString().substring(0, 10);
            }
        }
        // add ownerGroup field from linked Datasets
        utils.addOwnerGroup(ctx, next)
     })
};
