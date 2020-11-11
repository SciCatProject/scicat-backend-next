'use strict';
var utils = require('./utils');

// TODO still needed ? Pick out just one model, the one currently queried
// Or replace all type tests by deriving type from field value rather than from model definitions
// When using model definitions one always needs to go down down the whole inheritance chain

var dsl = require("./dataset-lifecycle.json");
var ds = require("./dataset.json");
var dsr = require("./raw-dataset.json");
var dsd = require("./derived-dataset.json");
var own = require("./ownable.json");

function camelCaseToDash(str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
}

module.exports = function (MongoQueryableModel) {

    // to get access to other models
    var app = require("../../server/server");

    // TODO these tests are dataset dependent, replace by something generic

    function searchExpression(key, value) {
        let type = "string";
        if (key in ds.properties) {
            type = ds.properties[key].type;
        } else if (key in dsr.properties) {
            type = dsr.properties[key].type;
        } else if (key in dsd.properties) {
            type = dsd.properties[key].type;
        } else if (key in dsl.properties) {
            type = dsl.properties[key].type;
        } else if (key in own.properties) {
            type = own.properties[key].type;
        }
        if (key === "text") {
            return {
                $search: value
            };
        } else if (type === "string") {
            if (value.constructor === Array) {
                if (value.length == 1) {
                    return value[0];
                } else {
                    return {
                        $in: value
                    };
                }
            } else {
                return value;
            }
        } else if (type === "date") {
            return {
                $gte: new Date(value.begin),
                $lte: new Date(value.end)
            };
        } else if (type === "boolean") {
            return {
                $eq: value
            };
        } else if (type.constructor === Array) {
            return {
                $in: value
            };
        }
    }

    function setFields(fields, options) {
        if (fields === undefined) {
            return {};
        }
        if (fields.metadataKey) {
            const {
                metadataKey,
                ...theRest
            } = fields;
            fields = {
                ...theRest
            };
        }
        if (!('isPublished' in fields) || !fields.isPublished) {
            const {
                isPublished,
                ...theRest
            } = fields;
            return {
                ...theRest,
                userGroups: options.currentGroups
            };
        }
        return fields;
    }

    MongoQueryableModel.fullfacet = function (fields, facets = [], options, cb) {
        // keep the full aggregation pipeline definition
        let pipeline = [];
        let facetMatch = {};
        fields = setFields(fields, options);
        // console.log("++++++++++++ after filling fileds with usergroup:",fields)
        // construct match conditions from fields value, excluding facet material
        // i.e. fields is essentially split into match and facetMatch conditions
        // Since a match condition on usergroups is always prepended at the start
        // this effectively yields the intersection handling of the two sets (ownerGroup condition and userGroups)

        // first construct match conditions being applied before facet calculations

        // the fields array contains all the conditions which must be fulfilled

        // however all such conditions, which are treated as facets will be applied
        // only later within the different facet pipelines,
        // and therefore will be removed from the initial match conditions

        // the following fields must be part of the match clause
        // usergroup: limit to what the logged in user is allowed to see
        // text: fulltext search
        // mode: additional query expression

        Object.keys(fields).map(function (key) {
            // split in facet and non-facet conditions
            if (facets.indexOf(key) < 0) {
                if (key === "text") {
                    // unshift because text must be at start of array
                    if (typeof fields[key] === "string") {
                        pipeline.unshift({
                            $match: {
                                $or: [{
                                    $text: searchExpression(
                                        key,
                                        fields[key]
                                    )
                                }, ]
                            }
                        });
                    }
                }
                // mode is not a field , just an object for containing a match clause
                else if (key === "mode") {
                    pipeline.push({
                        $match: fields[key]
                    });
                } else if (key === "userGroups") {
                    // no group conditions if global access role
                    if (fields["userGroups"].indexOf("globalaccess") < 0) {
                        pipeline.push({
                            $match: {
                                $or: [{
                                        ownerGroup: searchExpression(
                                            "ownerGroup",
                                            fields["userGroups"]
                                        )
                                    },
                                    {
                                        accessGroups: searchExpression(
                                            "accessGroups",
                                            fields["userGroups"]
                                        )
                                    }
                                ]
                            }
                        });
                    }
                } else if (key === "scientific") {
                    fields[key].forEach(condition => {
                        const match = generateScientificExpression(condition);
                        pipeline.push({
                            $match: match
                        });
                    });
                } else {
                    let match = {};
                    match[key] = searchExpression(key, fields[key]);
                    pipeline.push({
                        $match: match
                    });
                }
            } else {
                facetMatch[key] = searchExpression(key, fields[key]);
            }
        });

        // TODO these tests are dataset dependent, replace by something generic
        // append all facet pipelines
        let facetObject = {};
        facets.forEach(function (facet) {
            if (facet in ds.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(
                    facet,
                    ds.properties[facet].type,
                    facetMatch
                );
            } else if (facet in dsr.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(
                    facet,
                    dsr.properties[facet].type,
                    facetMatch
                );
            } else if (facet in dsd.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(
                    facet,
                    dsd.properties[facet].type,
                    facetMatch
                );
            } else if (facet in own.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(
                    facet,
                    own.properties[facet].type,
                    facetMatch
                );
            } else if (facet.startsWith("datasetlifecycle.")) {
                let lifcycleFacet = facet.split(".")[1];
                if (lifcycleFacet in dsl.properties) {
                    facetObject[lifcycleFacet] = utils.createNewFacetPipeline(
                        lifcycleFacet,
                        dsl.properties[lifcycleFacet].type,
                        facetMatch
                    );
                }
            } else {
                console.log(
                    "Warning: Facet not part of any model:",
                    facet
                );
            }
        });
        // add pipeline to count all documents
        facetObject["all"] = [{
                $match: facetMatch
            },
            {
                $count: "totalSets"
            }
        ];

        pipeline.push({
            $facet: facetObject
        });
        console.log("Resulting aggregate query in fullfacet method:", JSON.stringify(pipeline, null, 3));
        app.models[options.modelName].getDataSource().connector.connect(function (err, db) {
            // fetch calling parent collection
            // TODO this should be derived from model definition field options.mongodb.collection in future
            let modelName = options.modelName
            if (modelName == "RawDataset" || modelName == "DerivedDataset") {
                modelName = "Dataset"
            }
            var collection = db.collection(modelName);
            var res = collection.aggregate(pipeline, {
                allowDiskUse: true
            }, function (err, cursor) {
                cursor.toArray(function (err, res) {
                    if (err) {
                        console.log("Fullfacet err handling:", err);
                    }
                    cb(err, res);
                });
            });
        });
    };

    /* returns filtered set of datasets. Options:
       filter condition consists of
       - ownerGroup (automatically applied on server side)
       - text search
       - mode search: arbitrary additional condition (e.g. for and/or combinations, adding scientific metadata)
       - list of fields which are treated as filter condition (name,type,value triple)
     - paging of results
    */
    MongoQueryableModel.fullquery = function (fields, limits, options, cb) {
        // keep the full aggregation pipeline definition
        let pipeline = [];
        fields = setFields(fields, options);
        // TODO this should be derived from model definition field options.mongodb.collection in future
        let modelName = options.modelName
        if (modelName == "RawDataset" || modelName == "DerivedDataset") {
            modelName = "Dataset"
        }
        // find out which field is the id field, turn name to hyphenated string first
        let idField = "id"
        try {
            const modelDefinition = require("./" + camelCaseToDash(modelName) + ".json");
            for (const key in modelDefinition.properties) {
                if (modelDefinition.properties[key].id) {
                    idField = key
                    break
                }
            }
        } catch (err) {
            console.log("Could not fetch file:", "./" + camelCaseToDash(modelName) + ".json", " - standard id field assumed")
        } // console.log("Inside fullquery:options",options)
        // console.log("++++++++++++ fullquery: after filling fields with usergroup:",fields)
        // let matchJoin = {}
        // construct match conditions from fields value
        Object.keys(fields).map(function (key) {
            if (fields[key] && fields[key] !== "null") {
                if (key === "text") {
                    // unshift because text must be at start of array
                    if (typeof fields[key] === "string") {
                        pipeline.unshift({
                            $match: {
                                $or: [{
                                    $text: searchExpression(
                                        key,
                                        String(fields[key])
                                    )
                                }]
                            }
                        });
                    }
                }
                // mode is not a field , just an object for containing a match clause
                else if (key === "mode") {
                    pipeline.push({
                        $match: fields[key]
                    });
                } else if (key === "userGroups") {
                    if (fields["userGroups"].indexOf("globalaccess") < 0) {
                        pipeline.push({
                            $match: {
                                $or: [{
                                        ownerGroup: searchExpression(
                                            "ownerGroup",
                                            fields["userGroups"]
                                        )
                                    },
                                    {
                                        accessGroups: searchExpression(
                                            "accessGroups",
                                            fields["userGroups"]
                                        )
                                    }
                                ]
                            }
                        });
                    }
                } else if (key === "scientific") {
                    fields[key].forEach(condition => {
                        const match = generateScientificExpression(condition);
                        pipeline.push({
                            $match: match
                        });
                    });
                } else {
                    if (typeof fields[key].constructor !== Object) {
                        let match = {};
                        match[key] = searchExpression(key, fields[key]);
                        pipeline.push({
                            $match: match
                        });
                    }
                }
            }
        });

        // }
        // final paging section ===========================================================
        if (limits) {
            if ("order" in limits) {
                // input format: "creationTime:desc,creationLocation:asc"
                const sortExpr = {};
                const sortFields = limits.order.split(",");
                sortFields.map(function (sortField) {
                    const parts = sortField.split(":");
                    const dir = parts[1] == "desc" ? -1 : 1;
                    // map id field
                    let fieldName = parts[0]
                    if (fieldName == idField) {
                        fieldName = "_id"
                    }
                    sortExpr[fieldName] = dir;
                });
                pipeline.push({
                    $sort: sortExpr
                    // e.g. { $sort : { creationLocation : -1, creationLoation: 1 } }
                });
            }

            if ("skip" in limits) {
                pipeline.push({
                    $skip: Number(limits.skip) < 1 ? 0 : Number(limits.skip)
                });
            }
            if ("limit" in limits) {
                pipeline.push({
                    $limit: Number(limits.limit) < 1 ? 1 : Number(limits.limit)
                });
            }
        }
        console.log("Resulting aggregate query in fullquery method:", JSON.stringify(pipeline, null, 3));
        app.models[options.modelName].getDataSource().connector.connect(function (err, db) {
            // fetch calling parent collection
            var collection = db.collection(modelName);
            var res = collection.aggregate(pipeline, {
                allowDiskUse: true
            }, function (err, cursor) {
                cursor.toArray(function (err, res) {
                    if (err) {
                        console.log("Fullquery err handling:", err);
                    }
                    // rename _id to id Field name
                    res.map(ds => {
                        Object.defineProperty(
                            ds,
                            idField,
                            Object.getOwnPropertyDescriptor(ds, "_id")
                        );
                        delete ds["_id"];
                    });

                    cb(err, res);
                });
            });
        });
    };

    // to get access to other models
    var app = require("../../server/server");

    // TODO check if this works in generic fashion:
    MongoQueryableModel.isValid = function (instance, next) {
        var ds = new MongoQueryableModel(instance);
        ds.isValid(function (valid) {
            if (!valid) {
                next(null, {
                    errors: ds.errors,
                    valid: false
                });
            } else {
                next(null, {
                    valid: true
                });
            }
        });
    };

    MongoQueryableModel.observe("before save", function (ctx, next) {
        // make sure that only ownerGroup members have modify rights
        if (ctx.data && ctx.options && !ctx.options.validate) {
            let groups = []
            if (ctx.options && ctx.options.currentGroups) {
                // ("Your groups are:", ctx.options.currentGroups)
                groups = ctx.options.currentGroups
            };
            // however allow history updates
            if (!ctx.data['history'] && ctx.currentInstance) {
                // modify operations are forbidden unless you are member of ownerGroup or have globalaccess role  
                if ((groups.indexOf("globalaccess") < 0) && !ctx.isNewInstance && groups.indexOf(ctx.currentInstance.ownerGroup) < 0) {
                    var e = new Error();
                    e.statusCode = 403;
                    e.message = 'You must be in ownerGroup ' + ctx.currentInstance.ownerGroup + " or have global role to modify document, your groups are:" + groups
                    return next(e);
                }
            }
        }
        // add some admin infos automatically
        if (ctx.instance) {
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function (
                    err,
                    instance
                ) {
                    if (instance) {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = instance.username;
                        } else {
                            ctx.instance.createdBy = instance.username;
                        }
                    } else {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = "anonymous";
                        } else {
                            ctx.instance.createdBy = "anonymous";
                        }
                    }
                    return next();
                });
            } else {
                if (ctx.instance.createdBy) {
                    ctx.instance.updatedBy = "anonymous";
                } else {
                    ctx.instance.createdBy = "anonymous";
                }
                return next();
            }
        } else if (ctx.data) {
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function (
                    err,
                    instance
                ) {
                    if (instance) {
                        ctx.data.updatedBy = instance.username;
                    } else {
                        ctx.data.updatedBy = "anonymous";
                    }
                    return next();
                });
            } else {
                ctx.data.updatedBy = "anonymous";
                return next();
            }
        }
    });
};
