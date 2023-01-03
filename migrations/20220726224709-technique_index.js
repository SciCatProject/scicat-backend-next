module.exports = {
  async up(db, client) {
    await db.collection("Dataset").dropIndex("techniques.pid_1");
    await db
      .collection("Dataset")
      .createIndex({ "techniques.pid": 1 }, { sparse: true });
  },

  async down(db, client) {
    await db.collection("Dataset").dropIndex("techniques.pid_1");
    await db
      .collection("Dataset")
      .createIndex({ "techniques.pid": 1 }, { unique: true, sparse: true });
  },
};
