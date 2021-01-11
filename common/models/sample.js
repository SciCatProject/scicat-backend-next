"use strict";

const config = require("../../server/config.local");
const ds = require("./sample.json");
const own = require("./ownable.json");
const logger = require("../logger");
const math = require("mathjs");

module.exports = function(Sample) {
    function searchExpression(key, value) {
        let type = "string";
        if (key in ds.properties) {
            type = ds.properties[key].type;
        } else if (key in own.properties) {
            type = own.properties[key].type;
        }
        if (key === "text") {
            return {
                $search: value,
                $language: "none"
            };
        } else if (type === "string") {
            if (value.constructor === Array) {
                if (value.length == 1) {
                    return value[0];
                } else {
                    return {
                        $in: value
                    };
                }
            } else {
                return value;
            }
        } else if (type === "date") {
            return {
                $gte: new Date(value.begin),
                $lte: new Date(value.end)
            };
        } else if (type === "boolean") {
            return {
                $eq: value
            };
        } else if (type.constructor === Array) {
            return {
                $in: value
            };
        }
    }

<<<<<<< HEAD
    // TODO simplify the isPublished handling, bring it into one location
=======
    Sample.beforeRemote("prototype.patchAttributes", function (
        ctx,
        unused,
        next
    ) {
        if ("sampleCharacteristics" in ctx.args.data) {
            const { sampleCharacteristics } = ctx.args.data;
            Object.keys(sampleCharacteristics).forEach((key) => {
                if (sampleCharacteristics[key].type === "measurement") {
                    const { value, unit } = sampleCharacteristics[key];
                    const { valueSI, unitSI } = convertToSI(value, unit);
                    sampleCharacteristics[key] = {
                        ...sampleCharacteristics[key],
                        valueSI,
                        unitSI,
                    };
                }
            });
        }
        next();
    });

>>>>>>> develop
    Sample.afterRemote("find", function (ctx, modelInstance, next) {
        const accessToken = ctx.args.options.accessToken;
        if (!accessToken) {
            if (ctx.result) {
                let answer;
                if (Array.isArray(modelInstance)) {
                    answer = [];
                    ctx.result.forEach(function (result) {
                        if (result["isPublished"] === true) {
                            answer.push(result);
                        }
                    });
                } else {
                    if (ctx.result["isPublished"] === true) {
                        answer = ctx.result;
                    }
                }
                ctx.result = answer;
            }
        }
        next();
    });

    /**
     * Get a list of sample characteristic keys
     * @param {object} fields Define the filter conditions by specifying the name of values of fields requested. There is also support for a `text` search to look for strings anywhere in the sample.
     * @param {object} limits Define further query parameters like skip, limit, order
     * @param {object} options
     * @returns {string[]} Array of metadata keys
     */

    Sample.metadataKeys = async function (fields, limits, options) {
        try {
            const blacklist = [new RegExp(".*_date")];
            const returnLimit = config.metadataKeysReturnLimit;
            const { metadataKey } = fields;

            // ensure that no more than MAXLIMIT samples are read for metadata key extraction
            let MAXLIMIT;
            if (config.metadataParentInstancesReturnLimit) {
                MAXLIMIT = config.metadataParentInstancesReturnLimit;

                let lm = {};

                if (limits) {
                    lm = JSON.parse(JSON.stringify(limits));
                }

                if (!lm.limit) {
                    lm.limit = MAXLIMIT;
                }

                if (lm.limit && lm.limit > MAXLIMIT) {
                    lm.limit = MAXLIMIT;
                }

                limits = lm;
            }

            logger.logInfo("Fetching metadataKeys", {
                fields,
                limits,
                options,
                blacklist: blacklist.map((item) => item.toString()),
                returnLimit,
            });

            let samples;
            try {
                samples = await new Promise((resolve, reject) => {
                    Sample.fullquery(fields, limits, options, (err, res) => {
                        resolve(res);
                    });
                });
            } catch (err) {
                logger.logError(err.message, {
                    location: "Sample.metadataKeys.samples",
                    fields,
                    limits,
                    options,
                });
            }

            if (samples.length > 0) {
                logger.logInfo("Found samples", { count: samples.length });
            } else {
                logger.logInfo("No samples found", { samples });
            }

            const metadata = samples.map((sample) =>
                sample.sampleCharacteristics
                    ? Object.keys(sample.sampleCharacteristics)
                    : []
            );

            logger.logInfo("Raw metadata array", {
                count: metadata.length,
            });

            // Flatten array, ensure uniqueness of keys and filter out
            // blacklisted keys
            const metadataKeys = [].concat
                .apply([], metadata)
                .reduce((accumulator, currentValue) => {
                    if (accumulator.indexOf(currentValue) === -1) {
                        accumulator.push(currentValue);
                    }
                    return accumulator;
                }, [])
                .filter((key) => !blacklist.some((regex) => regex.test(key)));

            logger.logInfo("Curated metadataKeys", {
                count: metadataKeys.length,
            });

            if (metadataKey && metadataKey.length > 0) {
                return metadataKeys
                    .filter((key) =>
                        key.toLowerCase().includes(metadataKey.toLowerCase())
                    )
                    .slice(0, returnLimit);
            }

            return metadataKeys.slice(0, returnLimit);
        } catch (err) {
            logger.logError(err.message, { location: "Sample.metadataKeys" });
        }
    };

    function convertToSI(value, unit) {
        const quantity = math
            .unit(value, unit)
            .toSI()
            .toString();
        const convertedValue = quantity.substring(0, quantity.indexOf(" "));
        const convertedUnit = quantity.substring(quantity.indexOf(" ") + 1);
        return { valueSI: Number(convertedValue), unitSI: convertedUnit };
    }

    function generateCharacteristicExpression({ lhs, relation, rhs, unit }) {
        let match = {
            $and: []
        };
        const matchKeyGeneric = `sampleCharacteristics.${lhs}.value`;
        const matchKeyMeasurement = `sampleCharacteristics.${lhs}.valueSI`;
        const matchUnit = `sampleCharacteristics.${lhs}.unitSI`;
        switch (relation) {
            case "EQUAL_TO_STRING": {
                match.$and.push({
                    [matchKeyGeneric]: { $eq: rhs }
                });
                break;
            }
            case "EQUAL_TO_NUMERIC": {
                if (unit.length > 0) {
                    const { valueSI, unitSI } = convertToSI(rhs, unit);
                    match.$and.push({
                        [matchKeyMeasurement]: { $eq: valueSI }
                    });
                    match.$and.push({
                        [matchUnit]: { $eq: unitSI }
                    });
                } else {
                    match.$and.push({
                        [matchKeyGeneric]: { $eq: rhs }
                    });
                }
                break;
            }
            case "GREATER_THAN": {
                if (unit.length > 0) {
                    const { valueSI, unitSI } = convertToSI(rhs, unit);
                    match.$and.push({
                        [matchKeyMeasurement]: { $gt: valueSI }
                    });
                    match.$and.push({
                        [matchUnit]: { $eq: unitSI }
                    });
                } else {
                    match.$and.push({
                        [matchKeyGeneric]: { $gt: rhs }
                    });
                }
                break;
            }
            case "LESS_THAN": {
                if (unit.length > 0) {
                    const { valueSI, unitSI } = convertToSI(rhs, unit);
                    match.$and.push({
                        [matchKeyMeasurement]: { $lt: valueSI }
                    });
                    match.$and.push({
                        [matchUnit]: { $eq: unitSI }
                    });
                } else {
                    match.$and.push({
                        [matchKeyGeneric]: { $lt: rhs }
                    });
                }
                break;
            }
        }
        return match;
    }
};
