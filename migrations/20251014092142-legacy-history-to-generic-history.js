/* eslint-disable @typescript-eslint/no-require-imports */
const convertObsoleteHistoryToGenericHistory =
  require("../dist/datasets/utils/history.util").convertObsoleteHistoryToGenericHistory;

const convertGenericHistoriesToObsoleteHistories =
  require("../dist/datasets/utils/history.util").convertGenericHistoriesToObsoleteHistories;

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    for await (const dataset of db
      .collection("Dataset")
      .find({ history: { $exists: true, $type: "array", $ne: [] } })) {
      console.log(
        `Migrating history for dataset ${dataset._id}. Entries: ${dataset.history.length}`,
      );
      const genericHistories = dataset.history.map((entry) =>
        convertObsoleteHistoryToGenericHistory(entry, dataset._id),
      );
      result = await db.collection("History").insertMany(genericHistories);
    }
    await db.collection("Dataset").updateMany({}, { $unset: { history: "" } });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    for await (const dataset of db
      .collection("Dataset")
      .find({ history: { $exists: false } })) {
      console.log(`Rolling back history for dataset ${dataset._id}`);
      const genericHistories = await db
        .collection("History")
        .find(
          { documentId: dataset._id, subsystem: "Dataset" },
          { sort: { timestamp: "desc" } },
        )
        .toArray();
      console.log(
        `Found ${genericHistories.length} history entries for dataset ${dataset._id}`,
      );
      dataset.$clone = () => dataset; // Mock the $clone method, as this is not a mongoose document
      const obsoleteHistories = convertGenericHistoriesToObsoleteHistories(
        genericHistories,
        dataset,
      );
      console.log(
        `Inserting obsolete history entries for dataset ${dataset._id}`,
      );
      await db
        .collection("Dataset")
        .updateOne(
          { _id: dataset._id },
          { $set: { history: obsoleteHistories } },
        );
    }
  },
};
