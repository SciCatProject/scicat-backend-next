"use strict";

module.exports = function(Sharegroup) {
    Sharegroup.getGroups = function(user, options, cb) {
        Sharegroup.find(
            {
                where: {
                        members:  user
            }},
            options,
            function(err, model) {
                cb(null, model);
            }
        );
    };
};
