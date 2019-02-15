var app = require('../../server/server');
var moment = require('moment-timezone');
var exports = module.exports = {};
// Utility function to transfer size information from the datablock storage to the related dataset

// Just a hint
// Some loopback magic requires to call toObject() on ctx.instance to get access to the real instance
// however when accessing the attributes, e.g. in an expression line ctx.instance.datasetId
// this translation is done automatically behind the scenes. One could use a line
// like the following to make this more explicit
// var block = ctx.instance.toObject()
// Note: Depending on the request PUT/POST etc either ctx.instance or ctx.currentInstance is set


exports.transferSizeToDataset = function (obj, sizeField, ctx, next) {
    var instance = ctx.instance
    if (!instance) {
        instance = ctx.currentInstance
    }
    if (instance) {
        // get all current objects connected to the same dataset
        if (instance.datasetId !== undefined) {
            const datasetId = decodeURIComponent(instance.datasetId)
            // get all current datablocks connected to the same dataset
            var filter = {
                where: {
                    datasetId: datasetId
                },
                fields: {
                    [sizeField]: true
                }
            }
            obj.find(filter, ctx.options).then(instances => {
                var total = instances.reduce(function (sum, value) {
                    return sum + value[sizeField]
                }, 0);

                var Dataset = app.models.Dataset
                Dataset.findById(datasetId, null, ctx.options).then(instance => {
                    if (instance) {
                        // important to pass options here, otherwise context gets lost
                        instance.updateAttributes({
                                [sizeField]: total
                            }, ctx.options,
                            function (err, instance) {
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
                        error.message = "No dataset found with pid " + datasetId
                        next(error)
                    }
                })
            })
        } else {
            console.log('%s: Error: Instance %j has no datasetId defined', new Date(), instance);
            var error = new Error();
            error.statusCode = 417;
            error.message = 'DatasetId must be defined';
            next(error)
        }
    } else {
        next()
    }
}


// add ownerGroup field from linked Datasets
exports.addOwnerGroup = function (ctx, next) {
    var instance = ctx.instance
    if (!instance) {
        instance = ctx.currentInstance
    }
    if (instance) {
        // get all current objects connected to the same dataset
        if (instance.datasetId !== undefined) {
            const datasetId = decodeURIComponent(instance.datasetId)
            // check if ownerGroup is not yet defined, add it in this policyPublicationShiftInYears
            if (instance.ownerGroup == undefined) {
                var Dataset = app.models.Dataset
                // console.log("Looking for dataset with id:", datasetId)
                Dataset.findById(datasetId, null, ctx.options).then(datasetInstance => {
                    console.log("      adding ownerGroup:", datasetInstance.ownerGroup)
                    instance.ownerGroup = datasetInstance.ownerGroup
                    // for partial updates the ownergroup must be added to ctx.data in order to be persisted
                    if (ctx.data) {
                        ctx.data.ownerGroup = datasetInstance.ownerGroup
                    }
                    next()
                })
            } else {
                next()
            }
        } else {
            console.log('%s: Error: Instance %j has no datasetId defined', new Date(), ctx.instance);
            var error = new Error();
            error.statusCode = 417;
            error.message = 'DatasetId must be defined';
            next(error)
        }
    } else {
        next()
    }
}

exports.createNewFacetPipeline = function (name, type, query) {
    const pipeline = [];

    if (type.constructor === Array) {
        pipeline.push({
            $unwind: '$' + name
        });
    }
    // add all conditions from "other" facets, exclude own conditions
    if (query && Object.keys(query).length > 0) {
        //console.log("createFacet query:",query);
        var q = Object.assign({}, query);
        delete q[name];
        if (Object.keys(q).length > 0)
            pipeline.push({
                $match: q
            });
    }
    let grp = {
        $group: {
            _id: '$' + name,
            count: {
                $sum: 1
            }
        }
    };
    if (type === 'date') {
        grp.$group._id = {
            year: {
                $year: '$' + name
            },
            month: {
                $month: '$' + name
            },
            day: {
                $dayOfMonth: '$' + name
            }
        }
    }
    pipeline.push(grp);
    const sort = {
        $sort: {
            _id: -1
        }
    };
    pipeline.push(sort);
    return pipeline;
}



exports.handleOwnerGroups = function (ctx, next) {
    if (!ctx.args.fields)
        ctx.args.fields = {};
    let userId = ctx.req.accessToken && ctx.req.accessToken.userId;
    if (userId === null && ctx.req.args) {
        userId = ctx.req.args.accessToken;
    }
    var UserIdentity = app.models.UserIdentity;
    var User = app.models.User;
    if (!userId) {
        var e = new Error('Cannot find access token');
        e.statusCode = 401;
        next(e);
    }
    User.findById(userId, function (err, user) {
        console.log("Inside handleOwnerGroup for user:", user)
        if (err) {
            next(err);
        } else if (user['username'].indexOf('.') === -1) {
            // system users have no pgroups assigned, no filter on these variables
            if (['ingestor', 'archiveManager', 'proposalIngestor'].indexOf(user['username']) < 0) {
                ctx.args.fields.userGroups = ['func-' + user['username']];
            } else {
                ctx.args.fields.userGroups = []
            }
            console.log("Defined usergroups for functional account as:", ctx.args.fields.userGroups)
            next()
        } else {
            UserIdentity.findOne({
                where: {
                    userId: userId
                }
            }, function (err, instance) {
                console.log("UserIdentity Instance:", instance)
                if (instance && instance.profile) {
                    var foundGroups = instance.profile.accessGroups;
                    // check if a normal user or an internal ROLE
                    if (typeof foundGroups === 'undefined' || foundGroups.length === 0) {
                        var e = new Error('User has no group access');
                        e.statusCode = 401;
                        next(e);
                    } else {
                        ctx.args.fields.userGroups = foundGroups;
                        console.log("Defined usergroups for normal users as:", ctx.args.fields.userGroups)
                        next()
                    }
                } else {
                    // According to: https://loopback.io/doc/en/lb3/Operation-hooks.html
                    var e = new Error('Access Not Allowed');
                    e.statusCode = 401;
                    next(e);
                }
            })
        }
    });
}

// recursive function needed to call asynch calls inside a loop
function updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next) {
    // console.log("Inside updateDatasets, index,id:", index,datasetInstances[index])
    if (index < 0) {
        return next()
    } else {
        // modify ctx.data to keep embedded data
        ctx.data = JSON.parse(JSON.stringify(ctxdatacopy))
        if (ctx.data && ctx.data.datasetlifecycle) {
            changes = JSON.parse(JSON.stringify(ctx.data.datasetlifecycle))
            ctx.data.datasetlifecycle = JSON.parse(JSON.stringify(datasetInstances[index].datasetlifecycle))
            // apply changes
            for (var k in changes) ctx.data.datasetlifecycle[k] = changes[k];
        }
        // do the real action
        var InitialDataset = app.models.InitialDataset
        InitialDataset.findById(datasetInstances[index].pid, ctx.options, function (err, initialDatasetInstance) {
            if (err) {
                console.log("Error when searching for initial dataset:", err)
                return next()
            }
            if (!initialDatasetInstance) {
                InitialDataset.create(datasetInstances[index], function (err, instance) {
                    console.log("      Created a dataset copy for pid:", datasetInstances[index].pid)
                    updateHistory(ctx, datasetInstances, ctxdatacopy, index, next)
                })
            } else {
                //console.log("Inside updatedatasets, copy of initial state exists already")
                updateHistory(ctx, datasetInstances, ctxdatacopy, index, next)
            }
        })
    }
}

function updateHistory(ctx, datasetInstances, ctxdatacopy, index, next) {
    var Dataset = app.models.Dataset
    Dataset.findById(datasetInstances[index].pid, ctx.options, function (err, datasetInstance) {
        // drop any history , e.g. from outside or from previous loop
        delete ctx.data.history
        // ignore packedsize and size updates for history.
        // TODO: this ignores any update which contains these fields among other chanegs
        if (!ctx.data.size && !ctx.data.packedSize) {
            // the following triggers a before save hook . endless recursion must be prevented there
            // console.log("Calling create with ctx.data:", JSON.stringify(ctx.data, null, 3))
            datasetInstance.historyList.create(JSON.parse(JSON.stringify(ctxdatacopy)), function (err, instance) {
                if(err){
                    console.log("Saving auto history failed:",err)
                }
                console.log("+++++++ After adding infos to history for dataset ", datasetInstance.pid, JSON.stringify(ctx.data, null, 3))
                index--
                updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next)
            })
        } else {
            index--
            updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next)
        }
    })
}


