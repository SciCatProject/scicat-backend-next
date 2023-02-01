module.exports = {
  async up(db, client) {
    try {
      await db.collection("Dataset").dropIndex("techniques.pid_1");
    } catch (error) {
      console.info(`Index techniques.pid_1 not found`, error);
    }
    await db
      .collection("Dataset")
      .createIndex({ "techniques.pid": 1 }, { sparse: true });
  },

  async down(db, client) {
    try {
      await db.collection("Dataset").dropIndex("techniques.pid_1");
    } catch (error) {
      console.info(`Index techniques.pid_1 not found`, error);
    }
    // NOTE: This unique flag here is problematic because after importing production data and trying it throws an error:
    // E11000 duplicate key error collection: dacat.Dataset index: techniques.pid_1 dup key
    await db
      .collection("Dataset")
      .createIndex({ "techniques.pid": 1 }, { unique: true, sparse: true });
  },
};
