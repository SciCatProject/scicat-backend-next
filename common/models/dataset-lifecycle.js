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
        // auto fill retention and publishing time only at initial creation time
        // in this case only ctx.instance is defined
        if (ctx.instance) {
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

    // transfer status flags to linked dataset
    Datasetlifecycle.observe('after save', (ctx, next) => {
        var Dataset = app.models.Dataset
        var instance = ctx.instance
        if (!instance) {
            instance = ctx.currentInstance
        }
        if (instance && (instance.datasetId !== undefined)) {
            const datasetId = decodeURIComponent(instance.datasetId)
            Dataset.findById(datasetId, null, ctx.options).then(datasetInstance => {
                if (datasetInstance) {
                    // important to pass options here, otherwise context gets lost
                    datasetInstance.updateAttributes({
                            archivable: instance.archivable,
                            retrievable: instance.retrievable,
                            publishable: instance.publishable
                        }, ctx.options,
                        function(err, datasetInstance) {
                            if (err) {
                                var error = new Error();
                                error.statusCode = 403;
                                error.message = err;
                                next(error)
                            } else {
                                next()
                            }
                        })
                } else {
                    var error = new Error();
                    error.statusCode = 404;
                    error.message = "DatasetLifecycle after save: No dataset found with pid " + datasetId
                    next(error)
                }
            })
        } else {
            next()
        }
    })

    Datasetlifecycle.isValid = function(instance, next) {
        var ds = new Datasetlifecycle(instance)
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

    // clean up data connected to a dataset, e.g. if archiving failed

    Datasetlifecycle.reset = function(id, options, next) {
        var Datablock = app.models.Datablock;
        var Dataset = app.models.Dataset;
        Datasetlifecycle.findById(id, options, function(err, l) {
            if (err) {
                next(err);
            } else {
                l.updateAttributes({
                    archiveStatusMessage: 'datasetCreated',
                    retrieveStatusMessage: '',
                    archivable: true,
                    retrievable: false
                }, options, function(err, dslInstance) {
                    Datablock.destroyAll({
                        datasetId: id,
                    }, options, function(err, b) {
                        if (err) {
                            next(err);
                        } else {
                            Dataset.findById(id, options, function(err, instance) {
                                if (err) {
                                    console.log("==== error finding dataset:", err)
                                    next(err);
                                } else {
                                    instance.updateAttributes({
                                        packedSize: 0,
                                    }, options, function(err, inst) {
                                        next();
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    };

};
