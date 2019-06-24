"use strict";

module.exports = function(Sharegroup) {
    Sharegroup.getGroups = function(user, options, cb) {
        Sharegroup.find(
            {
                where: {
                    members: {
                        elemMatch: {
                            instrument: user
                        }
                    }
                }
            },
            options,
            function(err, model) {
                cb(null, model);
            }
        );
    };
};
