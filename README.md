# SciCat Backend

## Version: v4.x

## NestJS implementation

[![Test](https://github.com/SciCatProject/scicat-backend-next/actions/workflows/test.yml/badge.svg)](https://github.com/SciCatProject/scicat-backend-next/actions/workflows/test.yml)
[![Deploy](https://github.com/SciCatProject/scicat-backend-next/actions/workflows/deploy.yml/badge.svg)](https://github.com/SciCatProject/scicat-backend-next/actions/workflows/deploy.yml)
[![DeepScan grade](https://deepscan.io/api/teams/8394/projects/19251/branches/494247/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=8394&pid=19251&bid=494247)
[![Known Vulnerabilities](https://snyk.io/test/github/SciCatProject/scicat-backend-next/master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SciCatProject/scicat-backend-next/master?targetFile=package.json)

---

# IMPORTANT!!!!

**As of 2023/06/15, this repository holds the official version of SciCat backend**
This is the only version that is officially supported. It is commonly referred to as backend, BE, v4.x or a combination of them.

You can find the old backend (v3.x, loopback implementation) at (https://github.com/SciCatProject/backend).
The repo for backend v3.x is archived and read-only

If you have any questions, please feel free to contact any member of the development team,
or the SciCat team at ESS.

## Get started

1. `git clone https://github.com/SciCatProject/scicat-backend-next.git`
2. `npm install`
3. Add _.env_ file to project root folder. See [Environment variables](#environment-variables).
4. _Optional_ Add [functionalAccounts.json](#local-user-accounts) file to project root folder to create local users.
5. _Optional_ Add [loggers.json](#loggers-configuration) file to the root folder and configure multiple loggers.
6. `npm run start:dev`
7. Go to http://localhost:3000/explorer to get an overview of available endpoints and database schemas.
8. To be able to run the e2e tests with the same setup as in the Github actions you will need to run `npm run  prepare:local` and after that run `npm run start:dev`. This will start all needed containers and copy some configuration to the right place.

## Develop in a container using the docker-compose.dev file

1. `git clone https://github.com/SciCatProject/scicat-backend-next.git`
2. docker-compose -f docker-compose.dev.yaml up -d
3. _Optional_ Mount [functionalAccounts.json](#local-user-accounts) file to a volume in the container to create local users.
4. _Optional_ Mount [loggers.json](#loggers-configuration) file to a volume in the container to configure multiple loggers.
5. _Optional_ change the container env variables
6. Attach to the container
7. `npm run start:dev`
8. Go to http://localhost:3000/explorer to get an overview of available endpoints and database schemas.

## Test the app

1. **Running the unit tests:** `npm run test`
2. **Running the e2e(api) tests:**

- First of all run `npm run prepare:local` to prepare the local environment for starting
- After that run `npm run test:api` which will start the backend locally and run both `jest` and `mocha` e2e(api) tests.
- [Optional] If you want to run only the mocha tests you will need to start the backend locally with `npm run start` and then use `npm run test:api:mocha`
- [Optional] If you want to run only the jest tests you can use `npm run test:api:jest`

## Configuration

There are multiple ways to configure your SciCat instance.

In order to configure a SciCat instance run on barebone OS, there are three options:

1. Edit directly the file `src/config/configuration.ts`
2. Create a `.env` file with your local value of the variables listed in the next session. Only the variables that are required by your installation should be defined. To create your `.env` file, you can copy and edit the sample `.env.example` provided with in code
3. Define in your environment all the necessary variables (list provided below), prior running SciCat.

If SciCat runs in a containeraized environment, like docker or kubernetes, you can run the release image and specify your configuration using one of the following two methods:

1. create `.env` and mount it directly in your container.
2. define the necessary environment variables directly in your container.

More information are provided in the official documentation.

### Local User Accounts

Providing a file called _functionalAccounts.json_ at the root of the project, locally or in the container, will
automatically create the specified accounts on startup. If this file is not provided, no local users will be created.

Follow the structure of [functionalAccounts.json.minimal.example](/functionalAccounts.json.minimal.example) to create
your own _functionalAccounts.json_ file.

### Loggers configuration

Providing a file called _loggers.json_ at the root of the project, locally or in the container, and create an external logger class in the `src/loggers/loggingProviders/`directory will automatically create specified one or multiple loggers instances.

The `loggers.json.example` file in the root directory showcases the example of configuration structure for the one or multiple loggers. `logger.service.ts` file contains the configuration handling process logic, and `src/loggers/loggingProviders/grayLogger.ts` includes actual usecase of grayLogger.

## Environment variables

Valid environment variables for the .env file. See [.env.example](/.env.example) for examples value formats.

- `ADMIN_GROUPS` [string] _Optional_ Comma separated list of admin groups with admin permission assigned to the listed users. Example: "admin, ingestor". For more details check: [Scicat Documentation](https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization.html)
- `CREATE_DATASET_GROUPS` [string] _Optional_ Comma seperated list of create dataset groups. Users belong to the listed groups can create dataset with/without PID. Example: "group1, group2". For more details check: [Scicat Documentation](https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization.html)
- `CREATE_DATASET_WITH_PID_GROUPS` [string] _Optional_ Comma seperated list of create dataset with pid groups. Users belong to the listed groups can create dataset with PID. Example: "group1, group2". For more details check: [Scicat Documentation](https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization.html)
- `DELETE_GROUPS` [string] _Optional_ Comma seperated list of delete groups. Users belong to the listed groups can delete any dataset, origDatablocks, datablocks etc. For more details check: [Scicat Documentation](https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization.html)
- `DATASET_CREATION_VALIDATION_ENABLED` [boolean] Flag to enable/disable dataset validation to validate if requested new dataset is valid with given regular expression. Preconfigure **DATASET_CREATION_VALIDATION_REGEX** variable is required. Default value: false
- `DATASET_CREATION_VALIDATION_REGEX` [string] Regular expression validation for new dataset request. Default value: ""
- `PROPOSAL_GROUPS` [string] _Optional_ Comma separated list of proposal groups with permission to create any proposals. Example: "proposaladmin, proposalingestor". For more details check: [Scicat Documentation](https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization.html)
- `SAMPLE_GROUPS` [string] _Optional_ Comma separated list of sample groups with permission to create any samples. Example: "sampleadmin, sampleingestor". For more details check: [Scicat Documentation](https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization.html)

- `ACCESS_GROUPS_GRAPHQL_ENABLED` [string] _Optional_ Flag to enable/disable the graphql service get access groups. In order to use this service following variables needs to be configured: `ACCESS_GROUP_SERVICE_TOKEN`, `ACCESS_GROUP_SERVICE_API_URL` and `ACCESS_GROUP_SERVICE_HANDLER` respectively. Values true or false. Defaults to true.
- `ACCESS_GROUPS_SERVICE_TOKEN` [string] _Optional_ Authentication token used if access groups are obtained from a third party service. This value is not used by the vanilla installation, but only if the instance is customized to use an external service to provide user groups, like the ESS example
- `ACCESS_GROUP_SERVICE_API_URL` [string] _Optional_ URL of the service providing the users' access groups. This value is not used by the vanilla installation, but only if the instance is customized to use an external service to provide user groups, like the ESS example
- `ACCESS_GROUP_SERVICE_HANDLER` [string] _Optional_ Configuration property that points to the source of a module. This module provides a specific responseProcessor function for handling GraphQL responses and a query template for making GraphQL requests
- `ACCESS_GROUPS_STATIC_ENABLED` [string] _Optional_ Flag to enable/disable automatic assignment of predefined access groups to all users. Values true or false. Defaults to true.
- `ACCESS_GROUPS_STATIC_VALUES` [string] _Optional_ Comma separated list of access groups automatically assigned to all users. Example: "scicat, user"
- `ACCESS_GROUPS_OIDCPAYLOAD_ENABLED` [string] _Optional_ Flag to enable/disable fetching access groups directly from OIDC response. Requires specifying a field via `OIDC_ACCESS_GROUPS_PROPERTY` to extract access groups. Defaults to false

- `DOI_PREFIX` [string] The facility DOI prefix, with trailing slash.
- `EXPRESS_SESSION_SECRET` [string] _Optional_ Secret used to set up express session.
- `HTTP_MAX_REDIRECTS` [number] _Optional_ Max redirects for http requests. Defaults to 5.
- `HTTP_TIMEOUT` [number] _Optional_ Timeout from http requests in ms. Defaults to 5000.
- `JWT_SECRET` [string] The secret for your JWT token, used for authorization.
- `JWT_EXPIRES_IN` [number] _Optional_ How long, in seconds, the JWT token is valid. Defaults to `3600`.
- `LDAP_URL` [string] _Optional_ The URL to your LDAP server.
- `LDAP_BIND_DN` [string] _Optional_ Bind_DN for your LDAP server.
- `LDAP_BIND_CREDENTIALS` [string] _Optional_ Credentials for your LDAP server.
- `LDAP_SEARCH_BASE` [string] _Optional_ Search base for your LDAP server.
- `LDAP_SEARCH_FILTER` [string] _Optional_ Search filter for you LDAP server.
- `OIDC_ISSUER` [string] _Optional_ URL of the oidc server providing the authentication service. Example: https://identity.esss.dk/realm/ess.
- `OIDC_CLIENT_ID` [string] _Optional_ Identity of the client that we want to use to obtain the user token. Example: scicat
- `OIDC_CLIENT_SECRET` [string] _Optional_ Secret to provide to the oidc service to obtain the user token. Example: Aa1JIw3kv3mQlGFWhRrE3gOdkH6xreAwro
- `OIDC_CALLBACK_URL` [string] _Optional_ SciCat callback URL that we want th eoidc service to redirect to, in case of successful login. Example: http://myscicat/api/v3/oidc/callback
- `OIDC_SCOPE` [string] _Optional_ Space separated list of the info returned by the oidc service. Example: "openid profile email"
- `OIDC_SUCCESS_URL` [string] _Optional_ SciCat Frontend auth-callback URL. Required in order to pass user credentials to SciCat Frontend after OIDC login. Example: https://myscicatfrontend/auth-callback
- `OIDC_ACCESS_GROUPS` [string] _Optional_ Functionality is still unclear.
- `OIDC_ACCESS_GROUPS_PROPERTY` [string] _Optional_ Target field to get the access groups value from OIDC response.
- `OIDC_USERINFO_MAPPING_FIELD_USERNAME` [string] _Optional_ comma-separated list. Specifies the fields from the OIDC response to concatenate and use as the user's profile username. For example, setting `OIDC_USERINFO_MAPPING_FIELD_USERNAME="iss, sub"` combines the iss (issuer) and sub (subject) values from the OIDC response, resulting in a username like `myIssuer_myUserName`. This allows for customizable username definitions based on OIDC response attributes. Defaults to "preferred_username" || "name"
- `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME` [string] _Optional_ Specifies the fields from the OIDC response and use as the user's profile displayname. For example, setting `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME="preferred_username"` use displayName value from the OIDC response, resulting in a displayname like `myPreferredName`. This allows for customizable displayname definitions based on OIDC response attributes. Defaults to "name"
- `OIDC_USERINFO_MAPPING_FIELD_EMAIL` [string] _Optional_ Same as `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME`. Defaults to "email"
- `OIDC_USERINFO_MAPPING_FIELD_FAMILYNAME` [string] _Optional_ Same as `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME`. Defaults to "family_name"
- `OIDC_USERINFO_MAPPING_FIELD_ID` [string] _Optional_ Same as `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME`. Defaults to "sub" || "user_id"
- `OIDC_USERINFO_MAPPING_FIELD_THUMBNAILPHOTO` [string] _Optional_ Same as `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME`. Defaults to "thumbnailPhoto"
- `OIDC_USERINFO_MAPPING_FIELD_PROVIDER` [string] _Optional_ Same as `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME`. Defaults to "iss"
- `OIDC_USERINFO_MAPPING_FIELD_GROUP` [string] _Optional_ Same as `OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME`. Defaults to "groups"
- `OIDC_USERQUERY_OPERATOR` [string] _Optional_ Specifies the operator ("or" or "and") for UserModel.findOne queries, determining the logic used to match fields like "username" or "email". Example: `UserModel.findOne({$or: {"username":"testUser", "email":"test@test.com"}})`. Defaults to "or"
- `OIDC_USERQUERY_FILTER` [string] _Optional_ Defines key-value pairs for UserModel.findOne queries, using a "key:value" format. Values should correspond to fields in the userProfile object. For instance,` OIDC_USERQUERY_FILTER="username:sub, email:email"` maps to `userProfile.sub` and `userProfile.email` respectively. Defaults to "username:username, email:email"

- `LOGBOOK_ENABLED` [string] _Optional_ Flag to enable/disable the Logbook endpoints. Values "yes" or "no". Defaults to "no".
- `LOGBOOK_BASE_URL` [string] _Optional_ The base URL to the Logbook API. Only required if Logbook is enabled.

- `METADATA_KEYS_RETURN_LIMIT` [number] _Optional_ The return limit for the `/Datasets/metadataKeys` endpoint.
- `METADATA_PARENT_INSTANCES_RETURN_LIMIT` _Optional_ The return limit of Datasets to extract metadata keys from for the `/Datasets/metadataKeys` endpoint.
- `MONGODB_URI` [string] The URI for your MongoDB instance.
- `OAI_PROVIDER_ROUTE` [string] _Optional_ URI to OAI provider, used for the `/publisheddata/:id/resync` endpoint.
- `PID_PREFIX` [string] The facility PID prefix, with trailing slash.
- `PUBLIC_URL_PREFIX` [string] The base URL to the facility Landing Page.
- `PORT` [number] _Optional_ The port on which you want to access the app. Defaults to `3000`.
- `RABBITMQ_ENABLED` [string] _Optional_ Flag to enable/disable RabbitMQ consumer. Values "yes" or "no". Defaults to "no".
- `RABBITMQ_HOSTNAME` [string] _Optional_ The hostname of the RabbitMQ message broker. Only required if RabbitMQ is enabled.
- `RABBITMQ_USERNAME` [string] _Optional_ The username used to authenticate to the RabbitMQ message broker. Only required if RabbitMQ is enabled.
- `RABBITMQ_PASSWORD` [string] _Optional_ The password used to authenticate to the RabbitMQ message broker. Only required if RabbitMQ is enabled.
- `REGISTER_DOI_URI` [string] URI to the organization that registers the facilities DOI's.
- `REGISTER_METADATA_URI` [string] URI to the organization that registers the facilities published data metadata.
- `SITE` [string] The name of your site.
- `SMTP_HOST` [string] _Optional_ Host of SMTP server.
- `SMTP_MESSAGE_FROM` [string] _Optional_ Email address that emails should be sent from.
- `SMTP_PORT` [string] _Optional_ Port of SMTP server.
- `SMTP_SECURE` [string] _Optional_ Secure of SMTP server.
- `POLICY_PUBLICATION_SHIFT` [integer] _Optional_ Embargo period expressed in years. Default value: 3 years
- `POLICY_RETENTION_SHIFT` [integer] _Optional_ Retention period (aka how long the facility will hold on to data) expressed in years. Default value: -1 (data will be hold indefinitely)

- `ELASTICSEARCH_ENABLED` [string] Flag to enable/disable the Elasticsearch endpoints. Values "yes" or "no". Defaults to "no"
- `ES_HOST` [string] Host of Elasticsearch server instance
- `ES_USERNAME` [string] _Optional_ Elasticsearch username that can be customized when loads Elasticsearch server. Default value: 'elastic'
- `ES_PASSWORD` [string] Elasticsearch password that can be customized when loads Elasticsearch server.
- `MONGODB_COLLECTION` [string] Collection name to be mapped into specified Elasticsearch index. Used for data synchronization between mongoDB and Elasticsearch index.
- `ES_MAX_RESULT` [number] Maximum records can be indexed into Elasticsearch. Default value: 10000
- `ES_FIELDS_LIMIT` [number] The total number of fields in an index. Default value: 1000
- `ES_REFRESH` [string] If set to `wait_for` Elasticsearch will wait till data is insereted to specificied index then return response. Unless you have a good reason to wait for the change to become visible, always use `false` (the default setting).

- `LOGGERS_CONFIG_FILE` [string] The file name for loggers configuration which needs to be located in the project root directory. Default value: "loggers.json"

## Migrating from the old SciCat Backend

Where the [current SciCat Backend](https://github.com/SciCatProject/backend) accepts id fields in the database named `pid`, `doi`, or similar, this implementation requires there to be an id field of the form `_id` on every document. It is therefore necessary to run a database migration script towards MongoDB instance from a place where you have access to it and can install `migrate-mongo` package.

All database [migration scripts](https://github.com/SciCatProject/scicat-backend-next/tree/master/migrations) located in the [migrations](/migrations/) folder. To start the migration use:

```sh
npm run migrate:db:up
```

For down migration use:

```sh
npm run migrate:db:down
```

For listing applied DB migrations:

```sh
npm run migrate:db:status
```

---

For the full documentation please go to the [SciCat home page](https://scicatproject.github.io/) and follow the [documentation link](https://scicatproject.github.io/documentation)

## Migration documentation and NestJs resources

Following are the post that I found useful working on the migration:

- Schema and DTOs: https://betterprogramming.pub/how-to-use-data-transfer-objects-dto-for-validation-in-nest-js-7ff95309f650
- Validation:
  - [Official documentation](https://docs.nestjs.com/techniques/validation)
  - [Custom validation with datasbase in NestJs](https://dev.to/avantar/custom-validation-with-database-in-nestjs-gao)
  - [Validating nested objects with class-validator in NestJs](https://dev.to/avantar/validating-nested-objects-with-class-validator-in-nestjs-1gn8)
  - [Validating numeric query parameters in NestJS](https://dev.to/avantar/validating-numeric-query-parameters-in-nestjs-gk9)
  - [Injecting request object to a custom validation class in NestJS](https://dev.to/avantar/injecting-request-object-to-a-custom-validation-class-in-nestjs-5dal)
- Swagger and OpenAPI:
  - https://docs.nestjs.com/openapi/introduction
  - https://docs.nestjs.com/openapi/types-and-parameters
  - https://docs.nestjs.com/openapi/decorators

## New Release Version Bump Workflow

### Workflow Overview

Scicat Backend controls new releases with the `GitHub-tag-and-release` GitHub Action. This workflow is triggered by push events to the release branch. It automates the version bumping and release processes based on semantic commit messages. Full documentation of the action package can be found on [github-tag-action](https://github.com/marketplace/actions/github-tag)

The image below shows visualized workflow.

### Workflow Trigger Condition

> [!Caution]  
> Any push to the `release` branch initiates the workflow.

### Versioning and Release Strategy

**Semantic Versioning:**

- The version is automatically bumped according to the semantic PR titles, using the [semantic-release](https://github.com/semantic-release/semantic-release) conventions:

  - `fix:` prefixed titles generate a patch release.
  - `feat:` prefixed titles generate a minor release.
  - `BREAKING CHANGE:` in the commit message triggers a major release.

**Auto-generated Release Notes:**

The release log is automatically populated with all commit messages since the last tag, providing a detailed changelog for the release. By default semantic-release uses [Angular Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

In order to generate detailed changelog for the release, the following type for the `commit message`/`PR title` should be used:

- feat: message - A new feature
- fix: message - A bug fix
- docs: message - Documentation only changes
- style: message - Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: message - A code change that neither fixes a bug nor adds a feature
- perf: message - A code change that improves performance
- test: message - Adding missing or correcting existing tests
- chore: message - Changes to the build process or auxiliary tools and libraries such as documentation generation

## License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

Scicat is developed at PSI, ESS and MAXIV with in-kind funding from ESS and from the European Union Framework Programme for Research and Innovation Horizon 2020, under grant agreement 676548, “BrightnESS”.
