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
    return cb(groups);
  };
};
