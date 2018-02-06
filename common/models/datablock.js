'use strict';
var utils = require('./utils');

module.exports = function(Datablock) {

    var app = require('../../server/server');
    // put
    Datablock.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        // handle embedded datafile documents
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

    //patch
    Datablock.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

    //post
    Datablock.beforeRemote('create', function(ctx, unused, next) {
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        // var Dataset = app.models.RawDataset; always shown as empty, DB isues?
        // Datablock.count().then(count => {
        //     console.log(count);
        // })
        if (!('ownerGroup' in ctx.args.data)) {
            ctx.args.data.ownerGroup = ['p16738'];
        }
        next();
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
