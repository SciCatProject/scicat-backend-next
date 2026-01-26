/* eslint-disable @typescript-eslint/no-require-imports */
const {
  encodeScientificMetadataKeys,
  decodeScientificMetadataKeys,
} = require("../dist/common/utils");

module.exports = {
  async up(db, client) {
    const bulkOps = [];

    for await (const dataset of db
      .collection("Dataset")
      .find({ scientificMetadata: { $exists: true } })) {
      const metadata = dataset.scientificMetadata;
      if (!metadata || typeof metadata !== "object") continue;

      let encodedMetadata;
      try {
        encodedMetadata = encodeScientificMetadataKeys(metadata);
      } catch (err) {
        console.error(
          `Error encoding scientificMetadata for Dataset (Id: ${dataset._id}):`,
          err,
        );
        continue;
      }

      console.log(
        `Updating Dataset (Id: ${dataset._id}) with encoded scientificMetadata keys`,
      );

      bulkOps.push({
        updateOne: {
          filter: { _id: dataset._id },
          update: { $set: { scientificMetadata: encodedMetadata } },
        },
      });
    }

    if (bulkOps.length > 0) {
      console.log(`Executing bulk update for ${bulkOps.length} datasets`);
      await db.collection("Dataset").bulkWrite(bulkOps);
    }
  },

  async down(db, client) {
    const bulkOps = [];

    for await (const dataset of db
      .collection("Dataset")
      .find({ scientificMetadata: { $exists: true } })) {
      const metadata = dataset.scientificMetadata;
      if (!metadata || typeof metadata !== "object") continue;

      let decodedMetadata;

      try {
        decodedMetadata = decodeScientificMetadataKeys(metadata);
      } catch (err) {
        console.error(
          `Error decoding scientificMetadata for Dataset (Id: ${dataset._id}):`,
          err,
        );
        continue;
      }

      console.log(
        `Reverting Dataset (Id: ${dataset._id}) to decoded scientificMetadata keys`,
      );

      bulkOps.push({
        updateOne: {
          filter: { _id: dataset._id },
          update: { $set: { scientificMetadata: decodedMetadata } },
        },
      });
    }

    if (bulkOps.length > 0) {
      console.log(`Executing bulk revert for ${bulkOps.length} datasets`);
      await db.collection("Dataset").bulkWrite(bulkOps);
    }
  },
};
