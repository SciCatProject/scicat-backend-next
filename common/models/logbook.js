"use strict";

module.exports = function(Logbook) {
    Logbook.findByName = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook);
        });
    };

    Logbook.addUserMessage = function(id, newMessage, cb) {
        Logbook.findById(id, function(err, l) {
            console.log("Update Logbook: " + JSON.stringify(l));
            console.log("Message added: " + JSON.stringify(newMessage));
            let allUserMessages = l.userMessages;
            allUserMessages.push(newMessage);
            l.updateAttributes({ userMessages: [allUserMessages] }, function(
                err,
                instance
            ) {
                console.log("newMessage: " + JSON.stringify(newMessage));
                console.log("instance: " + instance);
                cb();
            });
        });
    };

    Logbook.findAllUserMessages = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            cb(null, logbook.userMessages);
        });
    };

    Logbook.addBotMessage = function(newMessage, cb) {
        Logbook.updateAttribute(botMessages, newMessage, function(
            err,
            message
        ) {
            cb(null, message);
        });
    };

    Logbook.findAllBotMessages = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            cb(null, logbook.botMessages);
        });
    };

    Logbook.addImage = function(newImage, cb) {
        Logbook.updateAttribute(images, newImage, function(err, image) {
            cb(null, image);
        });
    };

    Logbook.findAllImages = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            cb(null, logbook.images);
        });
    };
};
