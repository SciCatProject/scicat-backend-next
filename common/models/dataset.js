'use strict';

var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');

module.exports = function(Dataset) {
    var app = require('../../server/server');
    // make sure that all times are UTC

    // put
    Dataset.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(['creationTime'], ctx.args.data);
        next();
    });

    // patch
    Dataset.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        utils.updateTimesToUTC(['creationTime'], ctx.args.data);
        next();
    });

    // post
    Dataset.beforeRemote('create', function(ctx, unused, next) {
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
                    retrieveStatusMessage: '',
                }, options);
                // console.log('Dataset Lifecycle reset');
                Datablock.destroyAll({
                    datasetId: id,
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
    Dataset.beforeRemote('facet', function(ctx, userDetails, next) {
        if (!ctx.args.fields)
            ctx.args.fields = {};
        utils.handleOwnerGroups(ctx, next);
    });

    Dataset.facet = function(fields, facets = [], cb) {
        var findFilter = [];
        const userGroups = fields.userGroups;
        delete fields.userGroups;
        var match = fields || {};
        var type = match['type'] || undefined;
        Object.keys(match).forEach(function(k) {
            if (match[k] === undefined || (Array.isArray(match[k]) && match[k].length === 0)) {
                delete match[k];
            }
            if (k === 'creationTime') {
                const d = match[k];
                match[k]['$gte'] = new Date(d['$gte']);
                match[k]['$lte'] = new Date(d['$lte']);
            }
        });
        let facetObject = {};
        // TODO avoid need for base facets
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
        baseFacets.map(function(f) {
            facetObject[f.name] = utils.createFacetPipeline(f.name, f.type, f.preConditions, match);
        });
        facets.map(function(f) {
            facetObject[f.name] = utils.createFacetPipeline(f.name, f.type, f.preConditions, match);
        });

        if (userGroups.length>0) {
            findFilter.push({
                $match: {
                    ownerGroup: {
                        $in: userGroups
                    }
                }
            });
        }
        findFilter.push({
            $facet: facetObject,
        });
        // console.log("Resulting aggregate query:", JSON.stringify(findFilter, null, 4));
        Dataset.getDataSource().connector.connect(function(err, db) {
            var collection = db.collection('Dataset');
            var res = collection.aggregate(findFilter,
                function(err, res) {
                    if (err)
                        console.log("Facet err handling:", err);
                    // console.log(JSON.stringify(res, null, 4));
                    if (type !== undefined)
                        res.push({
                            'type': type
                        }); // TODO check array length is 1 (since it is only aggregate and return just that)
                    // console.log("Aggregate call: Return err,result:",err,JSON.stringify(res, null, 4))
                    cb(err, res);
                });
        });
    };

    Dataset.isValid = function(dataset, next) {
        var ds = new Dataset(dataset);
        ds.isValid(function(valid) {
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
