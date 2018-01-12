#!/bin/bash

service rabbitmq-server start

echo "Rabbit mq started"

sleep 5

npm run test
