'use strict';
var utils = require('./utils');

module.exports = function(Origdatablock) {

    var app = require('../../server/server');

    Origdatablock.observe('before save', (ctx, next) => {
        utils.linkToProperDatasetType(ctx,next)
    })

    Origdatablock.validatesPresenceOf('datasetId');

    // transfer size info to dataset
    Origdatablock.observe('after save', (ctx, next) => {
        var OrigDatablock = app.models.OrigDatablock
        utils.transferSizeToDataset(OrigDatablock, 'size', ctx, next)

    })
};
