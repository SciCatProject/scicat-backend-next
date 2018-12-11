'use strict';

var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');
var dsl = require('./dataset-lifecycle.json');
var ds = require('./dataset.json');
var dsr = require('./raw-dataset.json');
var dsd = require('./derived-dataset.json');
var own = require('./ownable.json');

module.exports = function(Dataset) {
    var app = require('../../server/server');
    // make sure that all times are UTC

    Dataset.validatesUniquenessOf('pid');

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

            
            // auto fill classification
            if (!ctx.instance.ownerGroup) {
                return next("No owner group defined");
            }
            var Policy = app.models.Policy;
            if (!ctx.instance.classification) {
                // classification undefined
                Policy.findOne({
                        where: {
                            ownerGroup: ctx.instance.ownerGroup
                        }
                    },
                    function(err, policyInstance) {
                        if (err) {
                            var msg = "Error when looking for Policy of pgroup " + ctx.instance.ownerGroup + " " + err;
                            console.log(msg);
                            return next(msg);
                        } else if (policyInstance) {
                            var classification = "";
                            switch (policyInstance.tapeRedundancy) {
                                case "low":
                                    classification = "IN=medium,AV=low,CO=low";
                                    break;
                                case "medium":
                                    classification = "IN=medium,AV=medium,CO=low";
                                    break;
                                case "high":
                                    classification = "IN=medium,AV=high,CO=low";
                                    break;
                                default:
                                    classification = "IN=medium,AV=low,CO=low";
                            }
                            ctx.instance.classification = classification;
                        } else {
                            // neither a policy or a classification exist
                            ctx.instance.classification = "IN=medium,AV=low,CO=low";
                            Policy.addDefault(ctx.instance.ownerGroup, ctx.instance.ownerEmail, "");
                        }
                    });
            } else {
                // create policy from classification
                var classification = ctx.instance.classification;
                var tapeRedundancy = "";
                if (classification.includes("AV=low")) {
                    tapeRedundancy = "low";
                } else if (classification.includes("AV=medium")) {
                    tapeRedundancy = "medium";
                } else if (classification.includes("AV=high")) {
                    tapeRedundancy = "high";
                }
                Policy.addDefault(ctx.instance.ownerGroup, ctx.instance.ownerEmail, tapeRedundancy);
            }
        }
        return next();
    });

    // clean up data connected to a dataset, e.g. if archiving failed
    // TODO obsolete this code, replaced by code in datasetLifecycle

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
                    archivable: true,
                    retrievable: false
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

    // add user Groups information of the logged in user to the fields object

    Dataset.beforeRemote('facet', function(ctx, userDetails, next) {
        utils.handleOwnerGroups(ctx, next);
    });

    Dataset.beforeRemote('fullfacet', function(ctx, userDetails, next) {
        utils.handleOwnerGroups(ctx, next);
    });

    Dataset.beforeRemote('fullquery', function(ctx, userDetails, next) {
        utils.handleOwnerGroups(ctx, next);
    });

    function searchExpression(key, value) {
        let type = "string"
        if (key in ds.properties) {
            type = ds.properties[key].type
        } else if (key in dsr.properties) {
            type = dsr.properties[key].type
        } else if (key in dsd.properties) {
            type = dsd.properties[key].type
        } else if (key in dsl.properties) {
            type = dsl.properties[key].type
        } else if (key in own.properties) {
            type = own.properties[key].type
        }
        if (key === "text") {
            return {
                $search: value,
                $language: "none"
            }
        } else if (type === "string") {
            if (value.constructor === Array) {
                if (value.length == 1) {
                    return value[0]
                } else {
                    return {
                        $in: value
                    }
                }
            } else {
                return value
            }
        } else if (type === "date") {
            return {
                $gte: new Date(value.begin),
                $lte: new Date(value.end)
            }
        } else if (type.constructor === Array) {
            return {
                $in: value
            }
        }
    }

    Dataset.fullfacet = function(fields, facets = [], cb) {
        // keep the full aggregation pipeline definition
        let pipeline = []
        let match = {}
        let facetMatch = {}
        // construct match conditions from fields value, excluding facet material
        // i.e. fields is essentially split into match and facetMatch conditions
        // Since a match condition on usergroups is alway prepended at the start
        // this effectively yields the intersection handling of the two sets (ownerGroup condition and userGroups)

        Object.keys(fields).map(function(key) {
            if (facets.indexOf(key) < 0) {
                if (key === "text") {
                    match["$or"] = [{
                        $text: searchExpression(key, fields[key])
                    }, {
                        sourceFolder: {
                            $regex: fields[key],
                            $options: 'i'
                        }
                    }]
                } else if (key === "userGroups") {
                    if (fields[key].length > 0)
                        match["ownerGroup"] = searchExpression(key, fields[key])
                } else {
                    match[key] = searchExpression(key, fields[key])
                }
            } else {
                facetMatch[key] = searchExpression(key, fields[key])
            }
        })
        if (match !== {}) {
            pipeline.push({
                $match: match
            })
        }
        // TODO add support for filter condition on joined collection
        // currently for facets not supported (detrimental performance impact)

        // append all facet pipelines
        let facetObject = {};
        facets.forEach(function(facet) {
            if (facet in ds.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(facet, ds.properties[facet].type, facetMatch);
            } else if (facet in dsr.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(facet, dsr.properties[facet].type, facetMatch);
            } else if (facet in dsd.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(facet, dsd.properties[facet].type, facetMatch);
            } else if (facet in own.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(facet, own.properties[facet].type, facetMatch);
            } else {
                console.log("Warning: Facet not part of any dataset model:", facet)
            }
        });
        // add pipeline to count all documents
        facetObject['all'] = [{
            $match: facetMatch
        }, {
            $count: 'totalSets'
        }]

        pipeline.push({
            $facet: facetObject,
        });
        // console.log("Resulting aggregate query:", JSON.stringify(pipeline, null, 4));
        Dataset.getDataSource().connector.connect(function(err, db) {
            var collection = db.collection('Dataset');
            var res = collection.aggregate(pipeline,
                function(err, cursor) {
                    cursor.toArray(function(err, res) {
                        if (err) {
                            console.log("Facet err handling:", err);
                        }
                        cb(err, res);
                    });
                });
        });
    };

    // returns filtered set of datasets. Options:
    // filter condition consists of
    //   - ownerGroup (automatically applie server side)
    //   - text search
    //   - list of fields which are treated as facets (name,type,value triple)
    // - paging of results
    // - merging DatasetLifecycle Fields for fields not contained in Dataset

    Dataset.fullquery = function(fields, limits, cb) {
        // keep the full aggregation pipeline definition
        let pipeline = []
        let match = {}
        let matchJoin = {}
        // construct match conditions from fields value, excluding facet material
        Object.keys(fields).map(function(key) {
            if (fields[key] && fields[key] !== 'null') {
                if (key === "text") {
                    match["$or"] = [{
                        $text: searchExpression(key, fields[key])
                    }, {
                        sourceFolder: {
                            $regex: fields[key],
                            $options: 'i'
                        }
                    }]
                } else if (key === "ownerGroup") {
                    // ownerGroup is handled in userGroups parts
                } else if (key === "userGroups") {
                    // merge with ownerGroup condition if existing
                    if ('ownerGroup' in fields) {
                        if (fields[key].length == 0) {
                            // if no userGroups defined take all ownerGroups
                            match["ownerGroup"] = searchExpression('ownerGroup', fields['ownerGroup'])
                        } else {
                            // otherwise create intersection of userGroups and ownerGroup
                            // this is needed here since no extra match step is done but all
                            // filter conditions are applied in one match step
                            const intersect = fields['ownerGroup'].filter(function(n) {
                                return fields['userGroups'].indexOf(n) !== -1;
                            });
                            match["ownerGroup"] = searchExpression('ownerGroup', intersect)
                        }
                    } else {
                        // only userGroups defined
                        if (fields[key].length > 0) {
                            match["ownerGroup"] = searchExpression('ownerGroup', fields['userGroups'])
                        }
                    }
                } else {
                    // check if field is in linked models
                    if (key in dsl.properties) {
                        matchJoin["datasetlifecycle." + key] = searchExpression(key, fields[key])
                    } else {
                        match[key] = searchExpression(key, fields[key])
                    }
                }
            }
        })
        if (match !== {}) {
            pipeline.push({
                $match: match
            })
        }

        // "include" DatasetLifecycle data
        // TODO: make include optional for cases where only dataset fields are requested
        pipeline.push({
            $lookup: {
                from: "DatasetLifecycle",
                localField: "_id",
                foreignField: "datasetId",
                as: "datasetlifecycle"
            }
        })
        pipeline.push({
            $unwind: {
                path: "$datasetlifecycle",
                preserveNullAndEmptyArrays: true
            }
        })

        if (Object.keys(matchJoin).length > 0) {
            pipeline.push({
                $match: matchJoin
            })

        }
        // final paging section ===========================================================
        if (limits) {
            if ("order" in limits) {
                // input format: "creationTime:desc,creationLocation:asc"
                const sortExpr = {}
                const sortFields = limits.order.split(',')
                sortFields.map(function(sortField) {
                    const parts = sortField.split(':')
                    const dir = (parts[1] == 'desc') ? -1 : 1
                    sortExpr[parts[0]] = dir
                })
                pipeline.push({
                    $sort: sortExpr
                    // e.g. { $sort : { creationLocation : -1, creationLoation: 1 } }
                })
            }

            if ("skip" in limits) {
                pipeline.push({
                    $skip: (Number(limits.skip) < 1) ? 0 : Number(limits.skip)
                })
            }
            if ("limit" in limits) {
                pipeline.push({
                    $limit: (Number(limits.limit) < 1) ? 1 : Number(limits.limit)
                })
            }
        }
        // console.log("Resulting aggregate query:", JSON.stringify(pipeline, null, 4));
        Dataset.getDataSource().connector.connect(function(err, db) {
            var collection = db.collection('Dataset');
            var res = collection.aggregate(pipeline,
                function(err, cursor) {
                    cursor.toArray(function(err, res) {
                        if (err) {
                            console.log("Facet err handling:", err);
                        }
                        // console.log("Query result:", res)
                        // rename _id to pid
                        res.map(ds => {
                            Object.defineProperty(ds, 'pid', Object.getOwnPropertyDescriptor(ds, '_id'));
                            delete ds['_id']
                        })
                        cb(err, res);
                    });
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

    Dataset.thumbnail = function( id, cb) {
        // console.log("get thumbnail");
        const base64string= Dataset.findById(id, options, function (err, da) {
            const attach = da.datasetattachments;
            let base64string ="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mP8v0DxPwMRgHFUIX0VAgD6BxuBmjKJqgAAAABJRU5ErkJggg==";
            if (attach === undefined) {
            } else {
                base64string = attach[0].thumbnail;
            }
            return base64string;
         });
        cb(null, base64string);
        return base64string; 
    }

    Dataset.remoteMethod("thumbnail", {
        accepts: [
            {
                arg: "id",
                type: "string",
                required: true
            }
        ],
        http: {path: "/:id/thumbnail", verb: "get"},
        returns: {type: "string", root: true}
    });



};
