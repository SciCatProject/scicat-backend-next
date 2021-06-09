"use strict";

var app = require("../../server/server");
const config = require("../../server/config.local");
var moment = require("moment-timezone");
var exports = module.exports = {};
var nodemailer = require("nodemailer");
const math = require("mathjs");
const superagent = require("superagent");
// Utility function to transfer size information from the datablock storage to the related dataset

// Just a hint
// Some loopback magic requires to call toObject() on ctx.instance to get access to the real instance
// however when accessing the attributes, e.g. in an expression line ctx.instance.datasetId
// this translation is done automatically behind the scenes. One could use a line
// like the following to make this more explicit
// var block = ctx.instance.toObject()
// Note: Depending on the request PUT/POST etc either ctx.instance or ctx.currentInstance is set


exports.transferSizeToDataset = function (obj, sizeField, numFilesField, ctx, next) {
  var instance = ctx.instance;
  if (!instance) {
    instance = ctx.currentInstance;
  }
  if (instance) {
    if (instance.datasetId !== undefined) {
      const datasetId = instance.datasetId;
      var Dataset = app.models.Dataset;
      Dataset.findById(datasetId, ctx.options, function (err, datasetInstance) {
        if (err || !datasetInstance) {
          console.log("%s: Update size error: Instance %j can not be found. Could be access problem.", new Date(), instance.pid);
          var error = new Error();
          error.statusCode = 403;
          error.message = "DatasetId not found. Could be access rule problem - test accessGroups for id: " + instance.pid;
          next(error);
        } else {
          datasetInstance.updateSize(
            datasetId,
            sizeField,
            instance[sizeField],
            numFilesField,
            instance["dataFileList"].length,
            next
          );
        }
      });
    } else {
      console.log("%s: Error: Instance %j has no datasetId defined", new Date(), instance);
      var error = new Error();
      error.statusCode = 417;
      error.message = "DatasetId must be defined";
      next(error);
    }
  } else {
    next();
  }
};


// add ownerGroup field from linked Datasets
exports.addOwnerGroup = function (ctx, next) {
  var instance = ctx.instance;
  if (!instance) {
    instance = ctx.currentInstance;
  }
  if (instance) {
    //console.log("add ownergroup/accessgroup for instance:",instance)
    // get all current objects connected to the same dataset
    if (instance.datasetId !== undefined) {
      const datasetId = instance.datasetId;
      // check if ownerGroup is not yet defined, add it in this policyPublicationShiftInYears
      if (instance.ownerGroup == undefined) {
        var Dataset = app.models.Dataset;
        Dataset.findById(datasetId, ctx.options).then(datasetInstance => {
          // console.log("      adding ownerGroup:", datasetInstance.ownerGroup)
          // console.log("      adding accessGroups:", datasetInstance.accessGroups)
          instance.ownerGroup = datasetInstance.ownerGroup;
          instance.accessGroups = datasetInstance.accessGroups;
          // for partial updates the ownergroup must be added to ctx.data in order to be persisted
          if (ctx.data) {
            ctx.data.ownerGroup = datasetInstance.ownerGroup;
            ctx.data.accessGroups = datasetInstance.accessGroups;
          }
          next();
        });
      } else {
        next();
      }
    } else {
      console.log("%s: Error: Instance %j has no datasetId defined", new Date(), ctx.instance);
      var error = new Error();
      error.statusCode = 417;
      error.message = "DatasetId must be defined";
      next(error);
    }
  } else {
    next();
  }
};

