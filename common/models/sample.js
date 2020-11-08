"use strict";
var ds = require("./sample.json");
var own = require("./ownable.json");
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

    // TODO simplify the isPublished handling, bring it into one location
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
};
