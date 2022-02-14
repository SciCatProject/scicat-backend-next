# SciCat Backend Next

[![Build Status](https://github.com/SciCatProject/scicat-backend-next/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SciCatProject/scicat-backend-next/actions)
[![DeepScan grade](https://deepscan.io/api/teams/8394/projects/19251/branches/494247/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=8394&pid=19251&bid=494247)
[![Known Vulnerabilities](https://snyk.io/test/github/SciCatProject/scicat-backend-next/master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SciCatProject/scicat-backend-next/master?targetFile=package.json)

---

**This repository contains the source code of the next version of the SciCat backend, which is under development. The current version of the backend is located in [SciCatProject/catamel](https://github.com/SciCatProject/catamel).**

## Get started

1. `git clone https://github.com/SciCatProject/scicat-backend-next.git`
2. `npm install`
3. Add *.env* file to project root folder. See [Environment variables](#environment-variables).
4. *Optional* Add *functionalAccounts.json* file to project root folder. If not set up, the functional accounts in [functionalAccounts.json.example](/functionalAccounts.json.example) will be created automatically.
5. `npm run start:dev`

## Test the app

`npm run test`

## Environment variables

Valid environment variables for the .env file. See [.env.example](/.env.example) for examples value formats.

- `DOI_PREFIX` [string] The facility DOI prefix, with trailing slash.
- `JWT_SECRET` [string] The secret for your JWT token, used for authorization.
- `JWT_EXPIRES_IN` [number] *Optional*  How long, in seconds, the JWT token is valid. Defaults to `3600`.
- `LDAP_URL` [string] *Optional* The URL to your LDAP server.
- `LDAP_BIND_DN` [string] *Optional* Bind_DN for your LDAP server.
- `LDAP_BIND_CREDENTIALS` [string] *Optional* Credentials for your LDAP server.
- `LDAP_SEARCH_BASE` [string] *Optional* Search base for your LDAP server.
- `LDAP_SEARCH_FILTER` [string] *Optional* Search filter for you LDAP server.
- `METADATA_KEYS_RETURN_LIMIT` [number] *Optional* The return limit for the `/Datasets/metadataKeys` endpoint.
- `METADATA_PARENT_INSTANCES_RETURN_LIMIT` *Optional* The return limit of Datasets to extract metadata keys from for the `/Datasets/metadataKeys` endpoint.
- `MONGODB_URI` [string] The URI for your MongoDB instance.
- `PID_PREFIX` [string] The facility PID prefix, with trailing slash.
- `PORT` [number] *Optional* The port on which you want to access the app. Defaults to `3000`.
- `SITE` [string] The name of your site.

---

For the full documentation please go to the [SciCat home page](https://scicatproject.github.io/) and follow the [documentation link](https://scicatproject.github.io/documentation)

## License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

Scicat is developed at PSI, ESS and MAXIV with in-kind funding from ESS and from the European Union Framework Programme for Research and Innovation Horizon 2020, under grant agreement 676548, “BrightnESS”.
