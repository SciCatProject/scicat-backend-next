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
                    // Add dataset relationship if datasetId exists
                    {
                      $cond: [
                        { $ifNull: ["$datasetId", false] },
                        [
                          {
                            targetId: "$datasetId",
                            targetType: "dataset",
                            relationType: "is attached to",
                          },
                        ],
                        [],
                      ],
                    },
                    // Add sample relationship if sampleId exists
                    {
                      $cond: [
                        { $ifNull: ["$sampleId", false] },
                        [
                          {
                            targetId: "$sampleId",
                            targetType: "sample",
                            relationType: "is attached to",
                          },
                        ],
                        [],
                      ],
                    },
                    // Add proposal relationship if proposalId exists
                    {
                      $cond: [
                        { $ifNull: ["$proposalId", false] },
                        [
                          {
                            targetId: "$proposalId",
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
                  $ifNull: ["$$datasetRel.targetId", "$$REMOVE"],
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
                  $ifNull: ["$$sampleRel.targetId", "$$REMOVE"],
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
                  $ifNull: ["$$proposalRel.targetId", "$$REMOVE"],
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