// this should then update the history in all affected documents
exports.keepHistory = function (ctx, next) {
    // create new message
    var Dataset = app.models.Dataset

    // if (ctx.instance) {
    //     console.log("Keephistory: Instance is defined:", JSON.stringify(ctx.instance.pid, null, 3))
    // }
    // if (ctx.isNewInstance) {
    //     console.log("Keephistory: newInstance is defined")
    // }
    // if (ctx.options) {
    //     console.log("Keephistory: ctx.options is defined:")
    // }

    // 4 different cases: (ctx.where:single/multiple instances)*(ctx.data: update of data/replacement of data)
    if (ctx.where && ctx.data) {
        // console.log(" Multiinstance update, where condition:", JSON.stringify(ctx.where, null, 4))
        Dataset.find({
            where: ctx.where
        }, ctx.options, function (err, datasetInstances) {
            // console.log("++++++ Inside keephistory: Found datasets to be updated:", JSON.stringify(datasetInstances, null, 3))
            // solve asynch call inside for loop by recursion
            index = datasetInstances.length - 1
            ctxdatacopy = JSON.parse(JSON.stringify(ctx.data))
            updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next)
        })
    }

    // single dataset, update
    if (!ctx.where && ctx.data) {
        console.log(" ===== Warning: single dataset update case without where condition is currently not treated:", ctx.data)
    }

    // single dataset, update
    if (!ctx.where && !ctx.data) {
        // console.log("single datasets and no update - should only happen if new document is created or if embedded object is updated")
        return next()
    }
    // single dataset, update
    if (ctx.where && !ctx.data) {
        // console.log("multiple datasets and no update")
        return next()
    }
}

