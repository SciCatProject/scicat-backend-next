#!/bin/sh
# this command should be executed once after deploying catamel commit
# c592879d656b84f322cd062ff4ca56d45d4d10cd Date:   Tue Jan 19 12:54:58 2021 +0100
# or later
# It replaces all ObjectID based ids to normal strings in many SciCat tables
# it uses the mongo client for this, so you must adjust the host and password parameters
echo " Adjust the following line and uncomment"
# mongo -u "dacatDBAdmin" -p "...."  --authenticationDatabase "dacat" HOSTNAME/dacat  replaceObjectIds.js
