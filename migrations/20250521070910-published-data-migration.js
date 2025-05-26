module.exports = {
  async up(db, client) {
    await db.collection("PublishedData").updateMany({}, [
      {
        $set: {
          pid: "$_id",
          metadata: {
            affiliation: "$affiliation",
            downloadLink: "$downloadLink",
            scicatUser: "$scicatUser",
            thumbnail: "$thumbnail",
          },
          creators: "$creator",
          contributors: "$authors",
          datasetPids: "$pidArray",
          status: {
            $cond: {
              if: { $eq: ["$status", "registered"] },
              then: "registered",
              else: "private",
            },
          },
        },
      },
      {
        $unset: [
          "affiliation",
          "downloadLink",
          "scicatUser",
          "authors",
          "pidArray",
          "creator",
          "thumbnail",
        ],
      },
    ]);
  },

  async down(db, client) {
    await db.collection("PublishedData").updateMany({}, [
      {
        $set: {
          affiliation: "$metadata.affiliation",
          downloadLink: "$metadata.downloadLink",
          scicatUser: "$metadata.scicatUser",
          thumbnail: "$metadata.thumbnail",
          authors: "$contributors",
          pidArray: "$datasetPids",
          creator: "$creators",
          status: {
            $cond: {
              if: { $eq: ["$status", "registered"] },
              then: "registered",
              else: "pending_registration",
            },
          },
        },
      },
      {
        $unset: ["metadata", "contributors", "datasetPids", "pid", "creators"],
      },
    ]);
  },
};
