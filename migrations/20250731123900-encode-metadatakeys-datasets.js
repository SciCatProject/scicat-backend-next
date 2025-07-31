module.exports = {
  async up(db, client) {
    function encodeKey(key) {
      return encodeURIComponent(key).replace(/\./g, "%2E");
    }

    await db
      .collection("Dataset")
      .find({ scientificMetadata: { $exists: true } })
      .forEach(async (dataset) => {
        const metadata = dataset.scientificMetadata;
        if (!metadata || typeof metadata !== "object") return;

        const encodedMetadata = {};
        for (const [key, value] of Object.entries(metadata)) {
          const decodedKey = decodeURIComponent(key);

          const encodedKey = decodedKey === key ? encodeKey(key) : key;
          encodedMetadata[encodedKey] = value;
        }

        console.log(
          `Updating Dataset (Id: ${dataset._id}) with encoded scientificMetadata keys`
        );
        await db.collection("Dataset").updateOne(
          { _id: dataset._id },
          { $set: { scientificMetadata: encodedMetadata } }
        );
      });
  },

  async down(db, client) {
    
  },
};