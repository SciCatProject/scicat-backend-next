"use strict";

module.exports = function(Rawdataset) {
  // Rawdataset.validatesUniquenessOf('sourceFolder', {
  //     message: 'SourceFolder is not unique'
  // });

  Rawdataset.facet = function(creationLocation, ownerGroup, startDate, endDate, text,
                              cb) {
    var findFilter = [];
    // add user provided arguments and check
    var match = {};
    if (ownerGroup) {
      /** NOTE Loopback SDK cannot handle sending arrays
       * This could be fixed in the generated SDK but would then
       * need to be fixed in every subsequent replace.
       * Until this is fixed, this HACK must stay in
       */
      if (ownerGroup.length > 0 && typeof ownerGroup[0] === "object") {
        var groupsArray = [];
        var keys = Object.keys(ownerGroup[0]);
        for (var i = 0; i < keys.length; i++) {
          groupsArray.push(ownerGroup[0][keys[i]]);
        }
        ownerGroup = groupsArray;
        match.ownerGroup = {'$in' : ownerGroup};
      } else if (ownerGroup) {
        var groups = ownerGroup.split(',');
        match.ownerGroup = {'$in': groups};
      }
    }
    if (creationLocation) {
      match.creationLocation = creationLocation;
      }
    if (text) {
      match['$text'] = {'$search': text}
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
          // Count the number of books published in a given year
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
