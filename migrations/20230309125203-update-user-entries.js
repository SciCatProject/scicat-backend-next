module.exports = {
  async up(db, client) {
    db.collection("User")
      .find({})
      .forEach(user => {
        let properties = {};
        if (user.username.startsWith("oidc.")) {
          properties['username'] = user.username.replace("oidc.","");
          if (!user.authStrategy) {
            properties["authStrategy"] = "oidc";
          }
        } else if (user.username.startsWith("ldap.")) {
          properties['username'] = user.username.replace("ldap.","");
          if (!user.authStrategy) {
            properties["authStrategy"] = "ldap";
          }
        } else if (!user.authStrategy) {
          properties["authStrategy"] = "local";
        }
        if (!!Object.keys(properties).length) {
          console.log(`Updating User ${user.username}(${user._id}) with properties:`,JSON.stringify(properties));
          db.collection("User").updateOne(
            {
              _id: user._id,
            },
            {
              $set: properties,
            }
          )
        }
      });
  },

  async down(db, client) {
    // No path back!!!
  }
};
