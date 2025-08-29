const collections = [
  "Attachment",
  "Datablock",
  "Dataset",
  "Job",
  "OrigDatablock",
  "Policy",
  "Proposal",
  "PublishedData",
  "Sample",
];


module.exports = {
  async up(db, client) {
    for (const collectionName of collections) {
      await db
        .collection(collectionName)
        .updateMany(
          { updatedBy: { $exists: false } },
          [{ $set: { updatedBy: "$createdBy" } }]
        );
    }
  },

  async down(db, client) {
    // No path backward as it's not easy to find on down where updatedBy was added
  },
};
