# SciCat Data Catalog Backend
[![Build Status](https://travis-ci.org/SciCatProject/catamel.svg?branch=develop)](https://travis-ci.org/SciCatProject/catamel)
[![Greenkeeper badge](https://badges.greenkeeper.io/SciCatProject/catamel.svg)](https://greenkeeper.io/)

The data catalog backend is based on [NoSQL database MongoDB](https://www.mongodb.com/), [the Node based web application framework Express](http://expressjs.com/) and [the API framework Loopback](http://loopback.io/) technology stack (the "MEL" part of the "MELANIE" technology stack). It provides a REST based API which allows to store information about datasets and to allow to answer queries about the stored meta data for these datasets

# Getting started

## Prerequisites
You need to setup a MongoDB server. E.g. on a Redhat Linux System the following command will suffice

```
yum install mongodb-org-server
```

On MacOS 
```
brew install mongodb
```


The needed database will be created automatically when the API server starts. Follow this [description](https://docs.mongodb.com/manual/tutorial/enable-authentication/) to enable authenticated access to the Mongo DB.

## Get code
```
git clone https://github.com/SciCatProject/catamel.git
cd catamel
npm install
```

## Configure database source
Add a `datasources.json` file inside the `server` directory with connection data to your mongodb instance. If using a local mongodb installation, running on port 27017, e.g. you can change the `"host"` property to read `"host":"localhost:27017"`

```
server/datasources.json e.g.
{
  "mongo": {
    "host": "mongodbprod.my.site",
    "user": "dacatDBAdmin",
    "password": "myverysecretPW"
  }
}

```

## Add providers.json
Add a file `providers.json` inside the `server` directory.

```
{
    "local": {
        "provider": "local",
        "module": "passport-local",
        "usernameField": "username",
        "passwordField": "password",
        "authPath": "/auth/local",
        "successRedirect": "/auth/account",
        "failureRedirect": "/local",
        "failureFlash": true
    }
}
```


## Add local config file
Add a file `config.local.js` inside the `server` directory. You can add your own PID prefix (e.g. from Handle.net), site name (e.g. ESS) and facilities ('beamline1', 'beamline2', etc)
```
var p = require('../package.json');
var version = p.version.split('.').shift();
module.exports = {
    restApiRoot: '/api' + (version > 0 ? '/v' + version : ''),
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000,
    pidPrefix: '<PID>',
    policyPublicationShiftInYears: 3,
    policyRetentionShiftInYears: 10,
    site: '<MYSITE>',
    facilities: [<MYFACILITY1>],
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
    }
};
```

## Email Notifications

Inside your `config.local.js`, you can add the following blocks to enable email notification on submission of a Job. In the future, other notification types will be supported.

```
    smtpSettings: {
      host: 'mail.ethz.ch',
      port: 587,
      secure: false,
      auth: {user: 'psich\\USER', pass: 'PWD'}
    },
    smtpMessage: {
      from: 'USER@psi.ch',
      to: undefined,
      subject: '[SciCat]',
      text: undefined // can also set html key and this will override this
    }
```

The Job model checks for the existence of these blocks and sends an email from the User specified. You can override the object with the `html` key and send much more prettified content.




## Start API server
```
node .
```

## initialize admin , archiveManager and ingestor accounts

Insert in the following curl commands the respective usernames like admin , archiveManager and ingestor and set their passwords. These are local accounts defined within the loopback application database

```
curl -X POST --header 'Content-Type: application/json' --header 'Accept:application/json' -d'{"realm":"my.site","username":"...","password":"...!","email":"valid.email@my.site","emailVerified":true}' 'http://localhost:3000/api/v2/Users'

```

## Queuing Options

Jobs in Catamel are published to a queue when they are received. It is your responsibility to configure that queue and there is NO default in place.

Without setting this up, none of your job submissions will NOT go anywhere.

The two supported options are:
1. RabbitMQ (loopback-component-mq)
2. Apache Kafka (loopback-connector-kafka)

Both packages are installed at time of install and you can select a queue in `config.local.js`, like this:

`queue: "rabbitmq" // also accepts "kafka" or null`


### Rabbit

1. Set `config.local.js` queue value to "rabbitmq".
2. Provide configuration for rabbitmq as a new block in `component-config.json`. NOTE: Make sure this is empty

### Kafka

1. Set `config.local.js` queue value to "kafka".
2. Instructions for configuring Kafka can be found [here](https://www.npmjs.com/package/loopback-connector-kafka)

* Creating a datasource programatically in the model you want to attach will often be the easiest solution.

NOTE: An example of kafka has been set in `Job.js`

# Data models

The data model is defined inside the common/models directory according to the rules defined by the Loopback API framework
The data model is visualized in form of an

Model UML diagram which can be seen at <catamel_url:port>/modeldiagram or
![model diagram](https://github.com/SciCatProject/catamel/blob/develop/CI/ESS/scicatmodeldiagram.png)

Model Visualizer which can be seen at <catamel_url:port>/visualize 

# Data Catalog API

## REST API

The REST API can be tested via the [Explorer webpage](http://localhost:3000/explorer)
The [OpenAPI definition](https://www.openapis.org/) can be fetched from  [the Swagger Definition link](http://localhost:3000/explorer/swagger.json)

## Python Client API
The API is automatically created from the Swagger/openAPI (http://swagger.io/) specificication created from the data model using the [Swagger Codegen code](https://github.com/swagger-api/swagger-codegen)

```
java -jar ./swagger-codegen/modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate -i swagger.json -l python -o dacat-api/client/python
```

See e.g. the [description of Dataset model](https://gitlab.psi.ch/MELANIE/catamel/blob/master/client/python/docs/Dataset.md)

## Angular 2 Client API
The library is generated by the following command
```
./node_modules/.bin/lb-sdk server/server.js  client/angular2/sdk
```

## Authentication
Users are authenticated by loopback built in user accounts and by accounts, which are connected via any of the passport supported strategies, in particular OpenID connected and a direct AD connection

## Policy Configuration for Archiving and Retrieving
![model diagram](https://github.com/SciCatProject/catamel/blob/develop/CI/ESS/images/policy1.png)
