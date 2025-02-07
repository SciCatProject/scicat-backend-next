const names = [
  "Job",
  "Policy",
  "Sample",
  "UserSetting",
  "Attachment",
  "OrigDatablock",
];

const translation = {};

module.exports = {
  async up(db, client) {
    for (var i = 0; i < names.length; i++) {
      console.info("Collection:" + names[i]);
      db.collection(names[i])
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
          // eslint-disable-next-line @/quotes
          x._id = UUID().toString().split('"')[1];
          console.info("   Update id " + oldId + " to id " + x._id);
          if (names[i] == "Sample") {
            translation[oldId] = x._id;
          }
          db.collection(names[i]).insert(x);
          db.collection(names[i]).remove({
            _id: oldId,
          });
        });
    }
    console.info("Update sampleIds in datasets:");
    console.info(translation);
    db.collection("Dataset")
      .find({
        sampleId: {
          $in: Object.keys(translation),
        },
      })
      .forEach(function (ds) {
        if ("sampleId" in ds) {
          db.collection("Dataset").update(
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
  },

  async down(db, client) {
    // TODO: Not sure how to write this down migration???
  },
};
