'use strict';
var config = require('../../server/config.local');
var utils = require('./utils');

module.exports = function(Datasetlifecycle) {
    var app = require('../../server/server');

    // now explicitly tested in utils.linkToProperDatasetType
    // Datasetlifecycle.validatesPresenceOf('datasetId')

    Datasetlifecycle.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            // auto fill retention and publishing time
            var now = new Date();
            if (!ctx.instance.dateOfLastMessage) {
                ctx.instance.dateOfLastMessage = now.toISOString()
            }
            if (!ctx.instance.archiveRetentionTime) {
                var retention = new Date(now.setFullYear(now.getFullYear() + config.policyRetentionShiftInYears));
                ctx.instance.archiveRetentionTime = retention.toISOString()
            }
            if (!ctx.instance.dateOfPublishing) {
                var now = new Date(); // now was modified above
                var pubDate = new Date(now.setFullYear(now.getFullYear() + config.policyPublicationShiftInYears));
                ctx.instance.dateOfPublishing = pubDate.toISOString()
            }
        }
        utils.linkToProperDatasetType(ctx, next)
    })
};
