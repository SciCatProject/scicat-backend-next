module.exports = {
  async up(db, client) {
    db.collection("Proposal").updateMany(
      { type: { $exists: false } },
      { $set: { type: "Default Proposal" } },
    );
  },

  async down(db, client) {
    db.collection("Proposal").updateMany({}, { $unset: { type: 1 } });
  },
};