exports.createNewFacetPipeline = function (name, type, query) {

  // console.log("facet pipeline: name,type,query",name,type,query)
  const pipeline = [];

  // undefined type means array
  if (typeof type === "undefined") {
    pipeline.push({
      $unwind: "$" + name
    });
  }
  // add all conditions from "other" facets, exclude own conditions
  if (query && Object.keys(query).length > 0) {
    //console.log("createFacet query:",query);
    var q = Object.assign({}, query);
    delete q[name];
    if (Object.keys(q).length > 0)
      pipeline.push({
        $match: q
      });
  }
  let grp = {
    $group: {
      _id: "$" + name,
      count: {
        $sum: 1
      }
    }
  };
  if (type === "date") {
    grp.$group._id = {
      year: {
        $year: "$" + name
      },
      month: {
        $month: "$" + name
      },
      day: {
        $dayOfMonth: "$" + name
      }
    };
  }
  pipeline.push(grp);
  const sort = {
    $sort: {
      _id: -1
    }
  };
  pipeline.push(sort);
  // console.log("Resulting pipeline:",pipeline)
  return pipeline;
};

// recursive function needed to call asynch calls inside a loop
function updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next) {
  // console.log("Inside updateDatasets, index,id:", index,datasetInstances[index])
  if (index < 0) {
    return next();
  } else {
    // modify ctx.data to keep embedded data
    ctx.data = JSON.parse(JSON.stringify(ctxdatacopy));
    if (ctx.data && ctx.data.datasetlifecycle) {
      const changes = JSON.parse(JSON.stringify(ctx.data.datasetlifecycle));
      ctx.data.datasetlifecycle = JSON.parse(JSON.stringify(datasetInstances[index].datasetlifecycle));
      // apply changes
      for (var k in changes) ctx.data.datasetlifecycle[k] = changes[k];
    }
    // do the real action
    var InitialDataset = app.models.InitialDataset;
    InitialDataset.findById(datasetInstances[index].pid, ctx.options, function (err, initialDatasetInstance) {
      if (err) {
        console.log("Error when searching for initial dataset:", err);
        return next();
      }
      if (!initialDatasetInstance) {
        InitialDataset.create(datasetInstances[index], function (err, _instance) {
          if (err) {
            console.log("Error when creating initial dataset: ", err);
          }
          console.log("      Created a dataset copy for pid:", datasetInstances[index].pid);
          updateHistory(ctx, datasetInstances, ctxdatacopy, index, next);
        });
      } else {
        //console.log("Inside updatedatasets, copy of initial state exists already")
        updateHistory(ctx, datasetInstances, ctxdatacopy, index, next);
      }
    });
  }
}

function updateHistory(ctx, datasetInstances, ctxdatacopy, index, next) {
  var Dataset = app.models.Dataset;
  Dataset.findById(datasetInstances[index].pid, ctx.options, function (err, datasetInstance) {
    // drop any history , e.g. from outside or from previous loop
    delete ctx.data.history;
    // ignore packedsize and size updates for history.
    // TODO: this ignores any update which contains these fields among other changes
    if (!ctx.data.size && !ctx.data.packedSize) {
      const { updatedAt, updatedBy, ...updatedFields } = ctxdatacopy;
      const historyItem = Object.assign({}, ctxdatacopy);
      Object.keys(updatedFields).forEach((updatedField) => {
        historyItem[updatedField] = {
          currentValue: ctxdatacopy[updatedField],
          previousValue: datasetInstance[updatedField],
        };
      });
      // the following triggers a before save hook . endless recursion must be prevented there
      // console.log("=====Calling create with ctx.data:", JSON.stringify(ctx.data, null, 3))
      datasetInstance.historyList.create(JSON.parse(JSON.stringify(historyItem).replace(/\$/g, "")), function (err, _instance) {
        if (err) {
          console.log("Saving auto history failed:", err);
        }
        if (config.logbook.enabled) {
          const Logbook = app.models.Logbook;
          const user = updatedBy.replace("ldap.", "");
          const datasetPid = datasetInstance.pid;
          const proposalId = datasetInstance.proposalId;
          Object.keys(updatedFields).forEach((updatedField) => {
            const message = `${user} updated "${updatedField}" of dataset with PID ${datasetPid}`;
            Logbook.sendMessage(proposalId, { message });
          });
        }
        //console.log("+++++++ After adding infos to history for dataset ", datasetInstance.pid, JSON.stringify(ctx.data, null, 3))
        index--;
        updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next);
      });
    } else {
      index--;
      updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next);
    }
  });
}


