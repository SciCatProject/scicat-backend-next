"use strict";

const superagent = require("superagent");

const scichatHost = "localhost";
const scichatPort = "3030";
const scichatBaseUrl = `http://${scichatHost}:${scichatPort}/api`;

module.exports = function(Logbook) {
    /**
     * Find Logbook model instance
     * @param {string} name Name of the Logbook
     * @returns {Logbook} Logbook model instance
     */

    Logbook.findByName = function(name) {
        return superagent
            .get(scichatBaseUrl + `/Logbooks/${name}`)
            .then(response => {
                return Promise.resolve(response.body);
            })
            .catch(err => {
                console.error(err);
            });
    };

    /**
     * Find all Logbook model instances
     * @returns {Logbook[]} Array of Logbook model instances
     */

    Logbook.findAll = function() {
        return superagent
            .get(scichatBaseUrl + "/Logbooks")
            .then(response => {
                return Promise.resolve(response.body);
            })
            .catch(err => {
                console.error(err);
            });
    };

    /**
     * Filter Logbook entries matching query
     * @param {string} name The name of the Logbook
     * @param {string} filter Filter JSON object, keys: textSearch, showBotMessages, showUserMessages, showImages
     * @returns {Logbook} Filtered Logbook model instance
     */

    Logbook.filter = function(name, filter) {
        return superagent
            .get(scichatBaseUrl + `/Logbooks/${name}/${filter}`)
            .then(response => {
                return Promise.resolve(response.body);
            })
            .catch(err => {
                console.error(err);
            });
    };
};
