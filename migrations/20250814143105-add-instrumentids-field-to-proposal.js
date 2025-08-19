module.exports = {
  async up(db, client) {
    await db
      .collection("Proposal")
      .updateMany(
        { instrumentIds: { $exists: false } },
        { $set: { instrumentIds: [] } },
      );
  },

  async down(db, client) {
    // No path backward
  },
};
