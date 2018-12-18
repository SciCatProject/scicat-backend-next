module.exports = function(app) {
  const jwt  = require('jsonwebtoken');
  const config = require('../../server/config.json');
  const signAndVerifyOptions = {
    expiresIn: config.jwtExpiresIn,
  };

  const User = app.models.User;
  const secret = config.jwtSecret;

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