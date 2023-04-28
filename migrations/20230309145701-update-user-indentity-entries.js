const ObjectId = require('bson').ObjectId;

module.exports = {
  async up(db, client) {
    await db.collection("UserIdentity")
      .find({})
      .forEach(identity => {
        let authStrategy = "local";
        if (identity.authScheme === "oidc") {
          authStrategy = "oidc";
        } else if (identity.authScheme === "ldap") {
          authStrategy = "ldap";
        }
        console.log(`Updating User Identity ${identity.externalId} (${identity.userId}) with authStrategy: ${authStrategy}`);
        db.collection("UserIdentity").updateOne(
          {
            _id: new ObjectId(identity._id),
          },
          {
            $set: {
              authStrategy : authStrategy,
            },
          }
        )
      });
  },

  async down(db, client) {
    // No path backward
  }
};
