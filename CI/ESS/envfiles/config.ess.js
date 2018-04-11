var p = require('../package.json');
var version = p.version.split('.').shift();
module.exports = {
    restApiRoot: '/api' + (version > 0 ? '/v' + version : ''),
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000,
    pidPrefix: '<PID>',
    policyPublicationShiftInYears: 3,
    policyRetentionShiftInYears: 10,
    site: '<SITE>',
    facilities: ["<FACILITY>"],
    datasetStatusMessages: {
        datasetCreated: "Dataset created",
        datasetOndisk: "Stored on primary disk and on archive disk",
        datasetOnDiskAndTape: "Stored on primary disk and on tape",
        datasetOnTape: "Stored only in archive",
        datasetRetrieved: "Retrieved to target disk",
        datasetDeleted: "Deleted from archive and disk"
    },
    datasetTransitionMessages: {
        scheduleArchive: "Scheduled for archiving",
        schedulePurgeFromDisk: "Scheduled for purging from primary disk",
        scheduleRetrieve: "Scheduled for retrieval",
        scheduleDelete: "Scheduled for removal from archive"
    },
    jobMessages: {
        jobSubmitted: "Submitted for immediate execution",
        jobSubmittedDelayed: "Submitted for delayed execution",
        jobForwarded: "Forwarded to archive system",
        jobStarted: "Execution started",
        jobInProgress: "Finished by %i percent",
        jobSuccess: "Succesfully finished",
        jobError: "Finished with errors",
        jobCancel: "Cancelled"
    },
    queue: "rabbitmq"
};

