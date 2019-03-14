"use strict";

module.exports = function(Logbook) {
    Logbook.findAllUserMessages = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook.userMessages);
        });
    };

    Logbook.findAllBotMessages = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook.botMessages);
        });
    };

    Logbook.findAllImages = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook.images);
        });
    };
};
