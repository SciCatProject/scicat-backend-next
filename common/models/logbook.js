"use strict";

module.exports = function(Logbook) {
    /**
     * Find Logbook model instance by name
     * @param {string} name The name of the Logbook
     */

    Logbook.findByName = function(name) {
        return Logbook.find({ where: { name: name } });
    };
};
