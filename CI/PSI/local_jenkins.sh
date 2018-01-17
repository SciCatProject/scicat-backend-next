#!/bin/sh

cd envfiles/
git clone git@git.psi.ch:MELANIE/catamel-psiconfig.git
git clone git@git.psi.ch:MELANIE/catamel-psisecrets.git
cp catamel-psisecrets/server/pass-db-qa/datasources_new.json datasources.json
cp catamel-psisecrets/server/providers.json providers.json
cp catamel-psiconfig/server/config.local.js config.local.js
cd ../../..
docker build --network=host -f CI/PSI/Dockerfile.test . -t catamel_test
docker run  --net=host --privileged -t catamel_test 
