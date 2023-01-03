#!/bin/sh
# this command should be executed once after deploying SciCat Backend commit
# c592879d656b84f322cd062ff4ca56d45d4d10cd Date:   Tue Jan 19 12:54:58 2021 +0100
# or later
# It replaces all ObjectID based ids to normal strings in many SciCat tables
# it uses the mongo client for this, so you must adjust the host and password parameters
echo "This script is going to modify the IDs of many collections in the MongoDB using the mongo command line client."
echo "You need to adjust the script to contain the proper username/password information"
echo
echo "You should make a backup of your MongoDB before running this command !"
echo
read -p "Are you sure you want to run the script ? This action can not be undone ! " -n 1 -r
echo    
if [[ $REPLY =~ ^[Yy]$ ]]
then
    mongosh -u "dacatDBAdmin" -p "...."  --authenticationDatabase "dacat" HOSTNAME/dacat  replaceObjectIds.js
fi