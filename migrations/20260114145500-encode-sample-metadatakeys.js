/* eslint-disable @typescript-eslint/no-require-imports */
const {
  encodeScientificMetadataKeys,
  decodeScientificMetadataKeys,
} = require("../dist/common/utils");

module.exports = {
  async up(db, client) {
    for await (const sample of db
      .collection("Sample")
      .find({ sampleCharacteristics: { $exists: true } })) {
      const metadata = sample.sampleCharacteristics;
      if (!metadata || typeof metadata !== "object") continue;

      let encodedMetadata;
      try {
        encodedMetadata = encodeScientificMetadataKeys(metadata);
      } catch (err) {
        console.error(
          `Error encoding sampleCharacteristics for Sample (Id: ${sample._id}):`,
          err,
        );
        continue;
      }

      console.log(
        `Updating Sample (Id: ${sample._id}) with encoded sampleCharacteristics keys`,
      );
      await db
        .collection("Sample")
        .updateOne(
          { _id: sample._id },
          { $set: { sampleCharacteristics: encodedMetadata } },
        );
    };
  },

  async down(db, client) {
    for await (const sample of db
      .collection("Sample")
      .find({ sampleCharacteristics: { $exists: true } })) {
      const metadata = sample.sampleCharacteristics;
      if (!metadata || typeof metadata !== "object") continue;

      let decodedMetadata;

      try {
        decodedMetadata = decodeScientificMetadataKeys(metadata);
      } catch (err) {
        console.error(
          `Error decoding sampleCharacteristics for Sample (Id: ${sample._id}):`,
          err,
        );
        continue;
      }

      console.log(
        `Reverting Sample (Id: ${sample._id}) to decoded sampleCharacteristics keys`,
      );
      await db
        .collection("Sample")
        .updateOne(
          { _id: sample._id },
          { $set: { sampleCharacteristics: decodedMetadata } },
        );
    };
  },
};
