"use strict";

const config = require("../../server/config.local");
const ds = require("./sample.json");
const own = require("./ownable.json");
const logger = require("../logger");

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

    Sample.afterRemote("find", function (ctx, modelInstance, next) {
        const accessToken = ctx.args.options.accessToken;
        if (!accessToken) {
            if (ctx.result) {
                let answer;
                if (Array.isArray(modelInstance)) {
                    answer = [];
                    ctx.result.forEach(function (result) {
                        if (result["isPublished"] === true) {
                            answer.push(result);
                        }
                    });
                } else {
                    if (ctx.result["isPublished"] === true) {
                        answer = ctx.result;
                    }
                }
                ctx.result = answer;
            }
        }
        next();
    });


    Sample.fullquery = function(fields, limits, options, cb) {
        // keep the full aggregation pipeline definition
        let pipeline = [];
        if (fields === undefined) {
            fields = {};
        }
        // console.log("++++++++++++ fullquery: after filling fields with usergroup:",fields)
        // let matchJoin = {}
        // construct match conditions from fields value
        Object.keys(fields).map(function(key) {
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
                sortFields.map(function(sortField) {
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
            const collection = db.collection("Sample");
            const res = collection.aggregate(pipeline, {allowDiskUse: true}, function(err, cursor) {
                cursor.toArray(function(err, res) {
                    if (err) {
                        console.log("Facet err handling:", err);
                    }
                    // rename _id to pid
                    res.map(ds => {
                        Object.defineProperty(
                            ds,
                            "sampleId",
                            Object.getOwnPropertyDescriptor(ds, "_id")
                        );
                        delete ds["_id"];
                    });
                    cb(err, res);
                });
                }
            );
            });
    };

    /**
     * Get a list of sample characteristic keys
     * @param {object} fields Define the filter conditions by specifying the name of values of fields requested. There is also support for a `text` search to look for strings anywhere in the sample.
     * @param {object} limits Define further query parameters like skip, limit, order
     * @param {object} options
     * @param {Function(Error, array)} callback
     */

    Sample.metadataKeys = async function (fields, limits, options) {
        try {
            const blacklist = [new RegExp(".*_date")];
            const returnLimit = config.metadataKeysReturnLimit;
            const { metadataKey } = fields;

            // ensure that no more than MAXLIMIT samples are read for metadata key extraction
            let MAXLIMIT;
            if (config.metadataDatasetsReturnLimit) {
                MAXLIMIT = config.metadataDatasetsReturnLimit;

                let lm = {};

                if (limits) {
                    lm = JSON.parse(JSON.stringify(limits));
                }

                if (!lm.limit) {
                    lm.limit = MAXLIMIT;
                }

                if (lm.limit && lm.limit > MAXLIMIT) {
                    lm.limit = MAXLIMIT;
                }

                limits = lm;

                logger.logInfo("Fetching metadataKeys", {
                    fields,
                    limits,
                    options,
                    blacklist: blacklist.map((item) => item.toString()),
                    returnLimit,
                });

                let samples;
                try {
                    samples = await new Promise((resolve, reject) => {
                        Sample.fullquery(
                            fields,
                            limits,
                            options,
                            (err, res) => {
                                resolve(res);
                            }
                        );
                    });
                } catch (err) {
                    logger.logError(err.message, {
                        location: "Sample.metadataKeys.samples",
                        fields,
                        limits,
                        options,
                    });
                }

                if (samples.length > 0) {
                    logger.logInfo("Found samples", { count: samples.length });
                } else {
                    logger.logInfo("No samples found", { samples });
                }

                const metadata = samples.map((sample) =>
                    sample.sampleCharacteristics
                        ? Object.keys(sample.sampleCharacteristics)
                        : []
                );

                logger.logInfo("Raw metadata array", {
                    count: metadata.length,
                });

                // Flatten array, ensure uniqueness of keys and filter out
                // blacklisted keys
                const metadataKeys = [].concat
                    .apply([], metadata)
                    .reduce((accumulator, currentValue) => {
                        if (accumulator.indexOf(currentValue) === -1) {
                            accumulator.push(currentValue);
                        }
                        return accumulator;
                    }, [])
                    .filter(
                        (key) => !blacklist.some((regex) => regex.test(key))
                    );

                logger.logInfo("Curated metadataKeys", {
                    count: metadataKeys.length,
                });

                if (metadataKey && metadataKey.length > 0) {
                    return metadataKeys
                        .filter((key) =>
                            key
                                .toLowerCase()
                                .includes(metadataKey.toLowerCase())
                        )
                        .slice(0, returnLimit);
                }

                return metadataKeys.slice(0, returnLimit);
            }
        } catch (err) {
            logger.logError(err.message, { location: "Sample.metadataKeys" });
        }
    };
};
