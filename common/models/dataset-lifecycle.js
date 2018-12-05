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
        utils.addOwnerGroup(ctx, next);
    })

    Datasetlifecycle.observe('after save', (ctx, next) => {
    // TODO add here a hook to check the relevant policy record for "autoArchive"
    // if this is "true" then create a new job instance to archive the dataset.  
    // do NOT override the CLI parameter for autoArchive...

    // if ingest CLI already auto archive return
     /*   var Policy = app.models.Policy;
        Policy.findOne({
                    where: {
                        ownerGroup: ctx.instance.ownerGroup
                    }
                },
                function(err, policyInstance) {
                if (!policyInstance || err) {
                    console.log("Error when looking for Policy of pgroup ", ctx.instance.ownerGroup, err)
                } 
                else {
                    if (policyInstance && policyInstance.autoArchive  ) {
                        // create auto archive job
                        
                        utils.createArchiveJob(policyInstance, ctx);
                    }
                }
        });*/
    });

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
                                    console.log("==== error finding dataset:",err)
                                    next(err);
                                } else {
                                    instance.updateAttributes({
                                        packedSize: 0,
                                    }, options, function(err,inst){
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
