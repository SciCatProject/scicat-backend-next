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
            ctx.instance.type='base';
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

    /**
     * Inherited models will not call this before access, so it must be replicated
     */
    Dataset.beforeRemote('facet', function (ctx, userDetails, next) {
        // const token = ctx.options && ctx.options.accessToken;
        //     const userId = token && token.userId;
        const userId = ctx.req.accessToken && ctx.req.accessToken.userId;
        if (userId === null) {
            userId = ctx.req.args.accessToken;
        }
        // const user = userId ? 'user#' + userId : '<anonymous>';
        var UserIdentity = app.models.UserIdentity;
        var User = app.models.User;
        if (!userId) {
            var e = new Error('Cannot find access token');
            e.statusCode = 401;
            next(e);
        }
        // console.log(ctx.req);
        // TODO add check for functional accounts and ignore below if true
        User.findById(userId, function (err, user) {
            if (err) {
                next(err);
            } else if (user['username'].indexOf('.') === -1) {
                ctx.args.ownerGroup = [];
                next()
            } else {
                let groups = ctx.args.ownerGroup ? ctx.args.ownerGroup : [];
                UserIdentity.findOne({
                    where: {
                        userId: userId
                    }
                }, function (err, instance) {
                    console.log("UserIdentity Instance:", instance)
                    if (instance && instance.profile) {
                        var foundGroups = instance.profile.accessGroups
                        // check if a normal user or an internal ROLE
                        if (typeof foundGroups === 'undefined') {
                            ctx.args.ownerGroup = [];
                            next()
                        }
                        var a = new Set(groups);
                        var b = new Set(foundGroups);
                        var intersection = new Set([...a].filter(x => b.has(x)));
                        var subgroups = Array.from(intersection);
                        if (subgroups.length === 0) {
                            var e = new Error('User has no group access');
                            e.statusCode = 401;
                            next(e);
                        } else {
                            ctx.args.ownerGroup = subgroups;
                            next();
                        }
                    } else {
                        // According to: https://loopback.io/doc/en/lb3/Operation-hooks.html
                        var e = new Error('Access Not Allowed');
                        e.statusCode = 401;
                        next(e);
                    }
                })
            }
            console.log(ctx)

        });
    });

    Dataset.facet = function (fields, cb) {
        var findFilter = [];
        var match = {};
        if (fields) {
            var keys = Object.keys(fields);
            // var RawDataset = app.models.RawDataset;
            match['type'] = fields['type'] || 'raw';
            for (var i = 0; i < keys.length; i++) {
                var modelType = Dataset.getPropertyType(keys[i]);
                var value = fields[keys[i]];
                if (modelType !== undefined && value !== 'undefined' && value !== 'null') {
                    switch (modelType) {
                        case 'String':
                            if (Array.isArray(value)) {
                                match[keys[i]] = {
                                    '$in': value
                                };
                            } else {
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
        findFilter.push({
            $facet: {
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
            }
        });
        Dataset.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection("Dataset");
            var res = collection.aggregate(findFilter,
                function (err, res) {
                    cb(err, res);
                });
        });
    };
};
