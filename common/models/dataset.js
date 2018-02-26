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

    // make sure that all times are UTC

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
            ctx.instance.type = 'base';
        }
        next();
    });

    // clean up data connected to a dataset, e.g. if archiving failed
    // TODO change API to a put/patch or even delete command ? Pass ID in URL


    Dataset.reset = function(id, options, next) {
        // console.log('resetting ' + id);
        var Datablock = app.models.Datablock;
        var DatasetLifecycle = app.models.DatasetLifecycle;
        DatasetLifecycle.findById(id, options, function(err, l) {
            if (err) {
                next(err);
            } else {
                l.updateAttributes({
                    archiveStatusMessage: 'datasetCreated',
                    retrieveStatusMessage: ''
                });
                // console.log('Dataset Lifecycle reset');
                Datablock.destroyAll({
                    datasetId: id
                }, options, function(err, b) {
                    if (err) {
                        next(err);
                    } else {
                        // console.log('Deleted blocks', b);
                        Dataset.findById(id, options, function(err, instance) {
                            if (err) {
                                next(err);
                            } else {
                                instance.updateAttributes({
                                    packedSize: 0
                                })
                                next()
                            }
                        });
                    }
                });
            }
        });
    };

    /**
     * Inherited models will not call this before access, so it must be replicated
     */
    Dataset.beforeRemote('facet', function (ctx, userDetails, next) {
        if (!ctx.args.fields)
            ctx.args.fields = {};
        ctx.args.fields.type = undefined
        utils.handleOwnerGroups(ctx, userDetails, next);
    });

    Dataset.facet = function (fields, facets, cb) {
        var findFilter = [];
        var match = {};
        var type = undefined;
        if (fields) {
            if ('type' in fields)
                type = fields['type'];
            var keys = Object.keys(fields);
            // var RawDataset = app.models.RawDataset;
            for (var i = 0; i < keys.length; i++) {
                var modelType = Dataset.getPropertyType(keys[i]);
                var value = fields[keys[i]];
                if (modelType !== undefined && value !== 'undefined' && value !== 'null') {
                    switch (modelType) {
                        case 'String':
                            if (Array.isArray(value) && value.length > 0) { //TODO  security flaw if somehow an empty array is received (remote hook should prevent this)
                                match[keys[i]] = {
                                    '$in': value
                                };
                            } else if (typeof(value) === 'string' && value) {
                                match[keys[i]] = value;
                            }
                            break;
                        case 'Date':
                            var reqType = typeof (value);
                            switch (reqType) {
                                case 'string':
                                    match[keys[i]] = new Date(value);
                                    break;
                                case 'object':
                                    if (Object.keys(value).length === 2) {
                                        if (value['start'] && value['start'] !== 'null' && value['end'] && value['end'] !== 'null') {
                                            match[keys[i]] = {
                                                '$gte': new Date(value['start']),
                                                '$lte': new Date(value['end']),
                                            };
                                        } else {
                                            //TODO change from null in Catanie to undefined
                                            // cb(new Error('Dates are an invalid format'), null);
                                        }
                                    } else if (Object.keys(value).length !== 2) {
                                        cb(new Error('Only one date specified, need a range'), null);
                                    }
                                    break;
                            }
                            break;
                    }
                } else if (keys[i] === 'text' && value !== 'null') {
                    match['$text'] = value;
                    // TODO check in config map for extra strings, i.e. creationTime start and end
                } else {
                    // ignore
                }
            }
        }
        if (Object.keys(match).length !== 0) {
            findFilter.push({
                $match: match
            });
        }
        let facetObject = {
            // The `years` property will be the output of the 'count by year'
            // pipeline
            creationTime: [{
                    $group: {
                        _id: {
                            year: {
                                $year: "$creationTime"
                            },
                            month: {
                                $month: "$creationTime"
                            },
                            day: {
                                $dayOfMonth: "$creationTime"
                            },
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                // Sort by year descending
                {
                    $sort: {
                        count: -1,
                        _id: -1
                    }
                }
            ],
            ownerGroup: [
                // Count the number of groups
                {
                    $group: {
                        _id: "$ownerGroup",
                        count: {
                            $sum: 1
                        }
                    }
                },
                // Sort by name ascending
                {
                    $sort: {
                        count: -1,
                        _id: 1
                    }
                }
            ],
            creationLocation: [{
                    $group: {
                        _id: "$creationLocation",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1,
                        _id: 1
                    }
                }
            ]
        };
        // Ensure that the count value is numerical (the SDK seems to parse this request as string)
        Object.keys(facets).map(function(k) {
            facets[k][1]['$sort']['count'] = Number(facets[k][1]['$sort']['count']);
            facets[k][1]['$sort']['_id'] = Number(facets[k][1]['$sort']['_id']);
        });
        
        facetObject = Object.assign({}, facetObject, facets);
        findFilter.push({
            $facet: facetObject
        });
        Dataset.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection("Dataset");
            var res = collection.aggregate(findFilter,
                function (err, res) {
                    if(err)
                        console.log(err);
                    // console.log(res);
                    res[0]['type'] = type; //TODO check array length is 1 (since it is only aggregate and return just that)
                    cb(err, res);
                });
        });
    };
};
