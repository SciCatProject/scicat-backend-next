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

    Origdatablock.validatesPresenceOf('datasetId');

    Origdatablock.observe('before save', (ctx, next) => {
        // add ownerGroup field from linked Datasets
        utils.addOwnerGroup(ctx, next)
    })


    // transfer size info to dataset
    Origdatablock.observe('after save', (ctx, next) => {
        var OrigDatablock = app.models.OrigDatablock
        // not yet ready utils.createArchiveJob(app.models.UserIdentity, app.models.Policy, app.models.Job, ctx)
        utils.transferSizeToDataset(OrigDatablock, 'size', ctx, next)
    })

    Origdatablock.isValid = function(instance, next) {
        var ds = new Origdatablock(instance)
        ds.isValid(function(valid) {
            if (!valid) {
                next(null, {
                    'errors': ds.errors,
                    'valid': false
                })
            } else {
                next(null, {
                    'valid': true
                })
            }
        });
    }
}
