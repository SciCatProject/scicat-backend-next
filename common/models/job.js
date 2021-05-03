"use strict";
var config = require("../../server/config.local");
var DataSource = require("loopback-datasource-juggler").DataSource;
var utils = require("./utils");
var app = require("../../server/server");

function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}


function publishJob(job, ctx, next) {
  if ("queue" in config && config.queue === "rabbitmq") {
    job.publishJob(ctx.instance, "jobqueue");
    console.log("      Saved Job %s#%s and published to message broker", ctx.Model.modelName, ctx.instance.id);
  }
  return next();
}

function sendStartJobEmail(ctx, idList, policy, next) {
  // // check policy settings if mail should be sent
  let to = ctx.instance.emailJobInitiator;
  let subjectText = " " + ctx.instance.type + " job submitted successfully";
  let mailText = "Hello, \n\n You created a job to " + ctx.instance.type + " datasets. Your job was received and will be completed as soon as possible. \n\n Many Thanks.\n\n" + JSON.stringify(ctx.instance, null, 4);

  // add some more infos about datasets to be treted
  let Dataset = app.models.Dataset;
  if (ctx.instance.type == "archive" || ctx.instance.type == "retrieve") {
    Dataset.find({
      fields: {
        "pid": true,
        "sourceFolder": true,
        "size": true,
        "datasetlifecycle": true,
        "ownerGroup": true
      },
      where: {
        pid: {
          inq: idList
        }
      }
    }, ctx.options, function (err, p) {
      const datasetResultList = p.map(x => ({
        pid: x.pid,
        ownerGroup: x.ownerGroup,
        sourceFolder: x.sourceFolder,
        size: x.size,
        archivable: x.datasetlifecycle.archivable,
        retrievable: x.datasetlifecycle.retrievable
      }));

      mailText += "\n\nList of datasets:\n";
      mailText += "=================\n\n";
      mailText += JSON.stringify(datasetResultList, null, 3);

      if (ctx.instance.type == "archive" && policy.archiveEmailNotification) {
        // needs more checking
        if (Object.prototype.hasOwnProperty.call(policy, "archiveEmailsToBeNotified")) {
          to += "," + policy.archiveEmailsToBeNotified.join();
        }
        utils.sendMail(to, "", subjectText, mailText, null, next);
        return;
      }
      if (ctx.instance.type == "retrieve" && policy.retrieveEmailNotification) {
        if (Object.prototype.hasOwnProperty.call(policy, "retrieveEmailsToBeNotified")) {
          to += "," + policy.retrieveEmailsToBeNotified.join();
        }
        utils.sendMail(to, "", subjectText, mailText, null, next);
        return;
      }
      return next();
    });
  } else {
    // other jobs like reset jobs
    utils.sendMail(to, "", subjectText, mailText, null, next);
    return;
  }
}

function markDatasetsAsScheduled(job, ctx, idList, policy, next) {

  let Dataset = app.models.Dataset;
  Dataset.updateAll({
    pid: {
      inq: idList
    }
  }, {
    "$set": {
      "datasetlifecycle.archivable": false,
      "datasetlifecycle.retrievable": false,
      "datasetlifecycle.archiveStatusMessage": "scheduledForArchiving"
    }
  }, ctx.options,
  function (err, _p) {
    if (err) {
      var e = new Error();
      e.statusCode = 404;
      e.message = "Can not find all needed Dataset entries - no archive job sent:\n" + JSON.stringify(err);
      next(e);
    } else {
      sendStartJobEmail(ctx, idList, policy, function () {
        publishJob(job, ctx, next);
      });
    }
  });
}

