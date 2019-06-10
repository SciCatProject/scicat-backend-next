'use strict';
var config = require('../../server/config.local');
var DataSource = require('loopback-datasource-juggler').DataSource;

var nodemailer = require('nodemailer');
var config = require('../../server/config.local');
var app = require('../../server/server');


function sendMail(to, cc, subjectText, mailText, e, next) {
    if ('smtpSettings' in config && 'smtpMessage' in config) {
        let transporter = nodemailer.createTransport(config.smtpSettings);
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                return next(error);
            } else {
                console.log('      Server is ready to send message to ', to);
                var message = Object.assign({}, config.smtpMessage);
                message['to'] = to;
                if (cc != "") {
                    message['cc'] = cc
                }
                message['subject'] += subjectText
                message['text'] = mailText
                transporter.sendMail(message, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('      Email sent');
                    }
                    return next(e);
                });
            }
        });
    } else {
        return next(e)
    }
}


function publishJob(job, ctx, next) {
    if ('queue' in config && config.queue === 'rabbitmq') {
        job.publishJob(ctx.instance, "jobqueue")
        console.log('      Saved Job %s#%s and published to message broker', ctx.Model.modelName, ctx.instance.id);
    }
    return next()
}

function sendStartJobEmail(job, ctx, policy, next) {
    // check policy settings if mail should be sent
    let to = ctx.instance.emailJobInitiator
    let subjectText = ' ' + ctx.instance.type + ' job submitted successfully';
    let mailText = 'Hello, \n\n You created a job to ' + ctx.instance.type + ' datasets. Your job was received and will be completed as soon as possible. \n\n Many Thanks.\n\n' + JSON.stringify(ctx.instance, null, 4);

    if (ctx.instance.type == 'archive' && policy.archiveEmailNotification) {
        // needs more checking
        if (policy.hasOwnProperty('archiveEmailsToBeNotified')) {
            to += "," + policy.archiveEmailsToBeNotified.join()
        }
        sendMail(to, "", subjectText, mailText, null, next)
        return
    }
    if (ctx.instance.type == 'retrieve' && policy.retrieveEmailNotification) {
        if (policy.hasOwnProperty('retrieveEmailsToBeNotified')) {
            to += "," + policy.retrieveEmailsToBeNotified.join()
        }
        sendMail(to, "", subjectText, mailText, null, next)
        return
    }
    next()
}

