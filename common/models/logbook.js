"use strict";

const MatrixRestClient = require("./matrix-rest-client");
const client = new MatrixRestClient();

module.exports = function(Logbook) {
    Logbook.findByName = function(name, cb) {
        Logbook.findOne({ where: { name: name } }, function(err, logbook) {
            cb(null, logbook);
        });
    };

    Logbook.syncMembers = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            client.findRoomMembers(logbook.name).then(syncedMembers => {
                let allMembers = [];
                let member;
                syncedMembers.forEach(syncedMember => {
                    member = {
                        userId: syncedMember.user_id,
                        displayName: syncedMember.content.displayname
                    };
                    allMembers.push(member);
                });
                logbook.updateAttributes({ members: allMembers }, function(
                    err,
                    instance
                ) {
                    cb();
                });
            });
        });
    };

    Logbook.findAllMembers = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            cb(null, logbook.members);
        });
    };

    Logbook.syncMessages = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            client.findMessagesByRoom(logbook.name).then(syncedMessages => {
                logbook.updateAttributes(
                    { userMessages: syncedMessages },
                    function(err, instance) {
                        cb();
                    }
                );
            });
        });
    };

    Logbook.addUserMessage = function(id, newMessage, cb) {
        Logbook.findById(id, function(err, logbook) {
            let allUserMessages = logbook.userMessages;
            allUserMessages.push(newMessage);
            logbook.updateAttributes(
                { userMessages: allUserMessages },
                function(err, instance) {
                    cb();
                }
            );
        });
    };

    Logbook.findAllUserMessages = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            cb(null, logbook.userMessages);
        });
    };

    Logbook.addBotMessage = function(id, newMessage, cb) {
        Logbook.findById(id, function(err, logbook) {
            let allBotMessages = logbook.botMessages;
            allBotMessages.push(newMessage);
            logbook.updateAttributes({ botMessages: allBotMessages }, function(
                err,
                instance
            ) {
                cb();
            });
        });
    };

    Logbook.findAllBotMessages = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            cb(null, logbook.botMessages);
        });
    };

    Logbook.addImage = function(id, newImage, cb) {
        Logbook.findById(id, function(err, logbook) {
            let allImages = logbook.images;
            allImages.push(newImage);
            logbook.updateAttributes({ images: allImages }, function(
                err,
                instance
            ) {
                cb();
            });
        });
    };

    Logbook.findAllImages = function(id, cb) {
        Logbook.findById(id, function(err, logbook) {
            cb(null, logbook.images);
        });
    };
};
