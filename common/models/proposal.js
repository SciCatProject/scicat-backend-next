'use strict';
var config = require('../../server/config.local');
var utils = require('./utils');

module.exports = function(Proposal) {

    // put
    Proposal.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        // handle embedded datafile documents
        utils.updateAllTimesToUTC(["start","end"], ctx.args.data.MeasurementPeriodList)
        next();
    });

    //patch
    Proposal.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        utils.updateAllTimesToUTC(["start","end"], ctx.args.data.MeasurementPeriodList)
        next();
    });

    //post
    Proposal.beforeRemote('create', function(ctx, unused, next) {
        utils.updateAllTimesToUTC(["start","end"], ctx.args.data.MeasurementPeriodList)
        next();
    });

    Proposal.findByInstrumentAndDate = function(instrument, measureTime, options, cb) {
        Proposal.findOne({
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
        )
    };

};
