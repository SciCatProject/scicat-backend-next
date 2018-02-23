#!/bin/sh

cd envfiles/
git clone git@git.psi.ch:MELANIE/catamel-psiconfig.git
git clone git@git.psi.ch:MELANIE/catamel-psisecrets.git
# cp catamel-psisecrets/server/pass-db-qa/datasources_new.json datasources.json
cp catamel-psisecrets/server/providers.json envfiles/providers.json
cp catamel-psiconfig/server/config.local.js envfiles/config.local.js
# cp catamel-psiconfig/server/kubernetes/helm/dacat-api-server/envfiles-qa/middleware.json middleware.json
cd $DACATHOME/catamel
docker build -f CI/PSI/Dockerfile.test . --network=host -t catamel_test
docker run --net=host -t catamel_test
