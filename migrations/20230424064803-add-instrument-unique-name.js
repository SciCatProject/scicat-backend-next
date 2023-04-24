const uuidv4 = require('uuid').v4;

module.exports = {
  async up(db, client) {
    await db.collection("Instrument")
      .find({})
      .forEach(instrument => {
        const uniqueName = instrument.name + " " + uuidv4().split("-")[4];
        console.log(`Updating Instrument ${instrument.name} (Id: ${instrument.id}) with unique name =>${uniqueName}<=`);
        db.collection("Instrument").updateOne(
          {
            _id: instrument._id,
          },
          {
            $set: {
              uniqueName: uniqueName,
            }
          }
        )
      });
  },

  async down(db, client) {
    // no path backward
  }
};
