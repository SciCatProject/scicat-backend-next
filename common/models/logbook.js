"use strict";

const superagent = require("superagent");

const scichatBaseUrl = "http://localhost:3030/api";

module.exports = function(Logbook) {
    /**
     * Find Logbook model instance
     * @param {string} name Name of the Logbook
     */

    Logbook.findByName = function(name) {
        return superagent
            .get(scichatBaseUrl + `/logbooks/${name}`)
            .then(response => {
                return new Promise((resolve, reject) => {
                    resolve(response.body);
                });
            })
            .catch(err => {
                console.error(err);
            });
    };
};
