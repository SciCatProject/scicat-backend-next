module.exports = {
  async up(db, client) {
    await db
      .collection("Dataset")
      .find({ size: 0 })
      .forEach(async (dataset) => {
        const origDatablocks = await db
          .collection("OrigDatablock")
          .find({
            datasetId: dataset._id,
          })
          .toArray();
        const origDatablockSizeSum = origDatablocks.reduce(
          (acc, origDatablock) => acc + origDatablock.size,
          0,
        );

        const datablocks = await db
          .collection("Datablock")
          .find({
            datasetId: dataset._id,
          })
          .toArray();

        const datablockSizeSum = datablocks.reduce(
          (acc, datablock) => acc + datablock.size,
          0,
        );

        const datasetSizeSum = origDatablockSizeSum + datablockSizeSum;

        console.log(
          `Updating Dataset (Id: ${dataset._id}) with size =>${datasetSizeSum}<=`,
        );
        await db.collection("Dataset").updateOne(
          {
            _id: dataset._id,
          },
          {
            $set: {
              size: datasetSizeSum,
            },
          },
        );
      });

    await db
      .collection("Dataset")
      .find({ numberOfFiles: 0 })
      .forEach(async (dataset) => {
        const origDatablocks = await db
          .collection("OrigDatablock")
          .find({
            datasetId: dataset._id,
          })
          .toArray();
        const origDatablockNumberOfFilesSum = origDatablocks.reduce(
          (acc, origDatablock) => acc + origDatablock.dataFileList.length,
          0,
        );

        const datablocks = await db
          .collection("Datablock")
          .find({
            datasetId: dataset._id,
          })
          .toArray();

        const datablockNumberOfFilesSum = datablocks.reduce(
          (acc, datablock) => acc + datablock.dataFileList.length,
          0,
        );

        const datasetNumberOfFilesSum =
          origDatablockNumberOfFilesSum + datablockNumberOfFilesSum;

        console.log(
          `Updating Dataset (Id: ${dataset._id}) with numberOfFiles =>${datasetNumberOfFilesSum}<=`,
        );
        await db.collection("Dataset").updateOne(
          {
            _id: dataset._id,
          },
          {
            $set: {
              numberOfFiles: datasetNumberOfFilesSum,
            },
          },
        );
      });

    await db
      .collection("Dataset")
      .find({ packedSize: 0 })
      .forEach(async (dataset) => {
        const datablocks = await db
          .collection("Datablock")
          .find({
            datasetId: dataset._id,
          })
          .toArray();

        const datablockPackedSizeSum = datablocks.reduce(
          (acc, datablock) => acc + datablock.packedSize,
          0,
        );

        console.log(
          `Updating Dataset (Id: ${dataset._id}) with packedSize =>${datablockPackedSizeSum}<=`,
        );
        await db.collection("Dataset").updateOne(
          {
            _id: dataset._id,
          },
          {
            $set: {
              packedSize: datablockPackedSizeSum,
            },
          },
        );
      });

    await db
      .collection("Dataset")
      .find({ numberOfFilesArchived: 0 })
      .forEach(async (dataset) => {
        const datablocks = await db
          .collection("Datablock")
          .find({
            datasetId: dataset._id,
          })
          .toArray();

        const datablockNumberOfFilesArchivedSum = datablocks.reduce(
          (acc, datablock) => acc + datablock.dataFileList.length,
          0,
        );

        console.log(
          `Updating Dataset (Id: ${dataset._id}) with numberOfFilesArchived =>${datablockNumberOfFilesArchivedSum}<=`,
        );
        await db.collection("Dataset").updateOne(
          {
            _id: dataset._id,
          },
          {
            $set: {
              numberOfFilesArchived: datablockNumberOfFilesArchivedSum,
            },
          },
        );
      });
  },

  async down(db, client) {},
};
