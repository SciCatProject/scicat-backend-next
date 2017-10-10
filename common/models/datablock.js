'use strict';
var utils = require('./utils');

module.exports = function(Datablock) {

    var app = require('../../server/server');

    // ensure that the correct type of dataset link (raw, derived, plain) is set

    Datablock.observe('before save', function(ctx, next) {
        utils.linkToProperDatasetType(ctx, next)
    });

    Datablock.validatesUniquenessOf('archiveId', {
        message: 'ArchiveId is not unique'
    });

    Datablock.validatesPresenceOf('datasetId');

    // transfer packedSize info to dataset
    Datablock.observe('after save', (ctx, next) => {
        var Datablock = app.models.Datablock
        utils.transferSizeToDataset(Datablock, 'packedSize', ctx, next)

    })
};
