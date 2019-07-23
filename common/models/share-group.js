"use strict";

module.exports = function(ShareGroup) {
    ShareGroup.getGroups = function(id, cb) {
        console.log("getgroups");
        console.log("id",id);
        /*
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
        */
        let groups = { groups: ["JKFDFJ", "JFKDFD"] };
        return groups;
    };

    ShareGroup.remoteMethod("getGroups", {
        accepts: [
            {
                arg: "id",
                type: "string",
                required: true
            }
        ],
        http: { path: "/:id/register", verb: "post" },
        returns: { arg: "groups", type: "Object" }
    });
};