/* Utility function for Remote hooks (not operation hooks) */

// transform date strings in all fields with key dateKeys to updateTimesToUTC
// do nothing if input values are already UTC

exports.updateTimesToUTC = function (dateKeys, instance) {
    dateKeys.map(function (dateKey) {
        if (instance[dateKey]) {
            // console.log("Updating old ", dateKey, instance[dateKey])
            instance[dateKey] = moment.tz(instance[dateKey], moment.tz.guess()).format();
            // console.log("New time:", instance[dateKey])
        }
    });
}


// dito but for array of instances
exports.updateAllTimesToUTC = function (dateKeys, instances) {
    dateKeys.map(function (dateKey) {
        // console.log("Updating all time field %s to UTC for %s instances:", dateKey, instances.length)
        instances.map(function (instance) {
            if (instance[dateKey]) {
                // console.log("Updating old ",dateKey,instance[dateKey])
                instance[dateKey] = moment.tz(instance[dateKey], moment.tz.guess()).format()
                // console.log("New time:",instance[dateKey])
            }
        })
    });
}

// remove fields which are automatically generated
exports.dropAutoGeneratedFields = function (data, next) {
    if (data) {
        delete data.createdAt
        delete data.createdBy
        delete data.updatedAt
        delete data.updatedBy
        delete data.history
    }
    next()
}
