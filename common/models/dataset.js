'use strict';

var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');

module.exports = function (Dataset) {
    var app = require('../../server/server');
    // make sure that all times are UTC

    // put
    Dataset.beforeRemote('replaceOrCreate', function (ctx, instance, next) {
        utils.updateTimesToUTC(['creationTime'], ctx.args.data);
        next();
    });

    // patch
    Dataset.beforeRemote('patchOrCreate', function (ctx, instance, next) {
        utils.updateTimesToUTC(['creationTime'], ctx.args.data);
        next();
    });

    // post
    Dataset.beforeRemote('create', function (ctx, unused, next) {
        utils.updateTimesToUTC(['creationTime'], ctx.args.data);
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

    Dataset.reset = function (id, options, next) {
        // console.log('resetting ' + id);
        var Datablock = app.models.Datablock;
        var DatasetLifecycle = app.models.DatasetLifecycle;
        DatasetLifecycle.findById(id, options, function (err, l) {
            if (err) {
                next(err);
            } else {
                l.updateAttributes({
                    archiveStatusMessage: 'datasetCreated',
                    retrieveStatusMessage: '',
                }, options);
                // console.log('Dataset Lifecycle reset');
                Datablock.destroyAll({
                    datasetId: id,
                }, options, function (err, b) {
                    if (err) {
                        next(err);
                    } else {
                        // console.log('Deleted blocks', b);
                        Dataset.findById(id, options, function (err, instance) {
                            if (err) {
                                next(err);
                            } else {
                                instance.updateAttributes({
                                    packedSize: 0,
                                }, options);
                                next();
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
        ctx.args.fields.type = undefined;
        utils.handleOwnerGroups(ctx, userDetails, next);
    });

    Dataset.facet = function (fields, facets = [], cb) {
        var findFilter = [];
        var match = {};
        var type;
        if (fields) {
            if ('type' in fields)
                type = fields['type'];
            var keys = Object.keys(fields);
            for (var i = 0; i < keys.length; i++) {
                var modelType = Dataset.getPropertyType(keys[i]);
                var value = fields[keys[i]];
                if (modelType !== undefined && value !== undefined && value !== 'null') {
                    switch (modelType) {
                        case 'String':
                            if (Array.isArray(value) && value.length > 0) { // TODO security flaw if somehow an empty array is received (remote hook should prevent this)
                                match[keys[i]] = {
                                    '$in': value,
                                };
                            } else if (typeof (value) === 'string' && value) {
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
                                            // TODO change from null in Catanie to undefined
                                            cb(new Error('Dates are an invalid format'), null);
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
        let facetObject = {};
        var baseFacets = [{
            name: 'creationTime',
            type: 'date'
        }, {
            name: 'ownerGroup',
            type: 'text'
        }, {
            name: 'creationLocation',
            type: 'text'
        }];
        baseFacets.map(function (f) {
            facetObject[f.name] = utils.createFacetPipeline(f.name, f.type, f.preConditions, match);
        });
        facets.map(function (f) {
            facetObject[f.name] = utils.createFacetPipeline(f.name, f.type, f.preConditions, match);
        });
        findFilter.push({
            $facet: facetObject,
        });
        Dataset.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection('Dataset');
            var res = collection.aggregate(findFilter,
                function (err, res) {
                    if (err)
                        console.log(err);
                    res[0]['type'] = type; // TODO check array length is 1 (since it is only aggregate and return just that)
                    cb(err, res);
                });
        });
    };

    Dataset.isValid = function (dataset, next) {
        var ds = new Dataset(dataset);
        ds.isValid(function (valid) {
            if (!valid) {
                next(null, {
                    'errors': ds.errors,
                    'valid': false,
                });
            } else {
                next(null, {
                    'valid': true,
                });
            }
        });
    };
};
