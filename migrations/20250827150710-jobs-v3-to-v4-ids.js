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
            { $and: [{ ownerUser: { $exists: false } }, { "jobParams.username": { $exists: true } }] },
            { ownerGroup: { $exists: false } },
            { accessGroups: { $exists: false } },
            { isPublished: { $exists: false } },
            { configVersion: { $exists: false } },
            { jobResultObject: { $exists: false } },
            { statusMessage: { $exists: false } },
          ]
        },
        [
          {
            $set: {
              id: { $ifNull: ["$id", "$_id"] },
              contactEmail: { $ifNull: ["$contactEmail", "$emailJobInitiator"] },
              createdAt: { $ifNull: ["$createdAt", "$creationTime"] },
              statusCode: { $ifNull: ["$statusCode", "$jobStatusMessage"] },
              jobParams: {
                $mergeObjects: [
                  { $ifNull: ["$jobParams", {}] },
                  {
                    datasetList: { $ifNull: ["$jobParams.datasetList", "$datasetList"] },
                    executionTime: { $ifNull: ["$jobParams.executionTime", "$executionTime"] }
                  }
                ]
              },
              ownerUser: { $ifNull: ["$ownerUser", "$jobParams.username"] },
              ownerGroup: { $ifNull: ["$ownerGroup", "admin"] },
              accessGroups: { $ifNull: ["$accessGroups", []] },
              isPublished: { $ifNull: ["$isPublished", false] },
              configVersion: { $ifNull: ["$configVersion", ""] },
              jobResultObject: { $ifNull: ["$jobResultObject", {}] },
              statusMessage: { $ifNull: ["$statusMessage", ""] },
            }
          },
          {
            $unset: [
              "emailJobInitiator",
              "creationTime",
              "jobStatusMessage",
              "datasetList",
              "executionTime",
              "jobParams.username"
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
            { $and: [{ "jobParams.username": { $exists: false } }, { ownerUser: { $exists: true } }] },
          ]
        },
        [
          {
            $set: {
              _id: { $ifNull: ["$_id", "$id"] },
              emailJobInitiator: { $ifNull: ["$emailJobInitiator", "$contactEmail"] },
              creationTime: { $ifNull: ["$creationTime", "$createdAt"] },
              jobStatusMessage: { $ifNull: ["$jobStatusMessage", "$statusCode"] },
              datasetList: { $ifNull: ["$datasetList", "$jobParams.datasetList"] },
              executionTime: { $ifNull: ["$executionTime", "$jobParams.executionTime"] },
              jobParams: {
                $mergeObjects: [
                  { $ifNull: ["$jobParams", {}] },
                  {
                    username: { $ifNull: ["$jobParams.username", "$ownerUser"] }
                  }
                ]
              },
            },
          },
          {
            $unset: [
              "id",
              "contactEmail",
              "createdAt",
              "statusCode",
              "jobParams.datasetList",
              "jobParams.executionTime",
              "ownerUser",
              // The other fields are not removed in the 
              // down migration to avoid potential data loss
            ],
          },
        ]
      );
  },
};
