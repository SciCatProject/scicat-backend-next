module.exports = {
  async up(db, client) {
    await db.collection("PublishedData").updateMany({}, [
      {
        $set: {
          metadata: {
            dataDescription: "$dataDescription",
            affiliation: "$affiliation",
            numberOfFiles: "$numberOfFiles",
            sizeOfArchive: "$sizeOfArchive",
            downloadLink: "$downloadLink",
            scicatUser: "$scicatUser",
          },
          relatedIdentifiers: "$relatedPublications",
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
          "dataDescription",
          "affiliation",
          "numberOfFiles",
          "sizeOfArchive",
          "downloadLink",
          "scicatUser",
          "relatedPublications",
          "authors",
          "pidArray",
        ],
      },
    ]);
  },

  async down(db, client) {
    await db.collection("PublishedData").updateMany({}, [
      {
        $set: {
          dataDescription: "$metadata.dataDescription",
          affiliation: "$metadata.affiliation",
          numberOfFiles: "$metadata.numberOfFiles",
          sizeOfArchive: "$metadata.sizeOfArchive",
          downloadLink: "$metadata.downloadLink",
          scicatUser: "$metadata.scicatUser",
          relatedPublications: "$relatedIdentifiers",
          authors: "$contributors",
          pidArray: "$datasetPids",
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
        $unset: [
          "metadata",
          "relatedIdentifiers",
          "contributors",
          "datasetPids",
        ],
      },
    ]);
  },
};
