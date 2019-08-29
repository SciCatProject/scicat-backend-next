"use strict";
const ds = require("./proposal.json");
const own = require("./ownable.json");
const utils = require("./utils");

module.exports = function(Proposal) {
    // put
    Proposal.beforeRemote("replaceOrCreate", function(ctx, instance, next) {
        // handle embedded datafile documents
        if ("MeasurementPeriodList" in ctx.args.data) {
            utils.updateAllTimesToUTC(
                ["start", "end"],
                ctx.args.data.MeasurementPeriodList
            );
        }
        next();
    });

    //patch
    Proposal.beforeRemote("patchOrCreate", function(ctx, instance, next) {
        if ("MeasurementPeriodList" in ctx.args.data) {
            utils.updateAllTimesToUTC(
                ["start", "end"],
                ctx.args.data.MeasurementPeriodList
            );
        }
        next();
    });

    //post
    Proposal.beforeRemote("create", function(ctx, unused, next) {
        if ("MeasurementPeriodList" in ctx.args.data) {
            utils.updateAllTimesToUTC(
                ["start", "end"],
                ctx.args.data.MeasurementPeriodList
            );
        }
        next();
    });

    Proposal.findByInstrumentAndDate = function(
        instrument,
        measureTime,
        options,
        cb
    ) {
        Proposal.findOne(
            {
                where: {
                    MeasurementPeriodList: {
                        elemMatch: {
                            instrument: instrument,
                            start: {
                                $lte: new Date(measureTime)
                            },
                            end: {
                                $gte: new Date(measureTime)
                            }
                        }
                    }
                }
            },
            options,
            function(err, model) {
                cb(null, model);
            }
        );
    };

    Proposal.isValid = function(instance, next) {
        const ds = new Proposal(instance);
        ds.isValid(function(valid) {
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

    function searchExpression(key, value) {
        let type = "string";
        if (key in ds.properties) {
            type = ds.properties[key].type;
        } else if (key in own.properties) {
            type = own.properties[key].type;
        }
        if (key === "text") {
            return {
                $search: value,
                $language: "none"
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

    Proposal.fullquery = function(fields, limits, options, cb) {
        // if (fields.text) {
        if (fields === undefined) {
            fields = {};
        }

        let queryFilter = {
            where: {
                and: []
            }
        };

        fields.userGroups = options.currentGroups;

        Object.keys(fields).map(key => {
            if (fields[key] && fields[key] !== "null") {
                if (key === "text") {
                    let textPatterns = [];
                    const pattern = new RegExp(".*" + fields.text + ".*", "i");
                    const proposalProperties = Object.keys(ds.properties);
                    proposalProperties.forEach(property => {
                        if (ds.properties[property].type === "string") {
                            textPatterns.push({
                                [property]: { like: pattern }
                            });
                        }
                    });
                    queryFilter.where.and.push({ or: textPatterns });
                } else if (key === "userGroups") {
                    if (fields[key].indexOf("globalaccess") < 0) {
                        let groups = [];
                        groups.push({
                            accessGroups: { inq: options.currentGroups }
                        });
                        options.currentGroups.forEach(group => {
                            groups.push({ ownerGroup: group });
                        });
                        queryFilter.where.and.push({ or: groups });
                    }
                }
            }
        });

        if (limits) {
            if ("limit" in limits) {
                queryFilter.limit =
                    Number(limits.limit) < 1 ? 0 : Number(limits.limit);
            }
            if ("order" in limits) {
                const sortFields = limits.order.split(",");
                let orders = [];
                sortFields.forEach(field => {
                    const parts = field.split(" ");
                    orders.push(parts[0] + " " + parts[1].toUpperCase());
                });
                queryFilter.order = orders;
            }
            if ("skip" in limits) {
                queryFilter.skip =
                    Number(limits.skip) < 1 ? 0 : Number(limits.skip);
            }
        }

        console.log("queryFilter", queryFilter);
        queryFilter.where.and.forEach(item => {
            console.log(
                `queryfilter.where.and[${queryFilter.where.and.indexOf(item)}]`,
                item
            );
        });
        return Proposal.find(queryFilter);
        // } else {
        //     // keep the full aggregation pipeline definition
        //     let pipeline = [];
        //     if (fields === undefined) {
        //         fields = {};
        //     }
        //     // console.log("++++++++++++ fullquery: after filling fields with usergroup:",fields)
        //     // let matchJoin = {}
        //     // construct match conditions from fields value
        //     Object.keys(fields).map(function(key) {
        //         if (fields[key] && fields[key] !== "null") {
        //             if (key === "text") {
        //                 // unshift because text must be at start of array
        //                 pipeline.unshift({
        //                     $match: {
        //                         $or: [
        //                             {
        //                                 $text: searchExpression(
        //                                     key,
        //                                     fields[key]
        //                                 )
        //                             }
        //                         ]
        //                     }
        //                 });
        //             }
        //             // mode is not a field in dataset, just an object for containing a match clause
        //             else if (key === "mode") {
        //                 pipeline.push({
        //                     $match: fields[key]
        //                 });
        //             } else if (key === "userGroups") {
        //                 if (fields["userGroups"].indexOf("globalaccess") < 0) {
        //                     pipeline.push({
        //                         $match: {
        //                             $or: [
        //                                 {
        //                                     ownerGroup: searchExpression(
        //                                         "ownerGroup",
        //                                         fields["userGroups"]
        //                                     )
        //                                 },
        //                                 {
        //                                     accessGroups: searchExpression(
        //                                         "accessGroups",
        //                                         fields["userGroups"]
        //                                     )
        //                                 }
        //                             ]
        //                         }
        //                     });
        //                 }
        //             } else {
        //                 let match = {};
        //                 match[key] = searchExpression(key, fields[key]);
        //                 pipeline.push({
        //                     $match: match
        //                 });
        //             }
        //         }
        //     });

        //     // }
        //     // final paging section ===========================================================
        //     if (limits) {
        //         if ("order" in limits) {
        //             // input format: "creationTime:desc,creationLocation:asc"
        //             const sortExpr = {};
        //             const sortFields = limits.order.split(",");
        //             sortFields.map(function(sortField) {
        //                 const parts = sortField.split(":");
        //                 const dir = parts[1] == "desc" ? -1 : 1;
        //                 sortExpr[parts[0]] = dir;
        //             });
        //             pipeline.push({
        //                 $sort: sortExpr
        //                 // e.g. { $sort : { creationLocation : -1, creationLoation: 1 } }
        //             });
        //         }

        //         if ("skip" in limits) {
        //             pipeline.push({
        //                 $skip: Number(limits.skip) < 1 ? 0 : Number(limits.skip)
        //             });
        //         }
        //         if ("limit" in limits) {
        //             pipeline.push({
        //                 $limit:
        //                     Number(limits.limit) < 1 ? 1 : Number(limits.limit)
        //             });
        //         }
        //     }
        //     //console.log("Resulting aggregate query in fullquery method:", JSON.stringify(pipeline, null, 3));
        //     Proposal.getDataSource().connector.connect(function(err, db) {
        //         const collection = db.collection("Proposal");
        //         collection.aggregate(pipeline, function(err, cursor) {
        //             cursor.toArray(function(err, res) {
        //                 if (err) {
        //                     console.log("Facet err handling:", err);
        //                 }
        //                 // rename _id to pid
        //                 res.map(ds => {
        //                     Object.defineProperty(
        //                         ds,
        //                         "proposalId",
        //                         Object.getOwnPropertyDescriptor(ds, "_id")
        //                     );
        //                     delete ds["_id"];
        //                 });
        //                 cb(err, res);
        //             });
        //         });
        //     });
        // }
    };
};
