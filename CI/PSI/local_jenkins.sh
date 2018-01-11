#!/bin/sh

cd envfiles/
git clone git@git.psi.ch:MELANIE/catamel-psiconfig.git
git clone git@git.psi.ch:MELANIE/catamel-psisecrets.git
cp catamel-psisecrets/server/pass-db-qa/datasources_new.json datasources.json
cp catamel-psisecrets/server/providers.json providers.json
cp catamel-psiconfig/server/config.local.js config.local.js
cp catamel-psiconfig/server/kubernetes/helm/dacat-api-server/envfiles-qa/component-config.json component-config.json
cp catamel-psiconfig/server/kubernetes/helm/dacat-api-server/envfiles-qa/middleware.json middleware.json
cd ../../..
docker build -f CI/PSI/Dockerfile.test . -t catamel_test
docker run  --privileged -t catamel_test npm run test
