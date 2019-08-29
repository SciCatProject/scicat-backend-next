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

    Proposal.fullquery = function(fields, limits, options, cb) {
        if (fields === undefined) {
            fields = {};
        }

        fields.userGroups = options.currentGroups;

        let queryFilter = {
            where: {
                and: []
            }
        };

        Object.keys(fields).forEach(key => {
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

        // If neither text search or groups are present, delete where filter
        // as mongo does not accept empty $and filters
        if (queryFilter.where.and.length === 0) {
            delete queryFilter.where;
        }

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
                    if (parts.length > 1) {
                        orders.push(parts[0] + " " + parts[1].toUpperCase());
                    } else {
                        orders.push(parts[0]);
                    }
                });
                queryFilter.order = orders;
            }
            if ("skip" in limits) {
                queryFilter.skip =
                    Number(limits.skip) < 1 ? 0 : Number(limits.skip);
            }
        }

        return Proposal.find(queryFilter);
    };
};
