'use strict';

var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');


module.exports = function(Dataset) {
    var app = require('../../server/server');
    // Dataset.validatesUniquenessOf('sourceFolder', {
    //     message: 'SourceFolder is not unique'
    // });
    //

    // put
    Dataset.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(["creationTime"], ctx.args.data)
        next();
    });

    //patch
    Dataset.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(["creationTime"], ctx.args.data)
        next();
    });

    //post
    Dataset.beforeRemote('create', function(ctx, unused, next) {
        utils.updateTimesToUTC(["creationTime"], ctx.args.data)
        next();
    });



    // auto add pid
    Dataset.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            if (ctx.isNewInstance) {
                ctx.instance.pid = config.pidPrefix + '/' + ctx.instance.pid;
                console.log(' new pid:', ctx.instance.pid);
            } else {
                console.log('  unmodified pid:', ctx.instance.pid);
            }
            ctx.instance.version = p.version;
        }
        next();
    });

    // clean up data connected to a dataset, e.g. if archiving failed
    Dataset.reset = function(id, options, cb) {
        console.log('resetting ' + id);
        var Datablock = app.models.Datablock;
        var DatasetLifecycle = app.models.DatasetLifecycle;
        DatasetLifecycle.findOne({
            datasetId: id
        }, options, function(err, l) {
            if (err) {
                cb(err);
            }
            l['archiveStatusMessage'] = 'datasetCreated';
            l['retrieveStatusMessage'] = '';
            DatasetLifecycle.update(l, function(err, inst) {
                if (err) {
                    cb(err);
                }
                console.log('Dataset Lifecycle reset');
                Datablock.destroyAll({
                    datasetId: id
                }, options, function(err, b) {
                    if (err) {
                        cb(err);
                    }
                    console.log('Deleted blocks');
                    cb();
                });
            });
        });
    };
};
