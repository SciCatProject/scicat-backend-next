module.exports = function (app) {
    const jwt = require("jsonwebtoken");
    const config = require("../../server/config.json");
    const signAndVerifyOptions = {
        expiresIn: config.jwtExpiresIn || "1h",
    };

    const User = app.models.User;

    User.jwt = async function (options) {
        console.log(">>> options", options);
        try {
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

            const userId = token && token.userId;

            const UserIdentity = app.models.UserIdentity;
            const instance = UserIdentity.findOne({ where: { userId } });
            console.log(">>> UI", instance);
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
        } catch (err) {
            throw err;
        }
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