function sendFinishJobEmail(ctx, idList, policy, next) {
  let Dataset = app.models.Dataset;
  let subjectText = " " + ctx.instance.type + " job from " + ctx.instance.creationTime.toISOString().replace(/T/, " ").replace(/\..+/, "") + " (UTC) finished with status " + ctx.instance.jobStatusMessage;
  let mailText = "Hello, \n\nYour Job from " + ctx.instance.creationTime + " is now finished.\n";
  let failure = ctx.instance.jobStatusMessage.indexOf("finish") !== -1 && ctx.instance.jobStatusMessage.indexOf("finishedSuccessful") == -1;
  if (ctx.instance.jobStatusMessage) {
    mailText += "\nThe returned job status is: *** " + ctx.instance.jobStatusMessage + " ***\n\n";
    if (failure) {
      mailText += "==========================================================================\n";
      mailText += "The job resulted in an error message !!! Please look at the details below.\n";
      mailText += "==========================================================================\n";

    }
  }
  if (ctx.instance.jobResultObject) {
    mailText += "The returned Job results details are:" + JSON.stringify(ctx.instance.jobResultObject, null, 3) + "\n\n";
  }
  let to = ctx.instance.emailJobInitiator;
  // console.log("jobstatusmessage, failure:",ctx.instance.jobStatusMessage, failure)
  // test if all datasets are in retrievable state
  // for this get all datasets and check their status flags
  if (ctx.instance.type == "archive" || ctx.instance.type == "retrieve") {
    Dataset.find({
      fields: {
        "pid": true,
        "sourceFolder": true,
        "size": true,
        "datasetlifecycle": true,
        "ownerGroup": true
      },
      where: {
        pid: {
          inq: idList
        }
      }
    }, ctx.options, function (err, p) {
      const datasetResultList = p.map(x => ({
        pid: x.pid,
        ownerGroup: x.ownerGroup,
        sourceFolder: x.sourceFolder,
        size: x.size,
        archiveStatusMessage: x.datasetlifecycle.archiveStatusMessage,
        retrieveStatusMessage: x.datasetlifecycle.retrieveStatusMessage,
        archiveReturnMessage: x.datasetlifecycle.archiveReturnMessage,
        retrieveReturnMessage: x.datasetlifecycle.retrieveReturnMessage,
        retrievable: x.datasetlifecycle.retrievable
      }));
      var cc = "";
      // split result into good and bad
      const good = datasetResultList.filter(function (x) {
        return x.retrievable;
      });
      const bad = datasetResultList.filter(function (x) {
        return !x.retrievable;
      });
      // print warning and the details in tabular form
      // print good cases
      if (bad.length > 0) {
        // console.log("Setting failure to true, list of pids, length:",JSON.stringify(p,null,3),p.length);
        failure = true;
        if (ctx.instance.type == "archive") {
          mailText += "The following datasets were scheduled for archiving but are not in a retrievable state:\n";
          mailText += "=======================================================================================\n\n";
          mailText += JSON.stringify(bad, null, 3);
        } else {
          mailText += "The following datasets were scheduled for retrieval but are not in retrievable state:\n";
          mailText += "=====================================================================================\n\n";
          mailText += JSON.stringify(bad, null, 3);
        }
        // add cc message in case of failure to scicat archivemanager
        if ("smtpMessage" in config && "from" in config.smtpMessage) {
          cc = config.smtpMessage.from;
        }
      }

      // succesfull datasets
      if (ctx.instance.type == "archive") {
        mailText += "The following datasets were succesfully archived:\n";
        mailText += "=================================================\n\n";
        mailText += JSON.stringify(good, null, 3);
      }

      if (ctx.instance.type == "retrieve") {
        mailText += "The following datasets are ready to be retrieved:\n";
        mailText += "=================================================\n\n";
        mailText += JSON.stringify(good, null, 3);
        mailText += "=================================================\n\n";
        mailText += "\nYou can now use the command 'datasetRetriever' to move the retrieved datasets to their final destination";
      }
      // failures are always reported
      if (ctx.instance.type == "archive" && (policy.archiveEmailNotification || failure)) {
        // needs more checking
        if (Object.prototype.hasOwnProperty.call(policy, "archiveEmailsToBeNotified")) {
          to += "," + policy.archiveEmailsToBeNotified.join();
        }
        utils.sendMail(to, cc, subjectText, mailText, null, next);
        return;
      }
      if (ctx.instance.type == "retrieve" && (policy.retrieveEmailNotification || failure)) {
        if (Object.prototype.hasOwnProperty.call(policy, "retrieveEmailsToBeNotified")) {
          to += "," + policy.retrieveEmailsToBeNotified.join();
        }
        utils.sendMail(to, cc, subjectText, mailText, null, next);
        return;
      }
      next();
      //utils.sendMail(to, cc, subjectText, mailText, null, next)
    });
  } else {
    // other jobs like reset jobs
    utils.sendMail(to, "", subjectText, mailText, null, next);
  }
}