// this should then update the history in all affected documents
exports.keepHistory = function (ctx, next) {
  // create new message
  var Dataset = app.models.Dataset;

  // 4 different cases: (ctx.where:single/multiple instances)*(ctx.data: update of data/replacement of data)
  if (ctx.where && ctx.data) {
    // console.log(" Multiinstance update, where condition and data:", JSON.stringify(ctx.where, null, 4),JSON.stringify(ctx.data, null, 4))
    // do not keep history for status updates from jobs, because this can take much too long for large jobs
    if (ctx.data.$set) {
      return next();
    }
    Dataset.find({
      where: ctx.where
    }, ctx.options, function (err, datasetInstances) {
      // console.log("++++++ Inside keephistory: Found datasets to be updated:", JSON.stringify(datasetInstances, null, 3))
      // solve asynch call inside for loop by recursion
      let index = datasetInstances.length - 1;
      const ctxdatacopy = JSON.parse(JSON.stringify(ctx.data));
      updateDatasets(ctx, datasetInstances, ctxdatacopy, index, next);
    });
  }

  // single dataset, update
  if (!ctx.where && ctx.data) {
    console.log(" ===== Warning: single dataset update case without where condition is currently not treated:", ctx.data);
  }

  // single dataset, update
  if (!ctx.where && !ctx.data) {
    // console.log("single datasets and no update - should only happen if new document is created or if embedded object is updated")
    return next();
  }
  // single dataset, update
  if (ctx.where && !ctx.data) {
    // console.log("multiple datasets and no update")
    return next();
  }
};

/* Utility function for Remote hooks (not operation hooks) */

// transform date strings in all fields with key dateKeys to updateTimesToUTC
// do nothing if input values are already UTC

exports.updateTimesToUTC = function (dateKeys, instance) {
  dateKeys.map(function (dateKey) {
    if (instance[dateKey]) {
      // console.log("Updating old ", dateKey, instance[dateKey])
      instance[dateKey] = moment.tz(instance[dateKey], moment.tz.guess()).format();
      // console.log("New time:", instance[dateKey])
    }
  });
};


// dito but for array of instances
exports.updateAllTimesToUTC = function (dateKeys, instances) {
  dateKeys.map(function (dateKey) {
    // console.log("Updating all time field %s to UTC for %s instances:", dateKey, instances.length)
    instances.map(function (instance) {
      if (instance[dateKey]) {
        // console.log("Updating old ",dateKey,instance[dateKey])
        instance[dateKey] = moment.tz(instance[dateKey], moment.tz.guess()).format();
        // console.log("New time:",instance[dateKey])
      }
    });
  });
};

// remove fields which are automatically generated
exports.dropAutoGeneratedFields = function (data, next) {
  if (data) {
    delete data.createdAt;
    delete data.createdBy;
    delete data.updatedAt;
    delete data.updatedBy;
    delete data.history;
  }
  next();
};

exports.sendMail = (to, cc, subjectText, mailText, e, next) => {
  if ("smtpSettings" in config && "smtpMessage" in config) {
    let transporter = nodemailer.createTransport(config.smtpSettings);
    transporter.verify(function (error, _success) {
      if (error) {
        console.log(error);
        return next(error);
      } else {
        console.log("      Server is ready to send message to ", to);
        var message = Object.assign({}, config.smtpMessage);
        message["to"] = to;
        if (cc != "") {
          message["cc"] = cc;
        }
        message["subject"] += subjectText;
        message["text"] = mailText;
        transporter.sendMail(message, function (err, _info) {
          if (err) {
            console.log(err);
          } else {
            console.log("      Email sent");
          }
          return next(e);
        });
      }
    });
  } else {
    return next(e);
  }
};

