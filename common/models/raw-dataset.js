"use strict";

module.exports = function(Rawdataset) {
  // Rawdataset.validatesUniquenessOf('sourceFolder', {
  //     message: 'SourceFolder is not unique'
  // });
  var app = require('../../server/server');

  Rawdataset.beforeRemote('facet', function(ctx, userDetails, next) {
    const userId = ctx.req.accessToken && ctx.req.accessToken.userId;
    var User = app.models.User;
    let groups = ctx.args.ownerGroup ? ctx.args.ownerGroup : [];
    User.findById(userId, function(err, instance) {
        if (instance) {
            // check if a normal user or an internal ROLE
            if (instance.username.split('.').length < 2) {
                console.log("Functional account, apply ACLs only: ",instance.username);
                ctx.args.ownerGroup = ctx.args.ownerGroup && ctx.args.ownerGroup.length > 0 ? ctx.args.ownerGroup : undefined;
                next();
            } else {
                var filter = {
                    where: {
                        sAMAccountName: instance.username.split('.')[1]
                    }
                };
                var AccessUser = app.models.AccessUser;
                AccessUser.findOne(filter, function(err, auser) {
                    if (auser) {
                        // filter pgroups p[digits]
                        var foundGroups = auser.memberOf.filter(function(el) {
                            return /p\d+/.test(el);
                        }); // ['p12672'];
                        if (typeof groups === 'undefined') {
                            foundGroups = [];
                            ctx.args.ownerGroup = foundGroups;
                            next();
                        }
                        var a = new Set(groups);
                        var b = new Set(foundGroups);
                        var intersection = new Set([...a].filter(x => b.has(x)));
                        var subgroups = Array.from(intersection);
                        if (subgroups.length === 0){
                          subgroups = foundGroups;
                        }
                        ctx.args.ownerGroup = subgroups;
                        next();
                    } else {
                      ctx.args.ownerGroup = []; 
                      next();
                    }
                });
            }
        }
    });
  });

  Rawdataset.facet = function(creationLocation, ownerGroup, startDate, endDate, text,
                              cb) {
    var findFilter = [];
    // add user provided arguments and check
    var match = {};
    console.log(ownerGroup);
    if (ownerGroup) {
      match.ownerGroup = {'$in' : ownerGroup};
    }
    if (creationLocation) {
      match.creationLocation = creationLocation;
      }
    if (text) {
      match['$text'] = text;
      }
    if (startDate && endDate) {
      match.creationTime = {
        $gte : new Date(startDate),
        $lte : new Date(endDate)
      };
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      cb("Only one date specified, need a range", null);
      }
    // ensure fields have been specified and both dates have been set
    if (Object.keys(match).length !== 0) {
      findFilter.push({$match : match});
    }
    findFilter.push({
      $facet : {
        // The `years` property will be the output of the 'count by year'
        // pipeline
        years : [
          {
            $group : {
              _id : {
                year : {$year : "$creationTime"},
                month : {$month : "$creationTime"},
                day : {$dayOfMonth : "$creationTime"},
              },
              count : {$sum : 1}
            }
          },
          // Sort by year descending
          {$sort : {count : -1, _id : -1}}
        ],
        groups : [
          // Count the number of groups
          {$group : {_id : "$ownerGroup", count : {$sum : 1}}},
          // Sort by name ascending
          {$sort : {count : -1, _id : 1}}
        ],
        locations : [
          {$group : {_id : "$creationLocation", count : {$sum : 1}}},
          {$sort : {count : -1, _id : 1}}
        ]
      }
    });
    Rawdataset.getDataSource().connector.connect(function(err, db) {
      var collection = db.collection("RawDataset");
      console.log(JSON.stringify(findFilter));
      var res = collection.aggregate(findFilter,
                                     function(err, res) { cb(err, res); });
    });
  };

};