function SendFinishJobEmail(Job, ctx, idList, policy, next) {
    let Dataset = app.models.Dataset;
    let subjectText = ' ' + ctx.instance.type + ' job from ' + ctx.instance.creationTime.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' (UTC) finished with status ' + ctx.instance.jobStatusMessage;
    let mailText = 'Hello, \n\nYour Job from ' + ctx.instance.creationTime + ' is now finished.\n';
    if (ctx.instance.jobStatusMessage) {
        mailText += '\nThe returned job status is: *** ' + ctx.instance.jobStatusMessage + ' ***\n\n'
    }
    if (ctx.instance.jobResultObject) {
        mailText += 'The returned Job results details are:' + JSON.stringify(ctx.instance.jobResultObject, null, 3) + '\n\n'
    }
    let to = ctx.instance.emailJobInitiator
    let failure = ctx.instance.jobStatusMessage.indexOf('finish') !== -1 && ctx.instance.jobStatusMessage.indexOf('finishedSuccesful') == -1
    //test if all datasets are in retrievable state
    if (ctx.instance.type == "archive" || ctx.instance.type == "retrieve") {
        Dataset.find({
            fields: {
                "pid": true,
                "sourceFolder": true,
                "size": true,
                "datasetlifecycle": true
            },
            where: {
                'datasetlifecycle.retrievable': false,
                pid: {
                    inq: idList
                }
            }
        }, ctx.options, function (err, p) {
            const nonRetrievableList = p.map(x => ({
                pid: x.pid,
                sourceFolder: x.sourceFolder,
                size: x.size,
                archiveStatusMessage: x.datasetlifecycle.archiveStatusMessage,
                retrieveStatusMessage: x.datasetlifecycle.retrieveStatusMessage,
                archiveReturnMessage: x.datasetlifecycle.archiveReturnMessage,
                retrieveReturnMessage: x.datasetlifecycle.retrieveReturnMessage
            }))
            var cc = ""
            if (p.length > 0) {
                failure = true
                if (ctx.instance.type == "archive") {
                    mailText += "The following datasets were scheduled for archiving but are not in a retrievable state:\n\n" +
                        JSON.stringify(nonRetrievableList, null, 3)
                } else {
                    mailText += "The following datasets were scheduled for retrieval but are not in retrievable state:\n\n" +
                        JSON.stringify(nonRetrievableList, null, 3)
                }
                // add cc message in case of failure to scicat archivemanager
                if ('smtpMessage' in config && 'from' in config.smtpMessage) {
                    cc = config.smtpMessage.from
                }
            } else {
                if (ctx.instance.type == "archive") {
                    mailText += "All datasets to be archived are now in state retrievable:\n\n" + JSON.stringify(idList, null, 3)
                } else {
                    mailText += "All datasets to be retrieved are (still) in retrievable state:\n\n" + JSON.stringify(idList, null, 3)
                }
            }
            if (ctx.instance.type == "retrieve") {
                mailText += "\n\nIf the job was succesful you can now use the command 'datasetRetriever' to move the retrieved datasets to their final destination"
            }
            // failures are always reported
            if (ctx.instance.type == 'archive' && (policy.archiveEmailNotification || failure)) {
                // needs more checking
                if (policy.hasOwnProperty('archiveEmailsToBeNotified')) {
                    to += "," + policy.archiveEmailsToBeNotified.join()
                }
                sendMail(to, cc, subjectText, mailText, null, next)
                return
            }
            if (ctx.instance.type == 'retrieve' && (policy.retrieveEmailNotification || failure)) {
                if (policy.hasOwnProperty('retrieveEmailsToBeNotified')) {
                    to += "," + policy.retrieveEmailsToBeNotified.join()
                }
                sendMail(to, cc, subjectText, mailText, null, next)
                return
            }
            next()
            //sendMail(to, cc, subjectText, mailText, null, next)
        })
    } else {
        // other jobs like reset jobs
        sendMail(to, "", subjectText, mailText, null, next)
    }
}

function MarkDatasetsAsScheduled(job, ctx, idList, policy, next) {

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
        function (err, p) {
            if (err) {
                var e = new Error();
                e.statusCode = 404;
                e.message = 'Can not find all needed Dataset entries - no archive job sent:\n' + JSON.stringify(err)
                next(e);
            } else {
                sendStartJobEmail(job, ctx, policy, function () {
                    publishJob(job, ctx, next)
                })
            }
        });
}
// for archive jobs all datasets must be in state archivable
function TestArchiveJobs(job, ctx, idList, policy, next) {

    let Dataset = app.models.Dataset;
    Dataset.find({
        fields: {
            "pid": true
        },
        where: {
            'datasetlifecycle.archivable': false,
            pid: {
                inq: idList
            }
        }
    }, ctx.options, function (err, p) {
        if (p.length > 0) {
            var e = new Error();
            e.statusCode = 409;
            e.message = 'The following datasets are not in archivable state - no archive job sent:\n' + JSON.stringify(p)
            next(e);
        } else {
            // mark all Datasets as in state scheduledForArchiving, archivable=false
            MarkDatasetsAsScheduled(job, ctx, idList, policy, next)
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
            'datasetlifecycle.retrievable': true,
            pid: {
                inq: idList
            }
        }
    }, ctx.options, function (err, p) {
        if (err) {
            return next(err)
        } else if (p.length != idList.length) {
            Dataset.find({
                fields: {
                    "pid": true
                },
                where: {
                    'datasetlifecycle.retrievable': false,
                    pid: {
                        inq: idList
                    }
                }
            }, ctx.options, function (err2, pmiss) {
                if (err2) {
                    return next(err2)
                } else {
                    var e = new Error();
                    e.statusCode = 409;
                    e.message = 'The following datasets are not in retrievable state - no retrieve job sent:\n' + JSON.stringify(pmiss)
                    return next(e);
                }
            })
        } else {
            sendStartJobEmail(job, ctx, policy, function () {
                publishJob(job, ctx, next)
            })
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
            e.message = 'At least one of the datasets could not be found - no Job sent';
            let subjectText = ' ' + ctx.instance.type + ' job not submitted due to missing datasets';
            let mailText = 'Hello, \n\n You created a job to ' + ctx.instance.type + ' datasets.'
            mailText += ' However at least one of the datasets could not be found , therefor no Job was sent.\n\n'
            mailText += 'Requested dataset ids:\n' + JSON.stringify(idList, null, 3);
            mailText += 'Found dataset ids:\n' + JSON.stringify(p, null, 3);
            let to = ctx.instance.emailJobInitiator
            sendMail(to, "", subjectText, mailText, e, next)
        } else {
            //test if all datasets are in archivable state
            if (ctx.instance.type == "archive") {
                TestArchiveJobs(job, ctx, idList, policy, next)
            } else if (ctx.instance.type == "retrieve") {
                TestRetrieveJobs(job, ctx, idList, policy, next)
            } else {
                // all other type of jobs, like reset jobs
                sendStartJobEmail(job, ctx, policy, function () {
                    publishJob(job, ctx, next)
                })
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
                    var msg = "Error when looking for Policy of pgroup " + ctx.instance.ownerGroup + " " + err;
                    console.log(msg);
                    return next(msg);
                } else if (policyInstance) {
                    return next(null, policyInstance)
                } else {
                    // this should not happen anymore, but kept as additional safety belt
                    console.log("No policy found for instance:", instance)
                    console.log("Return default policy instead.")
                    var po = {}
                    po.archiveEmailNotification = true
                    po.retrieveEmailNotification = true
                    po.archiveEmailsToBeNotified = []
                    po.retrieveEmailsToBeNotified = []
                    return next(null, po)
                }
            })
        }
    })
}