exports.convertToSI = (value, unit) => {
  try {
    const quantity = math.unit(value, unit).toSI().toString();
    const [convertedValue, convertedUnit] = quantity.split(" ");
    return { valueSI: Number(convertedValue), unitSI: convertedUnit };
  } catch (error) {
    console.log(error);
    return { valueSI: value, unitSI: unit };
  }
};

exports.convertToRequestedUnit = (value, currentUnit, requestedUnit) => {
  const converted = math.unit(value, currentUnit).to(requestedUnit);
  const formatted = math.format(converted, { precision: 3 }).toString();
  const convertedValue = formatted.substring(0, formatted.indexOf(" "));
  const convertedUnit = formatted.substring(formatted.indexOf(" ") + 1);
  return {
    valueRequested: Number(convertedValue),
    unitRequested: convertedUnit,
  };
};

exports.appendSIUnitToPhysicalQuantity = (object) => {
  Object.keys(object).forEach((key) => {
    const value = object[key];
    if (value && value.unit) {
      const {
        valueSI,
        unitSI
      } = exports.convertToSI(value.value, value.unit);
      object[key] = {
        ...value,
        valueSI,
        unitSI
      };
    }
    // Has nested field
    else if (isObject(value)) {
      exports.appendSIUnitToPhysicalQuantity(value);
    }
  });
};
/**Check if input is object or a physical quantity */
const isObject = (x) => {
  if(x && typeof x === "object" && (!Array.isArray(x) && (!x.unit && x.unit !== ""))){
    return true;
  }
  return false;
};
exports.extractMetadataKeys = (datasetArray) => {
  const keys = new Set();
  //Return nested keys in this structure parentkey.childkey.grandchildkey....
  const flattenKeys = (object, keyStr) => {
    Object.keys(object).forEach((key) => {
      const value = object[key];
      const newKeyStr = `${keyStr? keyStr + ".": ""}${key}`;
      if (isObject(value)) {
        flattenKeys(value, newKeyStr);
      } else {
        keys.add(newKeyStr);
      }
    });
  };
  datasetArray.forEach((dataset) => {
    const { scientificMetadata } = dataset;
    if (scientificMetadata) {
      flattenKeys(scientificMetadata, "");
    }
  });
  return Array.from(keys);
};
/*
 wrapper to superagent library to make it ace as the request-response library
 passing in a single data structure with all the info and options to define the full request

 Examples:
  registerDataciteMetadataOptions = {
    method: "PUT",
    body: xml,
    uri: registerMetadataUri,
    headers: {
      "content-type": "application/xml;charset=UTF-8",
    },
    auth: doiProviderCredentials,
  };

  const registerDataciteDoiOptions = {
    method: "PUT",
    body: [
      "#Content-Type:text/plain;charset=UTF-8",
      `doi= ${fullDoi}`,
      `url= ${config.publicURLprefix}${encodeDoi}`,
    ].join("\n"),
    uri: registerDoiUri,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
    },
    auth: doiProviderCredentials,
  };

  const syncOAIPublication = {
    method: "POST",
    body: pub,
    json: true,
    uri: OAIServerUri,
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
    auth: doiProviderCredentials,
  };
 */
exports.superagent = (request) => {
  // instantiate the superagent object
  var sao = superagent;
  // check which type of method we should use
  switch(request.method) {
  case "PUT":
    sao = sao.put(request.uri);
    break;
  case "POST":
    sao = sao.post(request.uri);
    break;
  case "GET":
    sao = sao.get(request.uri);
    break;
  default:
    console.log("Request method invalid");
    throw "Request method invalid";
  }

  // insert body
  if (request.body) {
    sao = sao.send(request.body);
  }

  // insert authorization information
  if (request.auth && request.auth["password"] && request.auth["username"]) {
    sao = sao.auth(request.auth["username"],request.auth["password"]);
  }

  // set headers
  if (request.headers) {
    Object.keys(request.headers).forEach((key) => {
      sao = sao.set(key,request.headers[key]);
    });
  }
  return sao;
};
