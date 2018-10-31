'use strict';
var config = require('../../server/config.local');
var DataSource = require('loopback-datasource-juggler').DataSource;

var nodemailer = require('nodemailer');
var config = require('../../server/config.local');
var app = require('../../server/server');

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
        // replace email with that from userIdentity
        var UserIdentity = app.models.UserIdentity;
        var userId = ctx.options.accessToken.userId;
        //PersistedModel Static Method call
        UserIdentity.findOne({
          //json filter
          where: {
              userId: userId
          }
        }, function(err, instance) {
          if(!!instance)
          {
            ctx.instance.emailJobInitiator = instance.profile.email;
          }
        });
        if (ctx.instance) {
            // auto fill dataOfLastMessage
            var now = new Date();
            if (!ctx.instance.dateOfLastMessage) {
                ctx.instance.dateOfLastMessage = now.toISOString();
            }
            // make some consistency checks:
            //    - ensure that all wanted datasets exist already
            //    -  TODO: for archive jobs all datasetslifecycle should be in an "archiveable" state
            // TODO ensure that job is created by user who has read access to all datasets in case of retrieve JOBS
            var Dataset = app.models.Dataset;
            // create array of all pids
            // console.log("Verifying datasets:",ctx.options)
            const idList=ctx.instance.datasetList.map(x => x.pid)
            Dataset.find({where: {pid: {inq: idList}}}, ctx.options, function (err, p){
                console.log("JOBS:lengths",err,p.length,idList.length,p)
                if (err || (p.length != idList.length)){
                    var e = new Error();
                    e.statusCode = 400;
                    e.message = 'At least one of the datasets could not be found';
                    next(e);
                } else {
                   next();
                }
            });
            //test for datasets already archived
            /*var Lifecycle = app.models.DatasetLifecycle;
            Lifecycle.find({
                where: {
                    archivable: false,
                    datasetId: {
                        inq: idList
                    }
                }
            }, ctx.options, function(err, p) {
                console.log("LifeCycle: ", p, idList);
                if (p.length > 0) {
                    var e = new Error();
                    e.statusCode = 400;
                    e.message = 'At least one of the datasets is already archived';
                    next(e);
                }
                else {
                    next();
                }
            });*/
        } else {
            next();
        }
    });

    Job.observe('after save', (ctx, next) => {
        if (ctx.instance && ctx.isNewInstance) {

            if ('queue' in config && config.queue === 'rabbitmq') {
                Job.publishJob(ctx.instance, "jobqueue")
                console.log('Saved Job %s#%s and published to message broker', ctx.Model.modelName, ctx.instance.id);
            }
            if ('smtpSettings' in config && 'smtpMessage' in config)  {
                let transporter = nodemailer.createTransport(config.smtpSettings);
                transporter.verify(function (error, success) {
                    if (error) {
                        console.log(error);
                        next();
                    } else {
                        console.log('Server is ready to take our messages');
                        var message = Object.assign({}, config.smtpMessage);
                        message['to'] = ctx.instance.emailJobInitiator;
                        message['subject'] += ' Job Submitted Successfully';
                        let text = 'Hello, \n\n You created a job to ' + ctx.instance.type + ' datasets. Your job was received and will be completed as soon as possible. \n\n Many Thanks.\n\n'+JSON.stringify(ctx.instance, null, 4);
                        message['text'] = text;
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
        } else {
            if ('smtpSettings' in config && 'smtpMessage' in config)  {
                let transporter = nodemailer.createTransport(config.smtpSettings);
                transporter.verify(function (error, success) {
                    if (error) {
                        console.log(error);
                        next();
                    } else {
                        console.log('Server is ready to take our messages');
                        var message = Object.assign({}, config.smtpMessage);
                        message['to'] = ctx.instance.emailJobInitiator;
                        message['subject'] += ' Job Finished with status '+ ctx.instance.jobStatusMessage;
                        let text = 'Hello, \n\n Your Job with id is now finished. \n\n The resulting job description is.\n\n'+JSON.stringify(ctx.instance, null, 4);
                        message['text'] = text;
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
    });
};
