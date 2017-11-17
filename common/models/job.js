'use strict';

var nodemailer = require('nodemailer');
var config = require('../../server/config.local');

module.exports = function(Job) {
  Job.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      // auto fill dataOfLastMessage
      var now = new Date();
      if (!ctx.instance.dateOfLastMessage) {
        ctx.instance.dateOfLastMessage = now.toISOString();
      }
    }
    next();
  });

  Job.observe('after save', (ctx, next) => {
    if (ctx.instance) {
      if (ctx.isNewInstance) {
        Job.publishJob(ctx.instance, 'jobqueue');
        let transporter = nodemailer.createTransport(config.smtpSettings);
        transporter.verify(function(error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log('Server is ready to take our messages');
            var message = Object.assign({}, config.smtpMessage);
            message['to'] = ctx.instance.emailJobInitiator;
            message['subject'] += ' Job Submitted Successfully';
            transporter.sendMail(message, function(err, info) {
              if (err) {
                console.err(err);
              } else {
                console.log('Email sent');
              }
              next();
            });
          }
        });
        console.log('Saved Job %s#%s and published to message broker',
                    ctx.Model.modelName, ctx.instance.id);
      }
    } else {
      console.log('Updated %s matching %j', ctx.Model.pluralModelName,
                  ctx.where);
       next();
    } else {
       next();
    }
  })
};
