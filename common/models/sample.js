'use strict';
var ds = require("./sample.json");
var own = require("./ownable.json");
module.exports = function(Sample) {
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

    Sample.fullquery = function (fields, limits, options, cb) {
        // keep the full aggregation pipeline definition
        let pipeline = [];
        if (fields === undefined) {
            fields = {};
        }
        // console.log("++++++++++++ fullquery: after filling fields with usergroup:",fields)
        // let matchJoin = {}
        // construct match conditions from fields value
        Object.keys(fields).map(function (key) {
            if (fields[key] && fields[key] !== "null") {
                if (key === "text") {
                    // unshift because text must be at start of array
                    pipeline.unshift({
                        $match: {
                            $or: [
                                {
                                    $text: searchExpression(key, fields[key])
                                }
                            ]
                        }
                    });
                }
                // mode is not a field in dataset, just an object for containing a match clause
                else if (key === "mode") {
                    pipeline.push({
                        $match: fields[key]
                    });
                } else if (key === "userGroups") {
                    if (fields["userGroups"].indexOf("globalaccess") < 0) {
                        pipeline.push({
                            $match: {
                                $or: [
                                    {
                                        ownerGroup: searchExpression("ownerGroup", fields["userGroups"])
                                    },
                                    {
                                        accessGroups: searchExpression("accessGroups", fields["userGroups"])
                                    }
                                ]
                            }
                        });
                    }
                } else {
                    let match = {};
                    match[key] = searchExpression(key, fields[key]);
                    pipeline.push({
                        $match: match
                    });
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
                    sortExpr[parts[0]] = dir;
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
         //console.log("Resulting aggregate query in fullquery method:", JSON.stringify(pipeline, null, 3));
         Sample.getDataSource().connector.connect(function(err, db) {
            var collection = db.collection("Sample");
            var res = collection.aggregate(pipeline, function(err, cursor) {
                cursor.toArray(function(err, res) {
                    if (err) {
                        console.log("Facet err handling:", err);
                    }
                    // rename _id to pid
                    res.map(ds => {
                        Object.defineProperty(ds, "sampleId", Object.getOwnPropertyDescriptor(ds, "_id"));
                        delete ds["_id"];
                    });
                    cb(err, res);
                });
            });
        });
    };
    
};
