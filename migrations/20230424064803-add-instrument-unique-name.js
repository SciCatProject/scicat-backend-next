import {v4 as uuidv4} from 'uuid';
const ObjectId = require('bson').ObjectId;

module.exports = {
  async up(db, client) {
    await db.collection("Instruments")
      .find({})
      .forEach(instrument => {
        const uniqueName = instrument.name + " " + uuidv4().split("-")[4];
        console.log(`Updating Instrument ${instrument.name} (Id: ${instrument.id}) with unique name =>${uniqueName}<=`);
        db.collection("Instruments").updateOne(
          {
            _id: ObjectId(instrument._id),
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