// for archive jobs all datasets must be in state archivable
function TestArchiveJobs(job, ctx, idList, policy, next) {

  let Dataset = app.models.Dataset;
  Dataset.find({
    fields: {
      "pid": true
    },
    where: {
      "datasetlifecycle.archivable": false,
      pid: {
        inq: idList
      }
    }
  }, ctx.options, function (err, p) {
    if (p.length > 0) {
      var e = new Error();
      e.statusCode = 409;
      e.message = "The following datasets are not in archivable state - no archive job sent:\n" + JSON.stringify(p);
      next(e);
    } else {
      // mark all Datasets as in state scheduledForArchiving, archivable=false
      markDatasetsAsScheduled(job, ctx, idList, policy, next);
    }
  });
}

// for retrieve jobs all datasets must be in state retrievable 
// ownerGroup is tested implicitly via Ownable

function TestRetrieveJobs(job, ctx, idList, policy, next) {
  let Dataset = app.models.Dataset;
  Dataset.find({
    fields: {
      "pid": true
    },
    where: {
      "datasetlifecycle.retrievable": true,
      pid: {
        inq: idList
      }
    }
  }, ctx.options, function (err, p) {
    if (err) {
      return next(err);
    } else if (p.length != idList.length) {
      Dataset.find({
        fields: {
          "pid": true
        },
        where: {
          "datasetlifecycle.retrievable": false,
          pid: {
            inq: idList
          }
        }
      }, ctx.options, function (err2, pmiss) {
        if (err2) {
          return next(err2);
        } else {
          var e = new Error();
          e.statusCode = 409;
          e.message = "The following datasets are not in retrievable state - no retrieve job sent:\n" + JSON.stringify(pmiss);
          return next(e);
        }
      });
    } else {
      sendStartJobEmail(ctx, idList, policy, function () {
        publishJob(job, ctx, next);
      });
    }
  });
}

function TestAllDatasets(job, ctx, idList, policy, next) {
  let Dataset = app.models.Dataset;
  Dataset.find({
    fields: {
      "pid": true
    },
    where: {
      pid: {
        inq: idList
      }
    }
  }, ctx.options, function (err, p) {
    if (err || (p.length != idList.length)) {
      var e = new Error();
      e.statusCode = 404;
      e.message = "At least one of the datasets could not be found - no Job sent";
      let subjectText = " " + ctx.instance.type + " job not submitted due to missing datasets";
      let mailText = "Hello, \n\nYou created a job to " + ctx.instance.type + " datasets.";
      mailText += " However at least one of the datasets could not be found , therefore no job was sent.\n\n";
      mailText += "Requested dataset ids:\n======================\n" + JSON.stringify(idList, null, 3);
      mailText += "\n\nFound dataset ids:\n======================\n" + JSON.stringify(p, null, 3);
      let to = ctx.instance.emailJobInitiator;
      utils.sendMail(to, "", subjectText, mailText, e, next);
    } else {
      //test if all datasets are in archivable state
      if (ctx.instance.type == "archive") {
        TestArchiveJobs(job, ctx, idList, policy, next);
      } else if (ctx.instance.type == "retrieve") {
        TestRetrieveJobs(job, ctx, idList, policy, next);
      } else {
        // all other type of jobs, like reset jobs
        sendStartJobEmail(ctx, idList, policy, function () {
          publishJob(job, ctx, next);
        });
      }
    }
  });
}

function getPolicy(id, options, next) {
  let Dataset = app.models.Dataset;
  Dataset.findById(id, options, function (err, instance) {
    if (err || !instance) {
      return next(err);
    } else {
      var Policy = app.models.Policy;
      const filter = {
        where: {
          ownerGroup: instance.ownerGroup
        }
      };
      // console.log("In jobs:filter condition on Policy:",filter)
      Policy.findOne(filter, options, function (err, policyInstance) {
        // console.log("Inside Jobs, look for policy:err,policyInstance:",err,policyInstance)
        if (err) {
          var msg = "Error when looking for Policy of pgroup " + instance.ownerGroup + " " + err;
          console.log(msg);
          return next(msg);
        } else if (policyInstance) {
          return next(null, policyInstance);
        } else {
          // this should not happen anymore, but kept as additional safety belt
          console.log("No policy found for instance:", instance);
          console.log("Return default policy instead.");
          var po = {};
          po.archiveEmailNotification = true;
          po.retrieveEmailNotification = true;
          po.archiveEmailsToBeNotified = [];
          po.retrieveEmailsToBeNotified = [];
          return next(null, po);
        }
      });
    }
  });
}

