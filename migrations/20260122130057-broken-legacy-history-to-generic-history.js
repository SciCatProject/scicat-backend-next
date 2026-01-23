/* eslint-disable @typescript-eslint/no-require-imports */
const convertObsoleteHistoryToGenericHistory =
  require("../dist/datasets/utils/history.util").convertObsoleteHistoryToGenericHistory;

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // The query on line 14 should be run against the old DB snapshot
    // One approach would be to copy the old dacat.Dataset collection into the current DB say under old.Dataset
    const affectedDatasets = db.collection("old.Dataset").find({
      history: {
        $elemMatch: {
          datasetlifecycle: { $exists: true },
          "datasetlifecycle.previousValue": { $exists: false },
        },
      },
    });

    let successCount = 0;
    let failedCount = 0;
    for await (const ds of affectedDatasets) {
      const pid = ds._id;
      const history = ds.history;
      let prev = {};
      for (const entry of history) {
        if (entry.datasetlifecycle && entry.datasetlifecycle.previousValue) {
          break; // first valid record found, stop for this ds
        }
        if (entry.datasetlifecycle) {
          entry.datasetlifecycle.currentValue = JSON.parse(
            JSON.stringify(entry.datasetlifecycle),
          );
          entry.datasetlifecycle.previousValue = prev;
          prev = entry.datasetlifecycle.currentValue;
          const genericHistory = convertObsoleteHistoryToGenericHistory(
            entry,
            pid,
          );
          // find the generic history record in db with the same timestamp and empty before / after, and replace it with this one
          const updatedGenericHistory = await db
            .collection("History")
            .replaceOne(
              {
                documentId: pid,
                timestamp: genericHistory.timestamp,
                before: {},
                after: {},
              },
              genericHistory,
            );
          if (updatedGenericHistory) {
            successCount++;
          } else {
            failedCount++;
          }
        }
      }
      if (successCount % 1000 == 0) {
        console.log(
          "migrating, count, failedCount: ",
          successCount,
          failedCount,
        );
      }
    }
    console.log("count, failedCount: ", successCount, failedCount);
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
