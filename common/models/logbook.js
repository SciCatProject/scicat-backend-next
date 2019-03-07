"use strict";

var utils = require("./utils");
var lb = require("./logbook.json");

module.exports = function(Logbook) {
    // PUT
    Logbook.beforeRemote("replaceOrCreate", function(ctx, instance, next) {
        next();
    });

    // PATCH
    Logbook.beforeRemote("patchOrCreate", function(ctx, instance, next) {
        next();
    });

    // POST
    Logbook.beforeRemote("create", function(ctx, unused, next) {
        next();
    });

    Logbook.createRoom = function(
        visibility,
        room_alias_name,
        name,
        topic,
        creation_content
    ) {};

    Logbook.findAllRooms = function() {};

    Logbook.login = function(type, identifier, password) {};

    Logbook.sync = function() {};
};
