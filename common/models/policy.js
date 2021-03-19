"use strict";

//model extension file

var config = require("../../server/config.local");
var p = require("../../package.json");
var utils = require("./utils");
var own = require("./ownable.json");
var ds = require("./dataset");

module.exports = function (Policy) {
  var app = require("../../server/server");

  // check that the user has authority to change a record
  // input ownerGroup of the record being changed
  Policy.validatePermission = function (ownerGroup, userEmail, cb) {
    Policy.findOne({
      where: {
        ownerGroup
      }
    }, function (err, policy) {
      if (!policy || err) {
        err = new Error("User not authorised for action based on policy");
        err.statusCode = "404";
        return cb(err);
      }
      if (policy.manager.includes(userEmail)) {
        return cb();
      }
      return cb(new Error("User not authorised for action based on policy"));
    });
    return cb;
  };

  // mass update of policy records
  Policy.updatewhere = function (ownerGroupList, data, ctx, next) {
    // with manager validation
    if (!ownerGroupList) {
      return next("Invalid ownerGroupList parameter");
    }
    var ownerGroups = ownerGroupList.split(",").map(item => item.trim().replace(new RegExp("\"", "g"), ""));
    if (!ownerGroups) {
      return next("Invalid ownerGroupList parameter");
    }

    var UserIdentity = app.models.UserIdentity;
    var User = app.models.User;

    // WARNING: ctx changes based on the position in the callback
    const userId = ctx.req.accessToken.userId;

    UserIdentity.findOne({
      where: {
        userId: userId
      }
    }, function (err, identity) {
      if (err) {
        err.statusCode = "404";
        return next(err);
      }
      User.findOne({
        where: {
          _id: userId
        }
      }, function (err, userInstance) {
        if (err) {
          err.statusCode = "404";
          return next(err);
        }

        // necessary since forEach does not provide whenAllDone() callback 
        var itemsProcessed = 0;
        ownerGroups.forEach(function (object, index, array) {
          const where = {
            ownerGroup: object
          };

          var email = null;
          if (identity) {
            // msad user email
            email = identity.profile.email;
          }
          else {
            // functional user email
            email = userInstance.email;
          }
          // only adds if needed
          ds.addDefaultPolicy(where.ownerGroup, null, email, "low", ctx, function (err) {
            if (err) {
              return next(err);
            }
            if (!identity) {
              // allow all functional users
              Policy.update(where, data, function (err) {
                if (err) {
                  return next(err);
                }
                itemsProcessed++;
                // required to avoid callback already called
                if (!err && itemsProcessed === array.length) {
                  return next(null, "successful policy update");
                }
              });
            } else {
              Policy.validatePermission(object, identity.profile.email, function (err) {
                if (err) {
                  return next(err);
                } else {
                  Policy.update(where, data, function (err) {
                    if (err) {
                      return next(err);
                    }
                    itemsProcessed++;
                    // required to avoid callback already called
                    if (!err && itemsProcessed === array.length) {
                      return next(null, "successful policy update");
                    }
                  });
                }
              });
            }
          });
        });
      });
    });
  };

  Policy.remoteMethod("updatewhere", {
    accepts: [{
      arg: "ownerGroupList",
      type: "string",
      required: true,
      description: "Comma-separated string of owner groups to update e.g. \"p14159, p24959\""
    }, {
      arg: "data",
      type: "object",
      required: true
    },
    {
      arg: "options",
      type: "object",
      http: {
        source: "context"
      }
    }
    ],
    http: {
      path: "/updatewhere",
      verb: "post"
    },
    returns: {
      type: "Object",
      root: true
    },
    description: "updates multiple records on the Policy model and uses ownerGroup to identify those records"
  });

  Policy.validatesUniquenessOf("ownerGroup");
};
