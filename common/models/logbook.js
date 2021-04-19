"use strict";

const app = require("../../server/server");
const superagent = require("superagent");
const rison = require("rison");
const config = require("../../server/config.local");
const logger = require("../logger");

let logbookEnabled, scichatBaseUrl, scichatUser, scichatPass;

checkConfigProperties();

module.exports = function (Logbook) {
  Logbook.afterRemote("find", async function (ctx, logbooks) {
    const { userId } = ctx.req.accessToken;
    const proposalIds = await getUserProposals(userId);
    ctx.result = logbooks
      ? logbooks.filter(({ name }) => proposalIds.includes(name))
      : [];
    return;
  });

  Logbook.afterRemote("findByName", async function (ctx, logbook) {
    const { userId } = ctx.req.accessToken;
    const proposalIds = await getUserProposals(userId);
    ctx.result = proposalIds.includes(logbook.name) ? logbook : null;
    return;
  });

  Logbook.afterRemote("findAll", async function (ctx, logbooks) {
    const { userId } = ctx.req.accessToken;
    const proposalIds = await getUserProposals(userId);
    ctx.result = logbooks
      ? logbooks.filter(({ name }) => proposalIds.includes(name))
      : [];
    return;
  });

  Logbook.afterRemote("filter", async function (ctx, logbook) {
    const { userId } = ctx.req.accessToken;
    const proposalIds = await getUserProposals(userId);
    ctx.result = proposalIds.includes(logbook.name) ? logbook : null;
    return;
  });

  /**
     * Find Logbook model instances
     * @returns {Logbook[]} Array of Logbook model instances
     */

  Logbook.find = async function () {
    if (logbookEnabled) {
      try {
        const accessToken = await login(scichatUser, scichatPass);
        const res = await superagent
          .get(scichatBaseUrl + "/Logbooks")
          .set({ Authorization: `Bearer ${accessToken}` });
        const nonEmptyLogbooks = res.body.filter(
          (logbook) => logbook.messages.length !== 0
        );
        const emptyLogbooks = res.body.filter(
          (logbook) => logbook.messages.length === 0
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
        logger.logError(err.message, { location: "Logbook.find" });
      }
    }
    return [];
  };

  /**
 * Find Logbook model instance by name
 * @param {string} name Name of the Logbook
 * @param {string} filters Filter rison object, keys: textSearch, showBotMessages, showUserMessages, showImages, skip, limit, sortField
 * @returns {Logbook} Logbook model instance
 */

  Logbook.findByName = async function(name, filters) {
    if (logbookEnabled) {
      try {
        const accessToken = await login(scichatUser, scichatPass);
        const decodedFilters = filters ? rison.decode_object(filters) : undefined;
        const res = await superagent
          .get(scichatBaseUrl + `/Logbooks/${name}?filters=${decodedFilters}`)
          .set({ Authorization: `Bearer ${accessToken}` });
        const { skip, limit, sortField } = decodedFilters;
        if (!!sortField && sortField.indexOf(":") > 0) {
          res.body.messages = sortMessages(
            res.body.messages,
            sortField
          );
        }
        if (skip >= 0 && limit >= 0) {
          const end = skip + limit;
          const messages = res.body.messages.slice(
            skip,
            end
          );
          return { ...res.body, messages };
        }
        return res.body;
      } catch (err) {
        logger.logError(err.message, {
          location: "Logbook.findByName",
          name,
          filters,
        });
      }
    }
    return [];
  };

  /**
     * Find Logbook model instance
     * @param {string} name Name of the Logbook
     * @returns {Logbook} Logbook model instance
     */

  // Logbook.findByName = async function (name) {
  //   if (logbookEnabled) {
  //     try {
  //       const accessToken = await scichatLogin(
  //         scichatUser,
  //         scichatPass
  //       );
  //       const fetchResponse = await superagent.get(
  //         scichatBaseUrl +
  //                       `/Logbooks/${name}?access_token=${accessToken}`
  //       );
  //       return fetchResponse.body;
  //     } catch (err) {
  //       logger.logError(err.message, {
  //         location: "Logbook.findByName",
  //         name,
  //       });
  //     }
  //   } else {
  //     return [];
  //   }
  // };

  /**
     * Filter Logbook entries matching query
     * @param {string} name The name of the Logbook
     * @param {string} filters Filter rison object, keys: textSearch, showBotMessages, showUserMessages, showImages, skip, limit, sortField
     * @returns {Logbook} Filtered Logbook model instance
     */

  // Logbook.filter = async function (name, filters) {
  //   if (logbookEnabled) {
  //     try {
  //       const accessToken = await scichatLogin(
  //         scichatUser,
  //         scichatPass
  //       );
  //       const fetchResponse = await superagent.get(
  //         scichatBaseUrl +
  //                       `/Logbooks/${name}/${filters}?access_token=${accessToken}`
  //       );
  //       const { skip, limit, sortField } = rison.decode_object(filters);
  //       if (!!sortField && sortField.indexOf(":") > 0) {
  //         fetchResponse.body.messages = sortMessages(
  //           fetchResponse.body.messages,
  //           sortField
  //         );
  //       }
  //       if (skip >= 0 && limit >= 0) {
  //         const end = skip + limit;
  //         const messages = fetchResponse.body.messages.slice(
  //           skip,
  //           end
  //         );
  //         return { ...fetchResponse.body, messages };
  //       } else {
  //         return fetchResponse.body;
  //       }
  //     } catch (err) {
  //       logger.logError(err.message, {
  //         location: "Logbook.filter",
  //         name,
  //         filters,
  //       });
  //     }
  //   } else {
  //     return [];
  //   }
  // };

  /**
     * Send message to logbook
     * @param {string} name The name of the logbook
     * @param {object} data JSON object with the key `message`
     * @returns {object} Object containing the event id of the message
     */

  // Logbook.sendMessage = async function (name, data) {
  //   if (logbookEnabled) {
  //     try {
  //       const accessToken = await scichatLogin(
  //         scichatUser,
  //         scichatPass
  //       );
  //       const response = await superagent
  //         .post(
  //           scichatBaseUrl +
  //                           `/Rooms/${name}/message?access_token=${accessToken}`
  //         )
  //         .send(data);
  //       return response.body;
  //     } catch (err) {
  //       logger.logError(err.message, {
  //         location: "Logbook.sendMessage",
  //         name,
  //         data,
  //       });
  //     }
  //   } else {
  //     return [];
  //   }
  // };
};

async function login(username, password) {
  const credentials = { username, password };
  try {
    const res = await superagent
      .post(scichatBaseUrl + "/Users/login")
      .send(credentials);
    return res.body.token;
  } catch (err) {
    logger.logError(err.message, { username });
  }
}

/**
 * Sign in to Scichat
 * @param {string} username Username of Scichat user
 * @param {string} password Password of Scichat user
 * @returns {string} Scichat access token
 */

async function scichatLogin(username, password) {
  const userData = {
    username: username,
    password: password,
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

/**
 * Get ids of proposals that the user has permissions to view
 * @param {string} userId Id of current user
 * @returns {string[]} Array of proposalIds
 */

async function getUserProposals(userId) {
  const User = app.models.User;
  const UserIdentity = app.models.UserIdentity;
  const ShareGroup = app.models.ShareGroup;
  const RoleMapping = app.models.RoleMapping;
  const Role = app.models.Role;
  const Proposal = app.models.Proposal;

  let options = {};

  try {
    const user = await User.findById(userId);
    const userIdentity = await UserIdentity.findOne({
      where: { userId },
    });

    if (userIdentity) {
      options.currentGroups = [];
      if (userIdentity.profile) {
        let groups = userIdentity.profile.accessGroups;
        if (!groups) {
          groups = [];
        }
        const regex = new RegExp(userIdentity.profile.email, "i");

        const shareGroup = await ShareGroup.find({
          where: { members: { regexp: regex } },
        });
        groups = [...groups, ...shareGroup.map(({ id }) => String(id))];
        options.currentGroups = groups;
      }
    } else {
      const roleMapping = await RoleMapping.find(
        { where: { principalId: String(userId) } },
        options
      );
      const roleIdList = roleMapping.map((instance) => instance.roleId);

      const role = await Role.find({
        where: { id: { inq: roleIdList } },
      });
      const roleNameList = role.map((instance) => instance.name);
      roleNameList.push(user.username);
      options.currentGroups = roleNameList;
    }

    const proposals = await Proposal.find({
      where: { ownerGroup: { inq: options.currentGroups } },
    });
    return proposals.map((proposal) => proposal.proposalId);
  } catch (err) {
    logger.logError(err.message, {
      location: "Logbook.getUserProposals",
      userId,
      options,
    });
  }
}

function sortMessages(messages, sortField) {
  const [column, direction] = sortField.split(":");
  const sorted = messages.sort((a, b) => {
    switch (column) {
    case "timestamp": {
      return a.origin_server_ts - b.origin_server_ts;
    }
    case "sender": {
      if (a.sender.replace("@", "") < b.sender.replace("@", "")) {
        return -1;
      }
      if (a.sender.replace("@", "") > b.sender.replace("@", "")) {
        return 1;
      }
      return 0;
    }
    case "entry": {
      if (a.content.body < b.content.body) {
        return -1;
      }
      if (a.content.body > b.content.body) {
        return 1;
      }
      return 0;
    }
    }
  });
  switch (direction) {
  case "asc": {
    return sorted;
  }
  case "desc": {
    return sorted.reverse();
  }
  }
}

function checkConfigProperties() {
  if (Object.prototype.hasOwnProperty.call(config, "logbookEnabled")) {
    logbookEnabled = config.logbookEnabled;
  } else {
    logbookEnabled = false;
  }

  if (Object.prototype.hasOwnProperty.call(config, "scichatURL")) {
    scichatBaseUrl = config.scichatURL;
  } else {
    scichatBaseUrl = "Url not available";
  }

  if (Object.prototype.hasOwnProperty.call(config, "scichatUser")) {
    scichatUser = config.scichatUser;
  } else {
    scichatUser = "scichatUser";
  }

  if (Object.prototype.hasOwnProperty.call(config, "scichatPass")) {
    scichatPass = config.scichatPass;
  } else {
    scichatPass = "scichatPass";
  }
}
