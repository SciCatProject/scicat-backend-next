#!/bin/sh
cd ../..
./node_modules/.bin/lb-sdk -d ng2universal server/server.js  ../catanie/src/app/shared/sdk
cd -
