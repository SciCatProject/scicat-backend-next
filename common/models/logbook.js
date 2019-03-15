"use strict";

module.exports = function(Logbook) {
    Logbook.addUserMessage = function() {

    }

    Logbook.findAllUserMessages = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook.userMessages);
        });
    };

    Logbook.addBotMessage = function() {}

    Logbook.findAllBotMessages = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook.botMessages);
        });
    };

    Logbook.addImage = function() {}

    Logbook.findAllImages = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook.images);
        });
    };
};
