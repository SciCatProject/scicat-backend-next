'use strict';
var config = require('../../server/config.local');
var utils = require('./utils');


module.exports = function (Datasetlifecycle) {
    Datasetlifecycle.observe('before save', (ctx, next) => {
        // auto fill retention and publishing time if not yet defined
        if (ctx.instance) {
            // auto fill retention and publishing time
            var now = new Date();
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
    })
};
