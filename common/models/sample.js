"use strict";

const config = require("../../server/config.local");
const logger = require("../logger");
const utils = require("./utils");

module.exports = function (Sample) {
  Sample.beforeRemote(
    "prototype.patchAttributes",
    function (ctx, unused, next) {
      if ("sampleCharacteristics" in ctx.args.data) {
        const { sampleCharacteristics } = ctx.args.data;
        Object.keys(sampleCharacteristics).forEach((key) => {
          if (sampleCharacteristics[key].unit.length > 0) {
            const { value, unit } = sampleCharacteristics[key];
            const { valueSI, unitSI } = utils.convertToSI(
              value,
              unit
            );
            sampleCharacteristics[key] = {
              ...sampleCharacteristics[key],
              valueSI,
              unitSI,
            };
          }
        });
      }
      next();
    }
  );

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
            if (err) {
              return reject(err);
            }
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
};