module.exports = function (Job) {

  // Attach job submission to Kafka
  if ("queue" in config && config.queue === "kafka") {
    var options = {
    //     connectionString: 'localhost:2181/'
    };
    var dataSource = new DataSource("kafka", options);
    Job.attachTo(dataSource);
  }

  Job.observe("before save", (ctx, next) => {
    // email job initiator should always be the person running the job request
    // therefore override this field both for users and functional accounts
    if (ctx.instance) {
      ctx.instance.emailJobInitiator = ctx.options.currentUserEmail;
      if (ctx.isNewInstance) {
        ctx.instance.jobStatusMessage = "jobSubmitted";
      }
    }
    next();
  });

  Job.observe("after save", (ctx, next) => {
    if (ctx.instance && ctx.instance.datasetList) {
      // first create array of all pids
      const idList = ctx.instance.datasetList.map(x => x.pid);
      // get policy parameters for pgroup/proposal of first dataset
      getPolicy(idList[0], ctx.options, function (err, policy) {
        if (err) {
          return next(err);
        }
        if (ctx.isNewInstance) {
          // this is a new job, make some consistency checks concerning the datasets
          TestAllDatasets(Job, ctx, idList, policy, next);
        } else {
          // An existing job got some updates - check if you want to send an email
          if (ctx.instance.jobStatusMessage.startsWith("finish")) {
            sendFinishJobEmail(ctx, idList, policy, function () {
              publishJob(Job, ctx, next);
            });
          } else {
            return next();
          }
        }
      });
    } else {
      return next();
    }
  });

  Job.datasetDetails = function (jobId, datasetFields = {}, include = {}, includeFields = {}, options, next) {
    const Dataset = app.models.Dataset;
    const Datablock = app.models.Datablock;

    Job.findById(jobId, options, function (err, job) {
      if (err) {
        return next(err);
      }
      if (!job) {
        return next(null, []);
      }
      // console.log("Job found:", JSON.stringify(job, null, 3))
      const datasetIdList = job.datasetList.map(x => x.pid);
      const filter = {
        fields: datasetFields,
        // include: include,
        where: {
          pid: {
            inq: datasetIdList
          }
        }
      };
      //console.log("filter:", JSON.stringify(filter, null, 3))
      Dataset.find(filter, options, function (err, result) {
        if (err) {
          return next(err);
        }
        // if include wanted make a second API request on included collection, 
        // taking into account its own field constraints

        if (!isEmptyObject(include)) {
          if (("relation" in include) && (include.relation == "datablocks")) {
            // {"fields":{"id":1,"archiveId":1,"size":1},"where":{"datasetId":{"in":["20.500.11935/ac19baf2-a825-4a26-ad79-18039b67438f"]}}}
            const filterDB = {
              fields: includeFields,
              where: {
                datasetId: {
                  inq: datasetIdList
                }
              }
            };
            // console.log("filterDB:", JSON.stringify(filterDB, null, 3))
            // first create a copy of the object, since we need to modify it:
            var newResult = JSON.parse(JSON.stringify(result));
            Datablock.find(filterDB, options, function (err, resultDB) {
              // now merge datablock results to dataset results
              newResult.map(function (ds) {
                // add datablocks array
                const tmpds = resultDB.filter(function (db) {
                  console.log("Comparing IDS:", db.datasetId, ds.pid);
                  return db.datasetId == ds.pid;
                });
                console.log("Subset of datablocks for current dataset:", JSON.stringify(tmpds, null, 3));
                ds.datablocks = tmpds;
              });
              console.log("Result after adding datablocks:", JSON.stringify(newResult, null, 3));
              return next(null, newResult);
            });
          } else {
            return next(null, result);
          }
        } else {
          return next(null, result);
        }
      });
    });
  };
};
