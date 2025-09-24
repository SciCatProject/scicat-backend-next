module.exports = {
  async up(db, client) {
    
    const proposals = await db.collection("Proposal").find({}).toArray();

    for (const proposal of proposals) {
      
      const datasetCount = await db
        .collection("Dataset")
        .countDocuments({ proposalIds: proposal.proposalId });

      await db.collection("Proposal").updateOne(
        { _id: proposal._id },
        { $set: { numberOfDatasets: datasetCount } }
      );
    }
  },

  async down(db, client) {
    // No path backward
  },
};