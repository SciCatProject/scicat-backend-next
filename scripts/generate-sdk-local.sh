#!/bin/bash

set -e

# Download the Swagger schema
curl -o ./swagger-schema.json http://localhost:3000/explorer-json

# Remove the existing SDK directory if it exists
rm -rf ./sdk

docker run \
    --rm \
    -v "${PWD}":/local \
    openapitools/openapi-generator-cli generate \
    -c /local/scripts/typescript-sdk.json \

docker run \
    --rm \
    -v "${PWD}":/local \
    openapitools/openapi-generator-cli generate \
    -c /local/scripts/python-sdk.json \

# Remove the Swagger schema file
rm ./swagger-schema.json