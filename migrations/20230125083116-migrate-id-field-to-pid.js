const collections = [
  { name: "Dataset", idField: "pid" },
  { name: "Instrument", idField: "pid" },
  { name: "Proposal", idField: "proposalId" },
  { name: "PublishedData", idField: "doi" },
  { name: "Sample", idField: "sampleId" },
];

module.exports = {
  async up(db, client) {
    for (let index = 0; index < collections.length; index++) {
      const { name, idField } = collections[index];

      await db
        .collection(name)
        .updateMany({}, [{ $set: { [idField]: "$_id" } }]);
      await db.collection(name).createIndex(idField, { unique: true });

      console.info("Collection: " + name);
      console.info(`Migrate _id field to ${idField}`);
    }
  },

  async down(db, client) {
    for (let index = 0; index < collections.length; index++) {
      const { name, idField } = collections[index];
      try {
        await db.collection(name).dropIndex(`${idField}_1`);
      } catch (error) {
        console.info(`Index ${idField}_1 not found`, error);
      }
      await db.collection(name).updateMany({}, { $unset: { [idField]: "" } });

      console.info("Collection: " + name);
      console.info(`Down migrate ${idField} field`);
    }
  },
};
