#!/bin/sh

# git clone git@git.psi.ch:MELANIE/catamel-psiconfig.git
# git clone git@git.psi.ch:MELANIE/catamel-psisecrets.git
cp $DACATHOME/catamel-psisecrets/server/pass-db-qa/datasources.json envfiles/datasources.json
cp $DACATHOME/catamel-psisecrets/server/providers.json envfiles/providers.json
cp $DACATHOME/catamel-psiconfig/server/config.local.js envfiles/config.local.js
cp $DACATHOME/catamel-psisecrets/server/settings.json envfiles/settings.json

# cp catamel-psiconfig/server/kubernetes/helm/dacat-api-server/envfiles-qa/middleware.json middleware.json
cd $DACATHOME/catamel
docker build -f CI/PSI/Dockerfile.test . --network=host -t catamel_test
docker run --net=host -t catamel_test
