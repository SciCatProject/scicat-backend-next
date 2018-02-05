var app = require('../../server/server');
var moment = require('moment-timezone');
var exports = module.exports = {};
// Utility function to transfer size information from the datablock storage to the related dataset

// Just a hint
// Some loopback magic requires to call toObject() on ctx.instance to get access to the real instance
// however when accessing the attributes, e.g. in an expression line ctx.instance.datasetId
// this translation is done automatically behind the scenes. One could use a line
// like the following to make this more explicit
// var block = ctx.instance.toObject()


exports.transferSizeToDataset = function(obj, sizeField, ctx, next) {
    if (ctx.instance) {
        // get all current objects connected to the same dataset
        if (ctx.instance.datasetId !== undefined) {
            const datasetId = decodeURIComponent(ctx.instance.datasetId)
            // get all current datablocks connected to the same dataset
            var filter = {
                where: {
                    datasetId: datasetId
                },
                fields: {
                    [sizeField]: true
                }
            }
            obj.find(filter, ctx.options).then(instances => {
                var total = instances.reduce(function(sum, value) {
                    return sum + value[sizeField]
                }, 0);

                var Dataset = app.models.Dataset
                Dataset.findById(datasetId, null, ctx.options).then(instance => {
                    if (instance) {
                        instance.updateAttributes({
                            [sizeField]: total
                        }, function(err, instance) {
                            if (err) {
                                var error = new Error();
                                error.statusCode = 403;
                                error.message = err;
                                next(error)
                            } else {
                                next()
                            }
                        })
                    } else {
                        var error = new Error();
                        error.statusCode = 404;
                        error.message = "No dataset found with pid " + datasetId
                        next(error)

                    }
                })

            })
        } else {
            console.log('%s: Error: Instance %j has no datasetId defined', new Date(), ctx.instance);
            var error = new Error();
            error.statusCode = 417;
            error.message = 'DatasetId must be defined';
            next(error)
        }
    } else {
        next()
    }
}

// transform date strings in all fields with key dateKeys to updateTimesToUTC
// do nothing if input values are already UTC

exports.updateTimesToUTC = function(dateKeys, instance) {
    dateKeys.map(function(dateKey) {
        if (instance[dateKey]) {
            // console.log("Updating old ", dateKey, instance[dateKey])
            instance[dateKey] = moment.tz(instance[dateKey], moment.tz.guess()).format()
            // console.log("New time:", instance[dateKey])
        }
    });
}

// dito but for array of instances
exports.updateAllTimesToUTC = function(dateKeys, instances) {
    dateKeys.map(function(dateKey) {
        // console.log("Updating all time field %s to UTC for %s instances:", dateKey, instances.length)
        instances.map(function(instance) {
            if (instance[dateKey]) {
                // console.log("Updating old ",dateKey,instance[dateKey])
                instance[dateKey] = moment.tz(instance[dateKey], moment.tz.guess()).format()
                // console.log("New time:",instance[dateKey])
            }
        })
    });
}
