module.exports = {
  async up(db, client) {
    await db
      .collection("PublishedData")
      .find({})
      .forEach(async (publishedData) => {
        await db
          .collection("PublishedData")
          .updateOne(
            { _id: publishedData._id },
            { $set: { publicationYear: publishedData.publicationYear.toString() } }
          );
      });
  },

  async down(db, client) {
    await db
      .collection("PublishedData")
      .find({})
      .forEach(async (publishedData) => {
        await db
          .collection("PublishedData")
          .updateOne(
            { _id: publishedData._id },
            { $set: { publicationYear: Number(publishedData.publicationYear) } }
          );
      });
  },
};