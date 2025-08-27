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

  async down(db, client) {
    await db
      .collection("Job")
      .updateMany(
        {
          $or: [
            { $and: [{ id: { $exists: true } }, { _id: { $exists: false } }] },
            { $and: [{ emailJobInitiator: { $exists: false } }, { contactEmail: { $exists: true } }] },
            { $and: [{ creationTime: { $exists: false } }, { createdAt: { $exists: true } }] },
            { $and: [{ jobStatusMessage: { $exists: false } }, { statusCode: { $exists: true } }] },
            { $and: [{ datasetList: { $exists: false } }, { "jobParams.datasetList": { $exists: true } }] },
            { $and: [{ executionTime: { $exists: false } }, { "jobParams.executionTime": { $exists: true } }] },

          ]
        },
        [
          {
            $set: {
              _id: { $ifNull: ["$_id", "$id"] },
              emailJobInitiator: { $ifNull: ["$contactEmail", "$emailJobInitiator"] },
              creationTime: { $ifNull: ["$createdAt", "$creationTime"] },
              jobStatusMessage: { $ifNull: ["$statusCode", "$jobStatusMessage"] },
              datasetList: { $ifNull: ["$jobParams.datasetList", "$datasetList"] },
              executionTime: { $ifNull: ["$jobParams.executionTime", "$executionTime"] },
            },
          },
          {
            $unset: [
              "id",
              "contactEmail",
              "createdAt",
              "statusCode",
              "jobParams.datasetList",
              "jobParams.executionTime"
            ],
          },
        ]
      );
  },
};
