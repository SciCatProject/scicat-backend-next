module.exports = {
  async up(db, client) {
    await db
      .collection("PublishedData")
      .find({})
      .forEach(async (publishedData) => {
        const pid = publishedData._id;
        const metadata = {
          affiliation: publishedData.affiliation,
          downloadLink: publishedData.downloadLink,
          scicatUser: publishedData.scicatUser,
          thumbnail: publishedData.thumbnail,
          url: publishedData.url,
          creators: publishedData.creator.map((creator) => ({
            name: creator.trim(),
            affiliation: [{ name: publishedData.affiliation?.trim() || "" }],
          })),
          publisher: {
            name: publishedData.publisher.trim(),
          },
          publicationYear: publishedData.publicationYear,
          dataDescription: publishedData.dataDescription,
          resourceType: publishedData.resourceType,
          contributors:
            publishedData.authors?.map((author) => ({
              name: author.trim(),
            })) || [],
          relatedIdentifiers:
            publishedData.relatedPublications?.map((relatedPublication) => ({
              relatedIdentifier: relatedPublication,
            })) || [],
        };
        const datasetPids = publishedData.pidArray;
        const status =
          publishedData.status === "registered" ? "registered" : "private";

        console.log(`Updating PublishedData (Id: ${pid})`);
        await db.collection("PublishedData").updateOne(
          { _id: pid },
          {
            $set: {
              pid,
              metadata,
              datasetPids,
              status,
            },
            $unset: {
              affiliation: true,
              downloadLink: true,
              scicatUser: true,
              authors: true,
              pidArray: true,
              creator: true,
              publisher: true,
              publicationYear: true,
              dataDescription: true,
              relatedPublications: true,
              resourceType: true,
              thumbnail: true,
              url: true,
            },
          },
        );
      });
  },
  async down(db, client) {
    await db
      .collection("PublishedData")
      .find({})
      .forEach(async (publishedData) => {
        console.log(`Updating PublishedData (Id: ${publishedData._id})`);
        await db.collection("PublishedData").updateOne(
          { _id: publishedData._id },
          {
            $set: {
              affiliation: publishedData.metadata.affiliation,
              downloadLink: publishedData.metadata.downloadLink,
              scicatUser: publishedData.metadata.scicatUser,
              thumbnail: publishedData.metadata.thumbnail,
              url: publishedData.metadata.url,
              creator: publishedData.metadata.creators.map(
                (creator) => creator.name,
              ),
              publisher: publishedData.metadata.publisher.name,
              publicationYear: publishedData.metadata.publicationYear,
              dataDescription: publishedData.metadata.dataDescription,
              resourceType: publishedData.metadata.resourceType,
              authors: publishedData.metadata.contributors?.map(
                (contributor) => contributor.name,
              ),
              relatedPublications:
                publishedData.metadata.relatedIdentifiers?.map(
                  (relatedIdentifier) => relatedIdentifier.relatedIdentifier,
                ),
              pidArray: publishedData.datasetPids,
              status:
                publishedData.status === "registered"
                  ? "registered"
                  : "pending_registration",
            },
            $unset: { metadata: true, datasetPids: true, pid: true },
          },
        );
      });
  },
};
