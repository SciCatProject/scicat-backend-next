'use strict';

var config = require('../../server/config.local');
var p = require('../../package.json');
var utils = require('./utils');
var dsl = require('./dataset-lifecycle.json');
var ds = require('./dataset.json');
var dsr = require('./raw-dataset.json');
var dsd = require('./derived-dataset.json');
var own = require('./ownable.json');

module.exports = function (Dataset) {
    var app = require('../../server/server');
    // make sure that all times are UTC

    Dataset.validatesUniquenessOf('pid');

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
                    function (err, policyInstance) {
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
                    archivable: true,
                    retrievable: false
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

    // add user Groups information of the logged in user to the fields object

    Dataset.beforeRemote('facet', function (ctx, userDetails, next) {
        utils.handleOwnerGroups(ctx, next);
    });

    Dataset.beforeRemote('fullfacet', function (ctx, userDetails, next) {
        utils.handleOwnerGroups(ctx, next);
    });

    Dataset.beforeRemote('fullquery', function (ctx, userDetails, next) {
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

    Dataset.fullfacet = function (fields, facets = [], cb) {
        // keep the full aggregation pipeline definition
        let pipeline = []
        let match = {}
        let facetMatch = {}
        // construct match conditions from fields value, excluding facet material
        // i.e. fields is essentially split into match and facetMatch conditions
        // Since a match condition on usergroups is alway prepended at the start
        // this effectively yields the intersection handling of the two sets (ownerGroup condition and userGroups)

        Object.keys(fields).map(function (key) {
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
        facets.forEach(function (facet) {
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
        Dataset.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection('Dataset');
            var res = collection.aggregate(pipeline,
                function (err, cursor) {
                    cursor.toArray(function (err, res) {
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

    Dataset.fullquery = function (fields, limits, cb) {
        // keep the full aggregation pipeline definition
        let pipeline = []
        let match = {}
        let matchJoin = {}
        // construct match conditions from fields value, excluding facet material
        Object.keys(fields).map(function (key) {
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
                            const intersect = fields['ownerGroup'].filter(function (n) {
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
                sortFields.map(function (sortField) {
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
        Dataset.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection('Dataset');
            var res = collection.aggregate(pipeline,
                function (err, cursor) {
                    cursor.toArray(function (err, res) {
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

    Dataset.thumbnail = async function (id) {
        var DatasetAttachment = app.models.DatasetAttachment;
        const filter = { where: { datasetId: id } };
        return DatasetAttachment.findOne(filter).then(instance => {

            const base64string_example = "data:image/png;base64,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";
            let base64string2 = ""
            if (instance && instance.__data) {
                if (instance.__data.thumbnail === undefined) {
                } else {
                    base64string2 = instance.__data.thumbnail;
                }
            } else {
                base64string2 = base64string_example;
            }
            return base64string2;
        });
    }

    Dataset.remoteMethod("thumbnail", {
        accepts: [
            {
                arg: "id",
                type: "string",
                required: true
            }
        ],
        http: { path: "/:id/thumbnail", verb: "get" },
        returns: { type: "string", root: true }
    });



};
