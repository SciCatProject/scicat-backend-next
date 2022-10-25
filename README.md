# SciCat Backend Next

[![Build Status](https://github.com/SciCatProject/scicat-backend-next/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SciCatProject/scicat-backend-next/actions)
[![DeepScan grade](https://deepscan.io/api/teams/8394/projects/19251/branches/494247/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=8394&pid=19251&bid=494247)
[![Known Vulnerabilities](https://snyk.io/test/github/SciCatProject/scicat-backend-next/master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SciCatProject/scicat-backend-next/master?targetFile=package.json)

---

**This repository contains the source code of the next version of the SciCat backend, which is under development. The current version of the backend is located in [SciCatProject/backend](https://github.com/SciCatProject/backend).**

## Get started

1. `git clone https://github.com/SciCatProject/scicat-backend-next.git`
2. `npm install`
3. Add *.env* file to project root folder. See [Environment variables](#environment-variables).
4. *Optional* Add *functionalAccounts.json* file to project root folder. If not set up, the functional accounts in [functionalAccounts.json.example](/functionalAccounts.json.example) will be created automatically.
5. `npm run start:dev`
6. Go to http://localhost:3000/explorer-next to get an overview of available endpoints and database schemas.
7. To be able to run the e2e tests with the same setup as in the Github actions you will need to run `npm run  prepare:local` and after that run `npm run start:dev`. This will start all needed containers and copy some configuration to the right place.

## Develop in a container using the docker-compose.dev file

1. `git clone https://github.com/SciCatProject/scicat-backend-next.git`
2. docker-compose -f docker-compose.dev.yaml up -d
3. *Optional* Mount *functionalAccounts.json* file to a volume in the container. If not set up, the functional accounts in [functionalAccounts.json.example](/functionalAccounts.json.example) will be created automatically.
4. *Optional* change the container env variables
5. Go to http://localhost:3000/explorer-next to get an overview of available endpoints and database schemas.

## Test the app

1. **Running the unit tests:** `npm run test`
2. **Running the e2e(api) tests:**
  - First of all run `npm run prepare:local` to prepare the local environment for starting
  - After that run `npm run start` or `npm run start:dev` for starting the backend locally
  - And in the end start the e2e/api tests with running `npm run test:e2e:mocha`

## Environment variables

Valid environment variables for the .env file. See [.env.example](/.env.example) for examples value formats.

- `DOI_PREFIX` [string] The facility DOI prefix, with trailing slash.
- `EXPRESS_SESSION_SECRET` [string] *Optional* Secret used to set up express session.
- `HTTP_MAX_REDIRECTS` [number] *Optional* Max redirects for http requests. Defaults to 5.
- `HTTP_TIMEOUT` [number] *Optional* Timeout from http requests in ms. Defaults to 5000.
- `JWT_SECRET` [string] The secret for your JWT token, used for authorization.
- `JWT_EXPIRES_IN` [number] *Optional*  How long, in seconds, the JWT token is valid. Defaults to `3600`.
- `LDAP_URL` [string] *Optional* The URL to your LDAP server.
- `LDAP_BIND_DN` [string] *Optional* Bind_DN for your LDAP server.
- `LDAP_BIND_CREDENTIALS` [string] *Optional* Credentials for your LDAP server.
- `LDAP_SEARCH_BASE` [string] *Optional* Search base for your LDAP server.
- `LDAP_SEARCH_FILTER` [string] *Optional* Search filter for you LDAP server.
- `LOGBOOK_ENABLED` [string] *Optional* Flag to enable/disable the Logbook endpoints. Values "yes" or "no". Defaults to "no".
- `LOGBOOK_BASE_URL` [string] *Optional* The base URL to the Logbook API. Only required if Logbook is enabled.
- `LOGBOOK_USERNAME` [string] *Optional* The username used to authenticate to the Logbook API. Only required if Logbook is enabled.
- `LOGBOOK_PASSWORD` [string] *Optional* The password used to authenticate to the Logbook API. Only required if Logbook is enabled.
- `METADATA_KEYS_RETURN_LIMIT` [number] *Optional* The return limit for the `/Datasets/metadataKeys` endpoint.
- `METADATA_PARENT_INSTANCES_RETURN_LIMIT` *Optional* The return limit of Datasets to extract metadata keys from for the `/Datasets/metadataKeys` endpoint.
- `MONGODB_URI` [string] The URI for your MongoDB instance.
- `OAI_PROVIDER_ROUTE` [string] *Optional* URI to OAI provider, used for the `/publisheddata/:id/resync` endpoint.
- `PID_PREFIX` [string] The facility PID prefix, with trailing slash.
- `PUBLIC_URL_PREFIX` [string] The base URL to the facility Landing Page.
- `PORT` [number] *Optional* The port on which you want to access the app. Defaults to `3000`.
- `RABBITMQ_ENABLED` [string] *Optional* Flag to enable/disable RabbitMQ consumer. Values "yes" or "no". Defaults to "no".
- `RABBITMQ_HOSTNAME` [string] *Optional* The hostname of the RabbitMQ message broker. Only required if RabbitMQ is enabled.
- `RABBITMQ_USERNAME` [string] *Optional* The username used to authenticate to the RabbitMQ message broker. Only required if RabbitMQ is enabled.
- `RABBITMQ_PASSWORD` [string] *Optional* The password used to authenticate to the RabbitMQ message broker. Only required if RabbitMQ is enabled.
- `REGISTER_DOI_URI` [string] URI to the organization that registers the facilities DOI's.
- `REGISTER_METADATA_URI` [string] URI to the organization that registers the facilities published data metadata.
- `SITE` [string] The name of your site.
- `SMTP_HOST` [string] *Optional* Host of SMTP server.
- `SMTP_MESSAGE_FROM` [string] *Optional* Email address that emails should be sent from.
- `SMTP_PORT` [string] *Optional* Port of SMTP server.
- `SMTP_SECURE` [string] *Optional* Secure of SMTP server.

## Migrating from the old SciCat Backend

Where the [current SciCat Backend](https://github.com/SciCatProject/backend) accepts id fields in the database named `pid`, `doi`, or similar, this implementation requires there to be an id field of the form `_id` on every document. It is therefore necessary to run a database migration script in your MongoDB instance before you can connect this backend to it.

The scripts [migrateIdFields.js](/scripts/migrateIdFields.js) and [migrateIdFields.sh](/scripts/migrateIdFields.sh) are located in the [/scripts](/scripts/) folder. Copy these to a location were you can access your MongoDB instance, then modify the shell script to run the script on your MongoDB instance. Once modified, start the migration by running

```sh
sh ./migrateIdFields.sh
```

---

For the full documentation please go to the [SciCat home page](https://scicatproject.github.io/) and follow the [documentation link](https://scicatproject.github.io/documentation)

## License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

Scicat is developed at PSI, ESS and MAXIV with in-kind funding from ESS and from the European Union Framework Programme for Research and Innovation Horizon 2020, under grant agreement 676548, “BrightnESS”.
