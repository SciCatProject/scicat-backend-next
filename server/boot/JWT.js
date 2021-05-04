"use strict";

module.exports = function (app) {
  const jwt = require("jsonwebtoken");
  const config = require("../../server/config.json");
  const signAndVerifyOptions = {
    expiresIn: config.jwtExpiresIn || "1h",
  };

  const User = app.models.User;

  User.jwt = async function (options) {
    const secret = config.jwtSecret;
    if (!secret) {
      const error = new Error("jwt secret has not been configured");
      error.statusCode = 500;
      throw error;
    }
    const token = options.accessToken;
    if (!token) {
      const groups = ["public"];
      const payload = {
        username: "anonymous",
        groups,
      };
      const jwtString = jwt.sign(
        payload,
        secret,
        signAndVerifyOptions
      );
      return jwtString;
    }
    // by this point, token is true
    const userId = token.userId;

    const UserIdentity = app.models.UserIdentity;
    const instance = await UserIdentity.findOne({ where: { userId } });
    let groups =
                instance && instance.profile && instance.profile.accessGroups;
    if (!groups) {
      groups = [];
    }
    const payload = {
      username: userId,
      groups,
    };
    const jwtString = jwt.sign(payload, secret, signAndVerifyOptions);
    return jwtString;
  };

  User.remoteMethod("jwt", {
    accepts: [
      {
        arg: "options",
        type: "object",
        http: "optionsFromRequest",
      },
    ],
    returns: {
      arg: "jwt",
      type: "string",
    },
  });
};
