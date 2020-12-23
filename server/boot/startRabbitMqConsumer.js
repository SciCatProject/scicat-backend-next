"use strict";
const amqp = require('amqplib/callback_api');
const config = require('../config.local');
const logger = require('../../common/logger');
const utils = require('../../common/models/utils');

module.exports = function (app) {
    const Proposal = app.models.Proposal;
    let connectionDetails;
    const startConsumer = (connection) => {
        connection.createChannel(function (error, channel) {
            if (error) {
                logger.logError(error.message, {
                    location: "connection.createChannel",
                    connection
                });
            } else {
                const queue = config.rabbitmq.queue;
                channel.assertQueue(queue, {
                    durable: true
                });
                channel.prefetch(1);

                logger.logInfo("RABBITMQ Waiting for messages", {
                    queue
                });

                channel.consume(
                    queue,
                    async function (msg) {
                        const msgJSON = JSON.parse(msg.content);
                        switch (msgJSON.eventType) {
                            case "PROPOSAL_INFORMATION": {
                                logger.logInfo(
                                    "RabbitMq received message",
                                    {
                                        message: msg.content.toString()
                                    }
                                );
                                try {
                                    let { eventType, ...proposalData } = msgJSON;
                                    Proposal.replaceOrCreate(proposalData, (error, proposalInstance) => {
                                        if (error) {
                                            logger.logError(error.message, {
                                                location: "Proposal.replaceOrCreate"
                                            });
                                        } else {
                                            if (proposalInstance) {
                                                logger.logInfo(`Proposal was created/updated`,{
                                                    proposalId: proposalData.proposalId
                                                });
                                            }
                                        }
                                    })
                                } catch (error) {
                                    logger.logError(error.message, {
                                        location: "channel.consume"
                                    });
                                }
                                channel.ack(msg);
                                break;
                            }
                            default:
                                channel.ack(msg);
                                break;
                        }
                    },
                    {
                        noAck: false
                    }
                );
            }
        });
    }
    const sendNotificationEmail = () => {
        if ('smtpMessage' in config && 'to' in config.smtpMessage && config.smtpMessage.to) {
            const subjectText = 'Failed to connect to RabbitMQ';
            let mailText = 'Hello,\n Scicat backend failed to connect to RabbitMQ\n';
            mailText += "Connection details:\n";
            mailText += JSON.stringify(connectionDetails, null, 3);
            utils.sendMail(config.smtpMessage.to, "", subjectText, mailText, null, null);
        } else {
            logger.logWarn("smtpMessage is not configured properly no email was sent",{
                location: 'sendNotificationEmail'
            });
        }
    }
    const {maxReconnectionAttempts, reconnectionInterval} = config.rabbitmq;
    let connectionAttempts = 0;
    const connect = () => {
        
        amqp.connect(connectionDetails, function (error, connection) {
            if (error) {
                logger.logError(error.message, {
                    location: "amqp.connect",
                    connectionDetails
                });
                if (connectionAttempts < maxReconnectionAttempts) {
                    console.log("RABBITMQ - Connection attempt " + connectionAttempts)
                    connectionAttempts++;
                    // try to connect again after some amount of time
                    return setTimeout(connect, reconnectionInterval, connectionDetails);
                }
                console.log("RABBITMQ - Unable to connect");
                sendNotificationEmail();
                return;
            }
            connection.on("error", (error) => {
                logger.logError(error.message, {
                    location: "connection.on error",
                });
            });
            connection.on("close", () => {
                logger.logError("RABBITMQ - Reconnecting", {
                    location: "connection.on close",
                });
                if (connectionAttempts < maxReconnectionAttempts) {
                    console.log("RABBITMQ - Connection attempt " + connectionAttempts)
                    connectionAttempts++;
                    // try to connect again after some amount of time
                    return setTimeout(connect, reconnectionInterval, connectionDetails);
                }
                console.log("RABBITMQ - Unable to reconnect");
                sendNotificationEmail();
                return;
            });
            console.log("RABBITMQ - Connected");
            connectionAttempts = 0;
            startConsumer(connection);;
        });
    }
    const rabbitMqEnabled = config.rabbitmq ? config.rabbitmq.enabled : false;
    if (rabbitMqEnabled) {
        if (config.rabbitmq.host) {
            connectionDetails = {
                protocol: 'amqp',
                hostname: config.rabbitmq.host,
                username: config.rabbitmq.username,
                password: config.rabbitmq.password,
                heartbeat: 60,
                vhost: '/',
            }
            if (config.rabbitmq.port) {
                connectionDetails = { ...connectionDetails, port: config.rabbitmq.port }
            }
            logger.logInfo("Connecting to RabbitMq", connectionDetails);
            connect();
        }
    }
};
