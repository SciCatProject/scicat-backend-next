"use strict";

module.exports = function(Logbook) {
    Logbook.getUserMessages = function(name, cb) {
        Logbook.find({ where: { name: name } }, function(err, userMessages) {
            cb(null, userMessages);
        });
    };
};
