module.exports = {
  async up(db, client) {
    await db
      .collection("Job")
      .updateMany(
        {
          $or: [
            { $and: [{ id: { $exists: false } }, { _id: { $exists: true } }] },
            { $and: [{ contactEmail: { $exists: false } }, { emailJobInitiator: { $exists: true } }] },
            { $and: [{ createdAt: { $exists: false } }, { creationTime: { $exists: true } }] },
            { $and: [{ statusCode: { $exists: false } }, { jobStatusMessage: { $exists: true } }] },
            { $and: [{ "jobParams.datasetList": { $exists: false } }, { datasetList: { $exists: true } }] },
            { $and: [{ "jobParams.executionTime": { $exists: false } }, { executionTime: { $exists: true } }] },
          ]
        },
        [
          {
            $set: {
              id: { $ifNull: ["$id", "$_id"] },
              contactEmail: { $ifNull: ["$emailJobInitiator", "$contactEmail"] },
              createdAt: { $ifNull: ["$creationTime", "$createdAt"] },
              statusCode: { $ifNull: ["$jobStatusMessage", "$statusCode"] },
              jobParams: {
                $mergeObjects: [
                  { $ifNull: ["$jobParams", {}] },
                  {
                    datasetList: { $ifNull: ["$datasetList", "$jobParams.datasetList"] },
                    executionTime: { $ifNull: ["$executionTime", "$jobParams.executionTime"] }
                  }
                ]
              }
            }
          },
          {
            $unset: [
              "emailJobInitiator",
              "creationTime",
              "jobStatusMessage",
              "datasetList",
              "executionTime"
            ]
          }
        ]
      );
  },
};
