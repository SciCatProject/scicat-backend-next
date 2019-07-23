"use strict";

module.exports = function(ShareGroup) {
    ShareGroup.getGroups = function(id,  cb) {
        console.log("getgroups");
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
        return (id);
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
        returns: { arg: "doi", type: "string" }
    });
};
