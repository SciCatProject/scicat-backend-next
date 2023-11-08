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
4. _Optional_ Add _functionalAccounts.json_ file to project root folder. If not set up, the functional accounts in [functionalAccounts.json.example](/functionalAccounts.json.example) will be created automatically.
5. `npm run start:dev`
6. Go to http://localhost:3000/explorer to get an overview of available endpoints and database schemas.
7. To be able to run the e2e tests with the same setup as in the Github actions you will need to run `npm run  prepare:local` and after that run `npm run start:dev`. This will start all needed containers and copy some configuration to the right place.

## Develop in a container using the docker-compose.dev file

1. `git clone https://github.com/SciCatProject/scicat-backend-next.git`
2. docker-compose -f docker-compose.dev.yaml up -d
3. _Optional_ Mount _functionalAccounts.json_ file to a volume in the container. If not set up, the functional accounts in [functionalAccounts.json.example](/functionalAccounts.json.example) will be created automatically.
4. _Optional_ change the container env variables
5. Attach to the container
6. `npm run start:dev`
7. Go to http://localhost:3000/explorer to get an overview of available endpoints and database schemas.

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

## Environment variables

Valid environment variables for the .env file. See [.env.example](/.env.example) for examples value formats.

- `ACCESS_GROUPS_STATIC_VALUES` [string] _Optional_ Comma separated list of access groups automatically assigned to all users. Example: "scicat,user"
- `ACCESS_GROUPS_SERVICE_TOKEN` [string] _Optional_ Authentication token used if access groups are obtained from a third party service. This value is not used by the vanilla installation, but only if the instance is customized to use an external service to provide user groups, like the ESS example
- `ACCESS_GROUP_SERVICE_API_URL` [string] _Optional_ URL of the service providing the users' access groups. This value is not used by the vanilla installation, but only if the instance is customized to use an external service to provide user groups, like the ESS example
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

## License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

Scicat is developed at PSI, ESS and MAXIV with in-kind funding from ESS and from the European Union Framework Programme for Research and Innovation Horizon 2020, under grant agreement 676548, “BrightnESS”.
