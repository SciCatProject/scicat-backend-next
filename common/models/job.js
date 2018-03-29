'use strict';

var nodemailer = require('nodemailer');
var config = require('../../server/config.local');
var app = require('../../server/server');

module.exports = function (Job) {
    Job.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            // auto fill dataOfLastMessage
            var now = new Date();
            if (!ctx.instance.dateOfLastMessage) {
                ctx.instance.dateOfLastMessage = now.toISOString();
            }
            var Dataset = app.models.Dataset;
            // Ensure that each dataset is valid. Could also extend to check data files
            ctx.instance.datasetList.map(function(entry) {
                Dataset.findById(entry.pid, function(err, res) {
                    if (err || !res) {
                        var e = new Error();
                        e.statusCode = 400;
                        e.message = 'Dataset provided either does not exist or provided an error';
                        next(e);
                    }
                });
            });
        }
        
        next();
    });

    Job.observe('after save', (ctx, next) => {
        if (ctx.instance) {
            if (ctx.isNewInstance) {
                Job.publishJob(ctx.instance, 'jobqueue');
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
                            let text = 'Hello, \n\n You created a job to ' + ctx.instance.type + ' datasets. Your job was received and will be completed as soon as possible. \n\n Many Thanks.';
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
                    console.log('Saved Job %s#%s and published to message broker',
                        ctx.Model.modelName, ctx.instance.id);
                } else {
                  next();
                }
            } else {
                console.log('Updated %s matching %j', ctx.Model.pluralModelName,
                    ctx.where);
                next();
            }
        } else {
            next();
        }
    });
};
