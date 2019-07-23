"use strict";

module.exports = function(ShareGroup) {
    ShareGroup.getGroups = function(user, options, cb) {
        console.log("getgroups");
        ShareGroup.find(
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
