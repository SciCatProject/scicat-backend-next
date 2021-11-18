#!/bin/bash

pwd
service mongodb start 
service rabbitmq-server start 
NODE_ENV=dev
npm run test

# sleep 5

# npm run test
