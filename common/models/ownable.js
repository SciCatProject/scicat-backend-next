"use strict";
const util = require("util");
module.exports = function (Ownable) {

  Ownable.observe("access", function (ctx, next) {
    // console.log("+++++ Access ctx.options:",ctx.options)
    if (
      ctx.Model.modelName === "Dataset" &&
            ctx.query.where &&
            ctx.query.where.isPublished
    ) {
      next();
    } else {
      const groups = ctx.options && ctx.options.currentGroups;
      // append group based conditions unless functional accounts with global access role
      if (groups && groups.length > 0 && groups.indexOf("globalaccess") < 0) {
        var groupCondition = {
          or: [{
            ownerGroup: {
              inq: groups
            }
          },
          {
            accessGroups: {
              inq: groups
            }
          }
          ]
        };
        if (!ctx.query.where) {
          ctx.query.where = groupCondition;
        } else {
          ctx.query.where = {
            and: [ctx.query.where, groupCondition]
          };
        }
      }
      next();
    }
  });

};
