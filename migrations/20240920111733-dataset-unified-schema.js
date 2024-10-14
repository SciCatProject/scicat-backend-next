module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection("Dataset").updateMany({}, [
      {
        $set: {
          proposalIds: ["$proposalId"],
          instrumentIds: ["$instrumentId"],
          sampleIds: ["$sampleId"],
        },
      },
    ]);
    await db.collection("Dataset").updateMany({ type: "derived" }, [
      {
        $set: {
          principalInvestigator: "$investigator",
        },
      },
    ]);
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});

    await db.collection("Dataset").updateMany({}, [
      {
        $set: {
          proposalId: "$proposalIds[0]",
          instrumentId: "$instrumentId[0]",
          sampleId: "$sampleId[0]",
        },
      },
    ]);
    await db.collection("Dataset").updateMany({ type: "derived" }, [
      {
        $set: {
          investigator: "$principalInvestigator",
        },
      },
    ]);
  },
};
