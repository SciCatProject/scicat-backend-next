module.exports = {
  async up(db, client) {
    await db.collection("Dataset").updateMany({}, [
      {
        $set: {
          principalInvestigators: ["$principalInvestigator"],
        },
      },
    ]);

    await db
      .collection("Dataset")
      .updateMany({}, { $unset: { principalInvestigator: "" } });
  },

  async down(db, client) {
    await db.collection("Dataset").updateMany({}, [
      {
        $set: {
          principalInvestigator: {
            $arrayElemAt: ["$principalInvestigators", 0],
          },
        },
      },
    ]);

    await db
      .collection("Dataset")
      .updateMany({}, { $unset: { principalInvestigators: "" } });
  },
};
