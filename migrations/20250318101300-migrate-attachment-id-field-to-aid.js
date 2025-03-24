module.exports = {
  async up(db, client) {
    await db.collection("Attachment").updateMany(
      {
        $or: [
          { datasetId: { $exists: true } },
          { sampleId: { $exists: true } },
          { proposalId: { $exists: true } },
          { id: { $exists: true } },
          { aid: { $exists: false } },
        ],
      },
      [
        {
          $set: {
            relationships: {
              // Build relationships array by checking ALL IDs
              $cond: [
                {
                  $or: [
                    { $ifNull: ["$datasetId", false] },
                    { $ifNull: ["$sampleId", false] },
                    { $ifNull: ["$proposalId", false] },
                  ],
                },
                {
                  $concatArrays: [
                    // Add dataset relationship if exists
                    {
                      $cond: [
                        { $ifNull: ["$datasetId", false] },
                        [
                          {
                            targetIds: ["$datasetId"],
                            targetType: "dataset",
                            relationType: "is attached to",
                          },
                        ],
                        [],
                      ],
                    },
                    // Add sample relationship if exists
                    {
                      $cond: [
                        { $ifNull: ["$sampleId", false] },
                        [
                          {
                            targetIds: ["$sampleId"],
                            targetType: "sample",
                            relationType: "is attached to",
                          },
                        ],
                        [],
                      ],
                    },
                    // Add proposal relationship if exists
                    {
                      $cond: [
                        { $ifNull: ["$proposalId", false] },
                        [
                          {
                            targetIds: ["$proposalId"],
                            targetType: "proposal",
                            relationType: "is attached to",
                          },
                        ],
                        [],
                      ],
                    },
                  ],
                },
                // Fallback to existing relationships if no IDs
                "$relationships",
              ],
            },
            aid: { $ifNull: ["$id", "$_id"] },
          },
        },
        { $unset: ["datasetId", "sampleId", "proposalId", "id"] },
      ],
    );
  },

  async down(db, client) {
    await db
      .collection("Attachment")
      .updateMany({ relationships: { $exists: true } }, [
        {
          $set: {
            datasetId: {
              $let: {
                vars: {
                  datasetRel: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$relationships",
                          as: "rel",
                          cond: { $eq: ["$$rel.targetType", "dataset"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  $ifNull: [
                    { $arrayElemAt: ["$$datasetRel.targetIds", 0] },
                    "$$REMOVE",
                  ],
                },
              },
            },
            sampleId: {
              $let: {
                vars: {
                  sampleRel: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$relationships",
                          as: "rel",
                          cond: { $eq: ["$$rel.targetType", "sample"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  $ifNull: [
                    { $arrayElemAt: ["$$sampleRel.targetIds", 0] },
                    "$$REMOVE",
                  ],
                },
              },
            },
            proposalId: {
              $let: {
                vars: {
                  proposalRel: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$relationships",
                          as: "rel",
                          cond: { $eq: ["$$rel.targetType", "proposal"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  $ifNull: [
                    { $arrayElemAt: ["$$proposalRel.targetIds", 0] },
                    "$$REMOVE",
                  ],
                },
              },
            },
            // Revert aid back to id.
            id: "$aid",
          },
        },
        { $unset: ["relationships", "aid"] },
      ]);
  },
};
