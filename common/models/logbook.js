"use strict";

const app = require("../../server/server");
const superagent = require("superagent");
const rison = require("rison");
const config = require("../../server/config.local");
const logger = require("../logger");

let logbookEnabled, scichatBaseUrl, scichatUser, scichatPass;

checkConfigProperties();

module.exports = function(Logbook) {
    Logbook.afterRemote("findAll", async function(ctx, logbooks) {
        const { userId } = ctx.req.accessToken;
        const User = app.models.User;
        const UserIdentity = app.models.UserIdentity;
        const ShareGroup = app.models.ShareGroup;
        const RoleMapping = app.models.RoleMapping;
        const Role = app.models.Role;
        const Proposal = app.models.Proposal;

        let options = {};

        try {
            const user = await User.findById(userId);
            options.currentUser = user.username;
            options.currentUserEmail = user.email;

            const userIdentity = await UserIdentity.findOne({
                where: { userId }
            });
            if (!!userIdentity) {
                let groups = [];
                if (userIdentity.profile) {
                    options.currentUser = userIdentity.profile.username;
                    options.currentUserEmail = userIdentity.profile.email;
                    groups = userIdentity.profile.accessGroups;
                    if (!groups) {
                        groups = [];
                    }
                    const regex = new RegExp(userIdentity.profile.email, "i");

                    const shareGroup = await ShareGroup.find({
                        where: { members: { regexp: regex } }
                    });
                    groups = [
                        ...groups,
                        ...shareGroup.map(({ id }) => String(id))
                    ];
                    options.currentGroups = groups;
                } else {
                    options.currentGroups = groups;
                }
            } else {
                const roleMapping = await RoleMapping.find(
                    { where: { principalId: String(userId) } },
                    options
                );
                const roleIdList = roleMapping.map(instance => instance.roleId);

                const role = await Role.find({
                    where: { id: { inq: roleIdList } }
                });
                const roleNameList = role.map(instance => instance.name);
                roleNameList.push(user.username);
                options.currentGroups = roleNameList;
            }

            const proposals = await Proposal.fullquery({}, {}, options);
            const proposalIds = proposals.map(proposal => proposal.proposalId);
            ctx.result = logbooks.filter(({ name }) =>
                proposalIds.includes(name)
            );
            return;
        } catch (err) {
            logger.logError(err.message, {
                location: "Logbook.afterRemote.findAll"
            });
            return;
        }
    });

    /**
     * Find Logbook model instance
     * @param {string} name Name of the Logbook
     * @returns {Logbook} Logbook model instance
     */

    Logbook.findByName = async function(name) {
        if (logbookEnabled) {
            try {
                const accessToken = await scichatLogin(
                    scichatUser,
                    scichatPass
                );
                const fetchResponse = await superagent.get(
                    scichatBaseUrl +
                        `/Logbooks/${name}?access_token=${accessToken}`
                );
                return fetchResponse.body;
            } catch (err) {
                logger.logError(err.message, {
                    location: "Logbook.findByName",
                    name
                });
            }
        } else {
            return [];
        }
    };

    /**
     * Find all Logbook model instances
     * @returns {Logbook[]} Array of Logbook model instances
     */

    Logbook.findAll = async function() {
        if (logbookEnabled) {
            try {
                const accessToken = await scichatLogin(
                    scichatUser,
                    scichatPass
                );
                const fetchResponse = await superagent.get(
                    scichatBaseUrl + `/Logbooks?access_token=${accessToken}`
                );
                const nonEmptyLogbooks = fetchResponse.body.filter(
                    logbook => logbook.messages.length !== 0
                );
                const emptyLogbooks = fetchResponse.body.filter(
                    logbook => logbook.messages.length === 0
                );
                nonEmptyLogbooks
                    .sort(
                        (a, b) =>
                            a.messages[a.messages.length - 1].origin_server_ts -
                            b.messages[b.messages.length - 1].origin_server_ts
                    )
                    .reverse();
                return nonEmptyLogbooks.concat(emptyLogbooks);
            } catch (err) {
                logger.logError(err.message, { location: "Logbook.findAll" });
            }
        } else {
            return [];
        }
    };

    /**
     * Filter Logbook entries matching query
     * @param {string} name The name of the Logbook
     * @param {string} filter Filter JSON object, keys: textSearch, showBotMessages, showUserMessages, showImages
     * @returns {Logbook} Filtered Logbook model instance
     */

    Logbook.filter = async function(name, filter) {
        if (logbookEnabled) {
            const { skip, limit } = rison.decode_object(filter);
            try {
                const accessToken = await scichatLogin(
                    scichatUser,
                    scichatPass
                );
                const fetchResponse = await superagent.get(
                    scichatBaseUrl +
                        `/Logbooks/${name}/${filter}?access_token=${accessToken}`
                );
                if (skip >= 0 && limit >= 0) {
                    const end = skip + limit;
                    const messages = fetchResponse.body.messages.slice(
                        skip,
                        end
                    );
                    return { ...fetchResponse.body, messages };
                } else {
                    return fetchResponse.body;
                }
            } catch (err) {
                logger.logError(err.message, {
                    location: "Logbook.filter",
                    name,
                    filter
                });
            }
        } else {
            return [];
        }
    };
};

/**
 * Sign in to Scichat
 * @param {string} username Username of Scichat user
 * @param {string} password Password of Scichat user
 * @returns {string} Scichat access token
 */

async function scichatLogin(username, password) {
    const userData = {
        username: username,
        password: password
    };
    try {
        const loginResponse = await superagent
            .post(scichatBaseUrl + "/Users/login")
            .send(userData);
        return loginResponse.body.id;
    } catch (err) {
        logger.logError(err.message, { username });
    }
}

function checkConfigProperties() {
    if (config.hasOwnProperty("logbookEnabled")) {
        logbookEnabled = config.logbookEnabled;
    } else {
        logbookEnabled = false;
    }

    if (config.hasOwnProperty("scichatURL")) {
        scichatBaseUrl = config.scichatURL;
    } else {
        scichatBaseUrl = "Url not available";
    }

    if (config.hasOwnProperty("scichatUser")) {
        scichatUser = config.scichatUser;
    } else {
        scichatUser = "scichatUser";
    }

    if (config.hasOwnProperty("scichatPass")) {
        scichatPass = config.scichatPass;
    } else {
        scichatPass = "scichatPass";
    }
}
