#!/bin/bash

service rabbitmq-server start

echo "Rabbit mq started"

npm run test
