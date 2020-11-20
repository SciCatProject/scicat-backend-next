'use strict';
var utils = require('./utils');
const logger = require("../logger");

module.exports = function (MongoQueryableModel) {

    // to get access to other models
    var app = require("../../server/server");

    function loopbackTypeOf(modelName, key) {
        // extract type. For arrays this returns undefined. See 
        // https://stackoverflow.com/questions/52916635/how-do-you-access-loopback-model-property-types-model-definition-properties-ty
        let property = app.models[modelName].definition.properties[key]
        // Also check derived Datasets
        // TODO Make code generic by deriving the test from the identical collection value in the model
        if (!property) {
            property = app.models["RawDataset"].definition.properties[key]
        }
        if (!property) {
            property = app.models["DerivedDataset"].definition.properties[key]
        }
        if (!property) {
            console.log("Property undefined:")
        }
        const type = typeof property.type === 'string' ?
            property.type :
            property.type.modelName || property.type.name;
        return type
    }

    function searchExpression(modelName, fieldName, value) {
        // console.log("searchExpression modelName, fieldName, value", modelName, fieldName, value)
        let key = fieldName
        if (app.models[modelName].getIdName) {
            let idField = app.models[modelName].getIdName()
            if (fieldName == idField) {
                key = "_id"
            }
        }

        if (key === "text") {
            return {
                $search: value
            };
        }
        const type = loopbackTypeOf(modelName, fieldName)
        //console.debug("Derived Type:", type

        // for now treat nested keys as strings, not yet tested
        // may has to be treated outside of this function as is done
        // currently for datasetLifecycle
        if (key.indexOf('.') > 0) {
            console.debug("Nested key: modelName,key,value:", modelName, key, value)
            return value
        } else if (type === "String") {
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
        } else if (type === "Date") {
            return {
                $gte: new Date(value.begin),
                $lte: new Date(value.end)
            };
        } else if (type === "Boolean") {
            return {
                $eq: value
            };
        } else if (Array.isArray(value)) {
            return {
                $in: value
            };
        } else {
            console.log("Unknown Type: modelName,key,value:", modelName, key, value)
            return value
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
        let modelName = options.modelName;
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
                                        modelName,
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
                    // substitute potential id field in fields
                    let idField = app.models[modelName].getIdName();
                    let currentExpression = JSON.parse(JSON.stringify(fields[key]))
                    if (idField in currentExpression) {
                        currentExpression["_id"] = currentExpression[idField]
                        delete currentExpression[idField]
                    }
                    pipeline.push({
                        $match: currentExpression
                    });
                } else if (key === "userGroups") {
                    // no group conditions if global access role
                    if (fields["userGroups"].indexOf("globalaccess") < 0) {
                        pipeline.push({
                            $match: {
                                $or: [{
                                        ownerGroup: searchExpression(
                                            modelName,
                                            "ownerGroup",
                                            fields["userGroups"]
                                        )
                                    },
                                    {
                                        accessGroups: searchExpression(
                                            modelName,
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
                    match[key] = searchExpression(modelName, key, fields[key]);
                    pipeline.push({
                        $match: match
                    });
                }
            } else {
                facetMatch[key] = searchExpression(modelName, key, fields[key]);
            }
        });

        // append all facet pipelines
        let facetObject = {};
        facets.forEach(function (facet) {
            // console.log("Facet.modelName,properties:", facet, modelName, app.models[modelName].definition.properties)
            // for inheritance Dataset test parent models as well
            // TODO make this generic by checking for same collection setting in the models 
            if (modelName == "Dataset") {
                if (facet in app.models["RawDataset"].definition.properties) {
                    facetObject[facet] = utils.createNewFacetPipeline(
                        facet,
                        loopbackTypeOf("RawDataset", facet),
                        facetMatch
                    );
                    return
                } else if (facet in app.models["DerivedDataset"].definition.properties) {
                    facetObject[facet] = utils.createNewFacetPipeline(
                        facet,
                        loopbackTypeOf("DerivedDataset", facet),
                        facetMatch
                    );
                    return
                }
            } else if (facet in app.models[modelName].definition.properties) {
                facetObject[facet] = utils.createNewFacetPipeline(
                    facet,
                    loopbackTypeOf(modelName, facet),
                    facetMatch
                );
                return
            }
            if (facet.startsWith("datasetlifecycle.")) {
                let lifcycleFacet = facet.split(".")[1];
                facetObject[lifcycleFacet] = utils.createNewFacetPipeline(
                    lifcycleFacet,
                    loopbackTypeOf('DatasetLifecycle', lifcycleFacet),
                    facetMatch
                );
                return
            } else {
                console.log(
                    "Warning: Facet not part of any model:",
                    facet
                );
                return
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
        // console.log("Resulting aggregate query in fullfacet method:", JSON.stringify(pipeline, null, 3));

        app.models[options.modelName].getDataSource().connector.connect(function (err, db) {
            let mongoModel = modelName
            if (app.models[modelName].definition.settings.mongodb &&
                app.models[modelName].definition.settings.mongodb.collection) {
                mongoModel = app.models[modelName].definition.settings.mongodb.collection
            }
            var collection = db.collection(mongoModel);
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



    /* returns filtered set of someCollections. Options:
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
        // console.log("Inside fullquery:options",options)
        // console.log("++++++++++++ fullquery: after filling fields with usergroup:",fields)
        // let matchJoin = {}
        // construct match conditions from fields value

        // TOOD avoid code duplication of large parts with fullfacet
        Object.keys(fields).map(function (key) {
            if (fields[key] && fields[key] !== "null") {
                if (key === "text") {
                    // unshift because text must be at start of array
                    if (typeof fields[key] === "string") {
                        pipeline.unshift({
                            $match: {
                                $or: [{
                                    $text: searchExpression(
                                        modelName,
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
                    // substitute potential id field in fields
                    let idField = app.models[modelName].getIdName();
                    let currentExpression = JSON.parse(JSON.stringify(fields[key]))
                    if (idField in currentExpression) {
                        currentExpression["_id"] = currentExpression[idField]
                        delete currentExpression[idField]
                    }
                    pipeline.push({
                        $match: currentExpression
                    });
                } else if (key === "userGroups") {
                    if (fields["userGroups"].indexOf("globalaccess") < 0) {
                        pipeline.push({
                            $match: {
                                $or: [{
                                        ownerGroup: searchExpression(
                                            modelName,
                                            "ownerGroup",
                                            fields["userGroups"]
                                        )
                                    },
                                    {
                                        accessGroups: searchExpression(
                                            modelName,
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
                } else if (key.startsWith("datasetlifecycle.")) {
                    let lifecycleKey = key.split(".")[1];
                    let match = {};
                    match[key] = searchExpression("DatasetLifecycle", lifecycleKey, fields[key]);
                    // ("Datasetlifecycle Match expression:", match)
                    pipeline.push({
                        $match: match
                    });
                } else {
                    if (typeof fields[key].constructor !== Object) {
                        let match = {};
                        //console.log("Key, properties:", key, app.models[options.modelName].definition.properties)
                        match[key] = searchExpression(modelName, key, fields[key]);
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
                    let idField = app.models[modelName].getIdName()
                    // console.log("Derived idField:",idField)
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
        // console.log("Resulting aggregate query in fullquery method:", JSON.stringify(pipeline, null, 3));
        app.models[options.modelName].getDataSource().connector.connect(function (err, db) {
            // fetch calling parent collection
            let mongoModel = modelName
            if (app.models[modelName].definition.settings.mongodb &&
                app.models[modelName].definition.settings.mongodb.collection) {
                mongoModel = app.models[modelName].definition.settings.mongodb.collection
            }
            var collection = db.collection(mongoModel);
            var res = collection.aggregate(pipeline, {
                allowDiskUse: true
            }, function (err, cursor) {
                cursor.toArray(function (err, res) {
                    if (err) {
                        console.log("Fullquery err handling:", err);
                    }
                    // rename _id to id Field name
                    let idField = app.models[modelName].getIdName()
                    // console.log("Derived idField:", idField)
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

    MongoQueryableModel.beforeRemote("prototype.patchAttributes", function (
        ctx,
        unused,
        next
    ) {
        if ("scientificMetadata" in ctx.args.data) {
            const {
                scientificMetadata
            } = ctx.args.data;
            Object.keys(scientificMetadata).forEach(key => {
                if (scientificMetadata[key].type === "measurement") {
                    const {
                        value,
                        unit
                    } = scientificMetadata[key];
                    const {
                        valueSI,
                        unitSI
                    } = convertToSI(value, unit);
                    scientificMetadata[key] = {
                        ...scientificMetadata[key],
                        valueSI,
                        unitSI
                    };
                }
            });
        }
        next();
    });


    MongoQueryableModel.afterRemote("fullquery", function (ctx, someCollections, next) {
        if (ctx.args.fields.scientific) {
            const {
                scientific
            } = ctx.args.fields;
            someCollections.forEach(({
                scientificMetadata
            }) => {
                scientific.forEach(({
                    lhs,
                    unit
                }) => {
                    if (
                        lhs in scientificMetadata &&
                        scientificMetadata[lhs].type === "measurement" &&
                        scientificMetadata[lhs].unit !== unit
                    ) {
                        const converted = math
                            .unit(
                                scientificMetadata[lhs].value,
                                scientificMetadata[lhs].unit
                            )
                            .to(unit);
                        const formatted = math
                            .format(converted, {
                                precision: 3
                            })
                            .toString()
                            .split(" ");
                        scientificMetadata[lhs].value = Number(formatted[0]);
                        scientificMetadata[lhs].unit = formatted[1];
                    }
                });
            });
        }
        next();
    });

    function convertToSI(value, unit) {
        const quantity = math
            .unit(value, unit)
            .toSI()
            .toString();
        const convertedValue = quantity.substring(0, quantity.indexOf(" "));
        const convertedUnit = quantity.substring(quantity.indexOf(" ") + 1);
        return {
            valueSI: Number(convertedValue),
            unitSI: convertedUnit
        };
    }

    function generateScientificExpression({
        lhs,
        relation,
        rhs,
        unit
    }) {
        let match = {
            $and: []
        };
        const matchKeyGeneric = `scientificMetadata.${lhs}.value`;
        const matchKeyMeasurement = `scientificMetadata.${lhs}.valueSI`;
        const matchUnit = `scientificMetadata.${lhs}.unitSI`;
        switch (relation) {
            case "EQUAL_TO_STRING": {
                match.$and.push({
                    [matchKeyGeneric]: {
                        $eq: rhs
                    }
                });
                break;
            }
            case "EQUAL_TO_NUMERIC": {
                if (unit.length > 0) {
                    const {
                        valueSI,
                        unitSI
                    } = convertToSI(rhs, unit);
                    match.$and.push({
                        [matchKeyMeasurement]: {
                            $eq: valueSI
                        }
                    });
                    match.$and.push({
                        [matchUnit]: {
                            $eq: unitSI
                        }
                    });
                } else {
                    match.$and.push({
                        [matchKeyGeneric]: {
                            $eq: rhs
                        }
                    });
                }
                break;
            }
            case "GREATER_THAN": {
                if (unit.length > 0) {
                    const {
                        valueSI,
                        unitSI
                    } = convertToSI(rhs, unit);
                    match.$and.push({
                        [matchKeyMeasurement]: {
                            $gt: valueSI
                        }
                    });
                    match.$and.push({
                        [matchUnit]: {
                            $eq: unitSI
                        }
                    });
                } else {
                    match.$and.push({
                        [matchKeyGeneric]: {
                            $gt: rhs
                        }
                    });
                }
                break;
            }
            case "LESS_THAN": {
                if (unit.length > 0) {
                    const {
                        valueSI,
                        unitSI
                    } = convertToSI(rhs, unit);
                    match.$and.push({
                        [matchKeyMeasurement]: {
                            $lt: valueSI
                        }
                    });
                    match.$and.push({
                        [matchUnit]: {
                            $eq: unitSI
                        }
                    });
                } else {
                    match.$and.push({
                        [matchKeyGeneric]: {
                            $lt: rhs
                        }
                    });
                }
                break;
            }
        }
        return match;
    }


};
