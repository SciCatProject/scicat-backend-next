#!/usr/bin/env sh

# This command migrates the id fields of the relevant docuemtns in the database
# It uses the mongo client for this, so you must adjust the host and password parameters
echo "You need to adjust the script to contain the proper username/password information"
echo
echo "You should make a backup of your MongoDB before running this command!"
echo
read -p "Are you sure you want to run the script? [y/N]" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mongosh -u "dacatDBAdmin" -p "...."  --authenticationDatabase "dacat" HOSTNAME/dacat  migrateIdFields.js
fi
