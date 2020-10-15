module.exports = function(app) {
  const jwt  = require('jsonwebtoken');
  const config = require('../../server/config.json');
  const signAndVerifyOptions = {
    expiresIn: config.jwtExpiresIn || "1h",
  };

  const User = app.models.User;

  User.jwt = function(options, cb) {
    console.log(">>> options", options);
    const secret = config.jwtSecret;
    if (!secret){
      var error = new Error("jwt secret has not been configured");
      error.statusCode = 500;
      cb(error);
      return;
    }
    const token = options.accessToken;
    if (!token && !token.id) {
      const error = new Error("Authorization Required");
      error.statusCode = 401;
      error.name = "Error"
      error.code = "AUTHORIZATION_REQUIRED"
      cb(error);
      return;
    }
    const userId = token && token.userId;

      const UserIdentity = app.models.UserIdentity;
      UserIdentity.findOne({
        where: {
          userId: userId
        }
    }, function(err, instance) {
      console.log(">>> UI", instance);
      var groups = instance && instance.profile && instance.profile.accessGroups;
        if (!groups) {
            groups = [];
        }
      const payload = {
        username: userId,
        groups: groups,
      }
      const jwtString = jwt.sign(payload, secret, signAndVerifyOptions);
      cb(null, jwtString);
    })
  };
  
  User.remoteMethod(
    'jwt', {
      accepts: [
        {
          arg: 'options',
          type: 'object',
          http: 'optionsFromRequest'
        },
    ],
      returns: {
        arg: 'jwt',
        type: 'string'
      }
    }
  );
};