'use strict';
var utils = require('./utils');


module.exports = function(Origdatablock) {
    var app = require('../../server/server');
    
    // put
    Origdatablock.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        // handle embedded datafile documents
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

    //patch
    Origdatablock.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

    //post
    Origdatablock.beforeRemote('create', function(ctx, unused, next) {
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

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