module.exports = function (Job) {

    // Attach job submission to Kafka
    if ('queue' in config && config.queue === 'kafka') {
        // var options = {
        //     connectionString: 'localhost:2181/'
        // };
        var dataSource = new DataSource('kafka', options);
        Job.attachTo(dataSource);
    }

    Job.observe('before save', (ctx, next) => {
        // email job initiator should always be the person running the job request
        // therefore override this field both for users and functional accounts
        if (ctx.instance) {
            ctx.instance.emailJobInitiator = ctx.options.currentUserEmail;
            if (ctx.isNewInstance) {
                ctx.instance.jobStatusMessage = "jobSubmitted"
            }
        }
        next()
    });

    Job.observe('after save', (ctx, next) => {
        if (ctx.instance) {
            // first create array of all pids
            const idList = ctx.instance.datasetList.map(x => x.pid)
            // get policy parameters for pgroup/proposal of first dataset
            getPolicy(idList[0], ctx.options, function (err, policy) {
                if (err) {
                    return next(err)
                }
                if (ctx.isNewInstance) {
                    // this is a new job, make some consistency checks concerning the datasets
                    TestAllDatasets(Job, ctx, idList, policy, next)
                } else {
                    // An existing job got some updates - check if you want to send an email
                    if (ctx.instance.jobStatusMessage.startsWith("finish")) {
                        SendFinishJobEmail(Job, ctx, idList, policy, function () {
                            publishJob(Job, ctx, next)
                        })
                    } else {
                        return next()
                    }
                }
            })
        } else {
            return next()
        }
    });

    Job.datasetDetails = function (jobId, datasetFields = {}, include = {}, options, next) {
        const Dataset = app.models.Dataset;
        Job.findById(jobId, options, function (err, job) {
            if (err) {
                return next(err);
            }
            if (!job) {
                return next(null, [])
            }
            // console.log("Job found:", JSON.stringify(job, null, 3))
            const datasetIdList = job.datasetList.map(x => x.pid)
            const filter = {
                fields: datasetFields,
                include: include,
                where: {
                    pid: {
                        inq: datasetIdList
                    }
                }
            }
            //console.log("filter:", JSON.stringify(filter, null, 3))
            Dataset.find(filter, options, function (err, result) {
                if (err) {
                    return next(err)
                }
                //console.log("Returned result:", JSON.stringify(result, null, 3))
                return next(null, result)
            });
        });
    };

};
