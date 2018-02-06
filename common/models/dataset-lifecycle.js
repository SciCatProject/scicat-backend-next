'use strict';
var config = require('../../server/config.local');
var utils = require('./utils');


module.exports = function(Datasetlifecycle) {

    var app = require('../../server/server');
    // put
    Datasetlifecycle.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(["dateOfLastMessage"], ctx.args.data)
        next();
    });

    //patch
    Datasetlifecycle.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(["dateOfLastMessage"], ctx.args.data)
        next();
    });

    //post
    Datasetlifecycle.beforeRemote('create', function(ctx, unused, next) {
        utils.updateTimesToUTC(["dateOfLastMessage"], ctx.args.data)
        if (!('ownerGroup' in ctx.args.data)) {
            ctx.args.data.ownerGroup = ['p16738'];
        }
        next();
    });


    Datasetlifecycle.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            // auto fill retention and publishing time
            var now = new Date();
            if (!ctx.instance.dateOfLastMessage) {
                ctx.instance.dateOfLastMessage = now.toISOString()
            }
            if (!ctx.instance.archiveRetentionTime) {
                var retention = new Date(now.setFullYear(now.getFullYear() + config.policyRetentionShiftInYears));
                ctx.instance.archiveRetentionTime = retention.toISOString().substring(0, 10)
            }
            if (!ctx.instance.dateOfPublishing) {
                var now = new Date(); // now was modified above
                var pubDate = new Date(now.setFullYear(now.getFullYear() + config.policyPublicationShiftInYears));
                ctx.instance.dateOfPublishing = pubDate.toISOString().substring(0, 10)
            }
        }
        next();
    })
};
