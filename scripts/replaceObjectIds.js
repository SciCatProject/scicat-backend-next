names = [
  "Job",
  "Policy",
  "Sample",
  "UserSetting",
  "Attachment",
  "OrigDatablock",
];
translation = {};
for (var i = 0; i < names.length; i++) {
  printjson("Collection:" + names[i]);
  coll = db[names[i]];
  coll
    .find({
      $or: [
        {
          _id: {
            $regex: /^[a-f\d]{24}$/i,
          },
        },
        {
          _id: {
            $type: "objectId",
          },
        },
      ],
    })
    .forEach(function (x) {
      var oldId = x._id;
      x._id = UUID().toString().split('"')[1];
      printjson("   Update id " + oldId + " to id " + x._id);
      if (names[i] == "Sample") {
        translation[oldId] = x._id;
      }
      coll.insert(x);
      coll.remove({
        _id: oldId,
      });
    });
}
printjson("Update sampleIds in datasets:");
printjson(translation);
db.Dataset.find({
  sampleId: {
    $in: Object.keys(translation),
  },
}).forEach(function (ds) {
  if ("sampleId" in ds) {
    db.Dataset.update(
      {
        _id: ds._id,
      },
      {
        $set: {
          sampleId: translation[ds.sampleId],
        },
      },
    );
  }
});
