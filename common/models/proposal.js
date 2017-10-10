'use strict';
var config = require('../../server/config.local');

module.exports = function(Proposal) {

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
