#!/bin/sh
echo "Make sure that api server is running with newest data model"
echo "The existing python API directory will be completely removed before creating the new"
read -p "Continue ?" yn
case $yn in
    [Yy]* ) rm -rf python; wget -O swagger.json http://localhost:3000/explorer/swagger.json; java -jar ./swagger-codegen/swagger-codegen-cli.jar generate -i swagger.json -l python -o python; break;;
    [Nn]* ) exit;;
    * ) echo "Please answer yes or no.";;
esac

