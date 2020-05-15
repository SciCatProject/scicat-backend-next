'use strict';
var utils = require('./utils');
var own = require("./ownable.json");

module.exports = function (Origdatablock) {
    var app = require('../../server/server');

    // put
    Origdatablock.beforeRemote('replaceOrCreate', function (ctx, instance, next) {
        // handle embedded datafile documents
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

    //patch
    Origdatablock.beforeRemote('patchOrCreate', function (ctx, instance, next) {
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

    //post
    Origdatablock.beforeRemote('create', function (ctx, unused, next) {
        utils.updateAllTimesToUTC(["time"], ctx.args.data.dataFileList)
        next();
    });

    Origdatablock.validatesPresenceOf('datasetId');

    Origdatablock.observe('before save', (ctx, next) => {
        // add ownerGroup field from linked Datasets
        utils.addOwnerGroup(ctx, next)
    })


    // transfer size info to dataset
    Origdatablock.observe('after save', (ctx, next) => {
        var OrigDatablock = app.models.OrigDatablock
        // not yet ready utils.createArchiveJob(app.models.UserIdentity, app.models.Policy, app.models.Job, ctx)
        utils.transferSizeToDataset(OrigDatablock, 'size', ctx, next)
    })

    Origdatablock.isValid = function (instance, next) {
        var ds = new Origdatablock(instance)
        ds.isValid(function (valid) {
            if (!valid) {
                next(null, {
                    'errors': ds.errors,
                    'valid': false
                })
            } else {
                next(null, {
                    'valid': true
                })
            }
        });
    }

    function searchExpression(key, value) {
        let type = "string";
        if (key in own.properties) {
            type = own.properties[key].type;
        }
        if (type === "string") {
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

    /* returns filtered set of file objects. Options:
       filter condition consists of fields
       - ownerGroup (automatically applied on server side)
       - datasetId (optional)
       - filenameExp regexp expression (optional)
     - paging of results
    */

    Origdatablock.findFilesByName = function (fields, limits, options, cb) {
        let pipeline = [];
        fields = setFields(fields, options);
        // construct match conditions from fields value
        // ensure that fileNameExp test comes first because $text must come first in pipeline
        let f1 = fields["filenameExp"]
        let f2 = fields["datasetId"]
        // skip $text index if datasetId filter condition is applied. This gives 
        // the full substring fuctionality and the performance penalty is probably bearable 
        // under these conditions
        if (f2) {
            pipeline.push({
                $match: {
                    "datasetId": f2
                }
            });
            if (f1) {
                // for simplicity always do a case insensitive search
                // use combined $text and filepath search for best performance
                // also in case of arbitrary substring search
                pipeline.push({
                    $match: {
                        "dataFileList.path": {
                            $regex: f1,
                            $options: 'i'
                        }
                    }
                });
            }
        } else {
            // if only filename conditions are applied then add text index to speedup search
            // because you may need to search through a whole databse in the worst case
            // The disdvanatge is that one can only search for tokenized words in filenames
            // separated by blanks, minus etc (but underscore is unfortunately no word separator)
            if (f1) {
                // for simplicity always do a case insensitive search
                // use combined $text and filepath search for best performance
                // also in case of arbitrary substring search
                pipeline.push({
                    $match: {
                        $text: {
                            $search: f1
                        },
                        "dataFileList.path": {
                            $regex: f1,
                            $options: 'i'
                        }
                    }
                });
            }
        }

        let f3 = fields["userGroups"]
        if (f3) {
            if (f3.indexOf("globalaccess") < 0) {
                pipeline.push({
                    $match: {
                        $or: [{
                                ownerGroup: searchExpression(
                                    "ownerGroup",
                                    f3
                                )
                            },
                            {
                                accessGroups: searchExpression(
                                    "accessGroups",
                                    f3
                                )
                            }
                        ]
                    }
                });
            }
        }

        // reformat answer

        pipeline.push({
            "$project": {
                "dataFileList": 1,
                "datasetId": 1,
                "_id": 0
            }
        })
        pipeline.push({
            "$unwind": "$dataFileList"
        })
        if ('filenameExp' in fields && fields['filenameExp'] !== "") {
            pipeline.push({
                "$match": {
                    "dataFileList.path": {
                        "$regex": fields["filenameExp"]
                    }
                }
            })
        }

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
            } else {
                pipeline.push({
                    $limit: 100
                });
            }
        } else {
            pipeline.push({
                $limit: 100
            });
        }

        // group results by dataset
        pipeline.push({
            "$group": {
                "_id": "$datasetId",
                "dataFileList": {
                    "$push": "$dataFileList"
                }
            }
        })
        // console.log("Resulting aggregate query in findFilesByName method:", JSON.stringify(pipeline, null, 3));

        Origdatablock.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection("OrigDatablock");
            var res = collection.aggregate(pipeline, {
                allowDiskUse: true
            }, function (err, cursor) {
                cursor.toArray(function (err, res) {
                    if (err) {
                        console.log("findFilesByName err handling:", err);
                    }
                    // TODO restructure result
                    res.map(ds => {
                        Object.defineProperty(
                            ds,
                            "pid",
                            Object.getOwnPropertyDescriptor(ds, "_id")
                        );
                        delete ds["_id"];
                    });
                    // console.log("Results:",JSON.stringify(res, null, 3));
                    cb(err, res);
                });
            });
        });
    };

}
