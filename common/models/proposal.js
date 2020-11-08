"use strict";
const ds = require("./proposal.json");
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

    Proposal.beforeRemote("findById", function(ctx, unused, next) {
        const accessToken = ctx.args.options.accessToken;
        if (!accessToken) {
            ctx.args.filter.fields = { title: true };
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

    // TODO check if isValid should be moved somewhere else
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

 };
