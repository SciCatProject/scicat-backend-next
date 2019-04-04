"use strict";

module.exports = function(Logbook) {
    Logbook.findByName = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook);
        });
    };
};
