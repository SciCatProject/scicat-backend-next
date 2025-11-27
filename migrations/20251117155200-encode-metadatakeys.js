/* eslint-disable @typescript-eslint/no-require-imports */
const {
  encodeScientificMetadataKeys,
  decodeScientificMetadataKeys,
} = require("../dist/common/utils");

module.exports = {
  async up(db, client) {
    await db
      .collection("Dataset")
      .find({ scientificMetadata: { $exists: true } })
      .forEach(async (dataset) => {
        const metadata = dataset.scientificMetadata;
        if (!metadata || typeof metadata !== "object") return;

        const encodedMetadata = encodeScientificMetadataKeys(metadata);

        console.log(
          `Updating Dataset (Id: ${dataset._id}) with encoded scientificMetadata keys`,
        );
        await db
          .collection("Dataset")
          .updateOne(
            { _id: dataset._id },
            { $set: { scientificMetadata: encodedMetadata } },
          );
      });
  },

  async down(db, client) {
    await db
      .collection("Dataset")
      .find({ scientificMetadata: { $exists: true } })
      .forEach(async (dataset) => {
        const metadata = dataset.scientificMetadata;
        if (!metadata || typeof metadata !== "object") return;

        const decodedMetadata = decodeScientificMetadataKeys(metadata);

        console.log(
          `Reverting Dataset (Id: ${dataset._id}) to decoded scientificMetadata keys`,
        );
        await db
          .collection("Dataset")
          .updateOne(
            { _id: dataset._id },
            { $set: { scientificMetadata: decodedMetadata } },
          );
      });
  },
};
