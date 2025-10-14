const convertObsoleteHistoryToGenericHistory =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../dist/common/utils/history.util").convertObsoleteHistoryToGenericHistory;

const convertGenericHistoriesToObsoleteHistories =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("../dist/common/utils/history.util").convertGenericHistoriesToObsoleteHistories;

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
      dataset.history.forEach(async (entry) => {
        const genericHistory = convertObsoleteHistoryToGenericHistory(
          entry,
          dataset._id,
        );
        console.log(`Inserting history entry for dataset ${dataset._id}`);
        result = await db.collection("HistoryBackup").insertOne(genericHistory);
      });
    }
    await db.collection("Dataset").updateMany({}, { $unset: { history: "" } });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    for await (const dataset of db.collection("Dataset").find({})) {
      console.log(`Rolling back history for dataset ${dataset._id}`);
      const genericHistories = await db
        .collection("HistoryBackup")
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
