"use strict";

const superagent = require("superagent");


const scichatHost = "localhost";
const scichatPort = "3030";
const scichatBaseUrl = `http://${scichatHost}:${scichatPort}/api`;

module.exports = function(Logbook) {
    /**
     * Find Logbook model instance
     * @param {string} name Name of the Logbook
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
};
