'use strict';
var config = require('../../server/config.local');
var DataSource = require('loopback-datasource-juggler').DataSource;

var nodemailer = require('nodemailer');
var config = require('../../server/config.local');
var app = require('../../server/server');


function sendMail(to, subjectText, mailText, next) {
    if ('smtpSettings' in config && 'smtpMessage' in config) {
        let transporter = nodemailer.createTransport(config.smtpSettings);
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                next();
            } else {
                console.log('Server is ready to send message to ', to);
                var message = Object.assign({}, config.smtpMessage);
                message['to'] = to;
                message['subject'] += subjectText
                message['text'] = mailText
                transporter.sendMail(message, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Email sent');
                    }
                    next();
                });
            }
        });
    } else {
        next()
    }
}

function publishJob(job, ctx, next) {
    if ('queue' in config && config.queue === 'rabbitmq') {
        job.publishJob(ctx.instance, "jobqueue")
        console.log('Saved Job %s#%s and published to message broker', ctx.Model.modelName, ctx.instance.id);
    }

    let subjectText = ' ' + ctx.instance.type + ' job submitted successfully';
    let mailText = 'Hello, \n\n You created a job to ' + ctx.instance.type + ' datasets. Your job was received and will be completed as soon as possible. \n\n Many Thanks.\n\n' + JSON.stringify(ctx.instance, null, 4);
    let to = ctx.instance.emailJobInitiator
    sendMail(to, subjectText, mailText, next)
}

function MarkDatasetsAsScheduled(job, ctx, idList, next) {

    let DatasetLifecycle = app.models.DatasetLifecycle;
    DatasetLifecycle.updateAll(
        {
            datasetId: {
                inq: idList
            }
        },
        {
            archivable: false,
            retrievable: false,
            archiveStatusMessage: "scheduledForArchiving"
        }
        , ctx.options, function (err, p) {
            if (err) {
                var e = new Error();
                e.statusCode = 404;
                e.message = 'Can not find all needed DatasetLifecycle entries - no archive job sent:\n' + JSON.stringify(err)
                next(e);
            } else {
                // since updateAll does not send context and therefore the DatasetLifecycle updates are not copied over 
                // to Dataset one has to do the update here on Dataset in addition
                let Dataset = app.models.Dataset;
                Dataset.updateAll(
                    {
                        pid: {
                            inq: idList
                        }
                    },
                    {
                        archivable: false,
                        retrievable: false
                    }
                    , ctx.options, function (err, p) {
                        if (err) {
                            var e = new Error();
                            e.statusCode = 404;
                            e.message = 'Can not find all needed Dataset entries - no archive job sent:\n' + JSON.stringify(err)
                            next(e);
                        } else {
                            publishJob(job, ctx, next)
                        }
                    });
            }
        });
}
// for archive jobs all datasets must be in state archivable
function TestArchiveJobs(job, ctx, idList, next) {
    let Dataset = app.models.Dataset;
    Dataset.find({
        where: {
            archivable: false,
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
            // console.log("mark  datasets as to be archived: ctx.options,idlist",ctx.options,idList)
            MarkDatasetsAsScheduled(job, ctx, idList, next)
        }
    });

}

// for retrieve jobs all datasets must be in state retrievable 
// ownerGroup is tested implicitly via Ownable

function TestRetrieveJobs(job, ctx, idList, next) {
    let Dataset = app.models.Dataset;
    Dataset.find({
        where: {
            retrievable: true,
            pid: {
                inq: idList
            }
        }
    }, ctx.options, function (err, p) {
        // console.log("============= Retrieve Result:",JSON.stringify(p))
        if (err) {
            return next(err)
        } else if (p.length != idList.length) {
            Dataset.find({
                where: {
                    retrievable: false,
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
            publishJob(job, ctx, next);
        }
    });
}

function TestAllDatasets(job, ctx, idList, next) {
    let Dataset = app.models.Dataset;
    Dataset.find({
        where: {
            pid: {
                inq: idList
            }
        }
    }, ctx.options, function (err, p) {
        let to = ctx.instance.emailJobInitiator
        if (err || (p.length != idList.length)) {
            var e = new Error();
            e.statusCode = 404;
            e.message = 'At least one of the datasets could not be found - no Job sent';
            // TODO should I send an email here ? Only if triggered by autoarchive option ?
            // subjectText =
            // mailText=
            // sendMail(to, subjectText, mailText, next)
            return next(e)
        } else {
            //test if all datasets are in archivable state
            if (ctx.instance.type == "archive") {
                TestArchiveJobs(job, ctx, idList, next)
            } else if (ctx.instance.type == "retrieve") {
                TestRetrieveJobs(job, ctx, idList, next)
            } else {
                publishJob(job, ctx, next)
            }
        }
    });
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
        if (ctx.instance) {
            // replace email with that from userIdentity
            var UserIdentity = app.models.UserIdentity;
            var userId = ctx.options.accessToken.userId;
            //PersistedModel Static Method call
            UserIdentity.findOne({
                //json filter
                where: {
                    userId: userId
                }
            }, function (err, u) {
                if (!!u) {
                    ctx.instance.emailJobInitiator = u.profile.email;
                }
                // auto fill dateOfLastMessage
                var now = new Date();
                if (!ctx.instance.dateOfLastMessage) {
                    ctx.instance.dateOfLastMessage = now.toISOString();
                }
                next()
            })
        } else {
            next()
        }
    });

    Job.observe('after save', (ctx, next) => {
        if (ctx.instance && ctx.isNewInstance) {
            // first create array of all pids
            const idList = ctx.instance.datasetList.map(x => x.pid)
            // this is a new job, make some consistency checks concerning the datasets
            TestAllDatasets(Job, ctx, idList, next)
        } else {
            // An existing job got some updates - check if you want to send an email
            if (ctx.instance.jobStatusMessage.startsWith("finish")) {
                // TODO add infos about which Datasets failed if this info is not yet in historyMessages of the Job
                let subjectText = ' ' + ctx.instance.type + ' job from ' + ctx.instance.creationTime.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' (UTC) finished with status ' + ctx.instance.jobStatusMessage;
                let mailText = 'Hello, \n\n Your Job from ' + ctx.instance.creationTime + ' is now finished. \n\n The resulting job description is.\n\n' + JSON.stringify(ctx.instance, null, 4);
                let to = ctx.instance.emailJobInitiator
                sendMail(to, subjectText, mailText, next)
            } else {
                next()
            }
        }
    });
};
