"use strict";

module.exports = function (Rawdataset) {
  // Rawdataset.validatesUniquenessOf('sourceFolder', {
  //     message: 'SourceFolder is not unique'
  // });
  var app = require('../../server/server');

  Rawdataset.beforeRemote('facet', function (ctx, userDetails, next) {
    const userId = ctx.req.accessToken && ctx.req.accessToken.userId;
    var User = app.models.User;
    let groups = ctx.args.ownerGroup ? ctx.args.ownerGroup : [];
    User.findById(userId, function (err, instance) {
      if (instance) {
        // check if a normal user or an internal ROLE
        if (instance.username.split('.').length < 2) {
          console.log("Functional account, apply ACLs only: ", instance.username);
          ctx.args.ownerGroup = ctx.args.ownerGroup && ctx.args.ownerGroup.length > 0 ? ctx.args.ownerGroup : undefined;
          next();
        } else {
          var filter = {
            where: {
              sAMAccountName: instance.username.split('.')[1]
            }
          };
          var AccessUser = app.models.AccessUser;
          AccessUser.findOne(filter, function (err, auser) {
            if (auser) {
              // filter pgroups p[digits]
              var foundGroups = auser.memberOf.filter(function (el) {
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
              if (subgroups.length === 0) {
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

  Rawdataset.facet = function (fields, cb) {
    var findFilter = [];
    var match = {};
    if (fields) {
      console.log(fields)
      var keys = Object.keys(fields);
      var RawDataset = app.models.RawDataset;
      for (var i = 0; i < keys.length; i++) {
        var modelType = RawDataset.getPropertyType(keys[i]);
        var value = fields[keys[i]];
        if (modelType !== undefined && value !== 'undefined' && value !== 'null') {
          switch (modelType) {
            case 'String':
              if (Array.isArray(value)) {
                match[keys[i]] = { '$in': value };
              } else {
                match[keys[i]] = value;
              }
              break;
            case 'Date':
              var reqType = typeof (value);
              switch (reqType) {
                case 'string':
                  match[keys[i]] = new Date(value);
                  break;
                case 'object':
                  if (Object.keys(value).length === 2 && value['start']) {
                    match[keys[i]] = {
                      '$gte': new Date(value['start']),
                      '$lte': new Date(value['end']),
                    };
                  } else {
                    cb('Only one date specified, need a range', null);
                  }
                  break;
              }
              break;
          }
        } else if (keys[i] === 'text' && value !== 'null') {
          match['$text'] = value;
          // TODO check in config map for extra strings, i.e. creationTime start and end
        } else {
          // ignore
        }
      }
    }
    // add user provided arguments and check
    /* console.log(ownerGroup);
    console.log(RawDataset.getPropertyType('creationTime'));
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
    */
    if (Object.keys(match).length !== 0) {
      findFilter.push({ $match: match });
    }
    console.log(match);
    findFilter.push({
      $facet: {
        // The `years` property will be the output of the 'count by year'
        // pipeline
        creationTime: [
          {
            $group: {
              _id: {
                year: { $year: "$creationTime" },
                month: { $month: "$creationTime" },
                day: { $dayOfMonth: "$creationTime" },
              },
              count: { $sum: 1 }
            }
          },
          // Sort by year descending
          { $sort: { count: -1, _id: -1 } }
        ],
        ownerGroup: [
          // Count the number of groups
          { $group: { _id: "$ownerGroup", count: { $sum: 1 } } },
          // Sort by name ascending
          { $sort: { count: -1, _id: 1 } }
        ],
        creationLocation: [
          { $group: { _id: "$creationLocation", count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } }
        ]
      }
    });
    Rawdataset.getDataSource().connector.connect(function (err, db) {
      var collection = db.collection("RawDataset");
      console.log(JSON.stringify(findFilter));
      var res = collection.aggregate(findFilter,
        function (err, res) { cb(err, res); });
    });
  };

};
