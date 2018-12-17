module.exports = function(app) {
  const jwt  = require('jsonwebtoken');
  var dotenv = require("dotenv");
  dotenv.config();

  const signAndVerifyOptions = {
    issuer:  process.env.issuer,
    subject:  process.env.subject,
    audience:  process.env.audience,
    expiresIn:  process.env.expiresIn,
    algorithm:  process.env.algorithm
  };

  const User = app.models.User;
  const secret = process.env.secret;

  User.jwt = function(ctx, cb) {
    const token = ctx.options && ctx.options.accessToken;
    const userId = token && token.userId;

      const UserIdentity = app.models.UserIdentity;
      UserIdentity.findOne({
        where: {
          userId: userId
        }
    }, function(err, instance) {
      var groups = instance && instance.profile && instance.profile.accessGroups;
        if (!groups) {
            groups = []
        }
      const payload = {
        username: userId,
        groups: groups,
      }
      const jwtString = jwt.sign(payload, secret, signAndVerifyOptions);
      console.log("JWT verification result: " + JSON.stringify(jwt.verify(jwtString, secret, signAndVerifyOptions)));
      cb(null, jwtString);
    })
  };
  
  User.remoteMethod(
    'jwt', {
      accepts: [
        {
          arg: 'options',
          type: 'object',
          http: { source: 'context' }
        },
    ],
      returns: {
        arg: 'jwt',
        type: 'string'
      }
    }
  );
};