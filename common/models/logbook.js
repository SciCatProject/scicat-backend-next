"use strict";

const app = require("../../server/server");
const superagent = require("superagent");
const rison = require("rison");
const config = require("../../server/config.local");
const logger = require("../logger");

const logbookEnabled =
    config.logbook && config.logbook.enabled ? config.logbook.enabled : false;
const baseUrl =
    config.logbook && config.logbook.baseUrl
      ? config.logbook.baseUrl
      : "http://localhost:3030/scichatapi";
const username =
    config.logbook && config.logbook.username ? config.logbook.username : "";
const password =
    config.logbook && config.logbook.password ? config.logbook.password : "";

module.exports = function (Logbook) {
  Logbook.afterRemote("find", async function (ctx, logbooks) {
    const { userId } = ctx.req.accessToken;
    const proposalIds = await getUserProposalIds(userId);
    ctx.result = logbooks
      ? logbooks.filter(({ name }) => proposalIds.includes(name))
      : [];
    return;
  });

  Logbook.afterRemote("findByName", async function (ctx, logbook) {
    const { userId } = ctx.req.accessToken;
    const proposalIds = await getUserProposalIds(userId);
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
        const accessToken = await login(username, password);
        logger.logInfo("Fetching Logbooks", {});
        const res = await superagent
          .get(baseUrl + "/Logbooks")
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
        const logbooks = nonEmptyLogbooks.concat(emptyLogbooks);
        logger.logInfo("Found Logbooks", { count: logbooks.length });
        return logbooks;
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

  Logbook.findByName = async function (name, filters) {
    if (logbookEnabled) {
      try {
        const accessToken = await login(username, password);
        const decodedFilters = filters
          ? rison.decode_object(filters)
          : undefined;
        console.log("Fetching logbook", { name, filters });
        const res = await superagent
          .get(
            baseUrl +
                            `/Logbooks/${name}?filter=${JSON.stringify(
                              decodedFilters
                            )}`
          )
          .set({ Authorization: `Bearer ${accessToken}` });
        logger.logInfo("Found Logbook", { name });
        const { skip, limit, sortField } = decodedFilters;
        logger.logInfo("Applying filters", { skip, limit, sortField });
        if (!!sortField && sortField.indexOf(":") > 0) {
          res.body.messages = sortMessages(
            res.body.messages,
            sortField
          );
        }
        if (skip >= 0 && limit >= 0) {
          const end = skip + limit;
          const messages = res.body.messages.slice(skip, end);
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
     * Send message to a Logbook
     * @param {string} name Name of the Logbook
     * @param {object} data JSON object with the key `message`
     * @returns {object} Object containing the event id of the message
     */

  Logbook.sendMessage = async function (name, data) {
    if (logbookEnabled) {
      try {
        const accessToken = await login(username, password);
        console.log("Sending message", { name, data });
        const res = await superagent
          .post(baseUrl + `/Logbooks/${name}/message`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send(data);
        logger.logInfo("Message sent", { name, eventId: res.body.event_id });
        return res.body;
      } catch (err) {
        logger.logError(err.message, {
          location: "Logbook.sendMessage",
          name,
          data,
        });
      }
    }
    return [];
  };
};

/**
 * Sign in to Scichat
 * @param {string} username Username of Scichat user
 * @param {string} password Password of Scichat user
 * @returns {string} Scichat access token
 */

async function login(username, password) {
  const credentials = { username, password };
  try {
    const res = await superagent
      .post(baseUrl + "/Users/login")
      .send(credentials);
    return res.body.token;
  } catch (err) {
    logger.logError(err.message, { username });
  }
}

/**
 * Get ids of proposals that the user has permissions to view
 * @param {string} userId Id of current user
 * @returns {string[]} Array of proposalIds
 */

async function getUserProposalIds(userId) {
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
