"use strict";

const superagent = require("superagent");
const config = require("../../server/config.local");

let logbookEnabled, scichatBaseUrl, scichatUser, scichatPass;

checkConfigProperties();

logbookEnabled = true;
scichatBaseUrl = "localhost:3030/api";
scichatUser = "logbookReader";
scichatPass = "logrdr";

module.exports = function(Logbook) {
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
                console.error(err);
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
                return fetchResponse.body;
            } catch (err) {
                console.error(err);
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
            try {
                const accessToken = await scichatLogin(
                    scichatUser,
                    scichatPass
                );
                const fetchResponse = await superagent.get(
                    scichatBaseUrl +
                        `/Logbooks/${name}/${filter}?access_token=${accessToken}`
                );
                return fetchResponse.body;
            } catch (err) {
                console.error(err);
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
        console.error(err);
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
