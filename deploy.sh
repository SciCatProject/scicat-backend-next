#!/usr/bin/env sh

# script that (re-)installs catamel with the most recent version on master

# Prerequisites:
# - helm and kubectl commands are installed
# - Git repositories catamel, catamel-psiconfig, catamel-psisecrets are cheked out as master
#   into DACATHOME  directory

# Usage ./deploy.sh ENVIRONMENT(production, staging, qa, development)


if [ "$#" -ne 1 ]; then
  echo "Command to re-install catamel"
  echo "Usage ./deploy.sh ENVIRONMENT" >&2
  exit 1
fi

if [[ -z "${DACATHOME}" ]]; then
    echo "DACATHOME is not defined, you need to define it first, e.g."
    echo "export DACATHOME=~egli/melanie/"
    exit 1
fi

#
if [[ -z "${KUBECONFIG}" ]]; then
    echo "KUBECONFIG is not defined, you need to define it first, e.g."
    echo "e.g. export KUBECONFIG=~egli/melanie/catamel-psisecrets/server/kubernetes/admin.conf"
    exit 1
fi

export env=$1

# install secrets
# kubectl -n $env create secret generic loopback-mongo-secret --from-file=$DACATHOME/catamel-psisecrets/server/providers.json --from-file=$DACATHOME/catamel-psisecrets/server/pass-db-$env

# API server

# create docker image
cd $DACATHOME/catamel/
git checkout master
git pull
tag=$(git rev-parse HEAD )
sudo docker build -t registry.psi.ch:5000/egli/dacatapiserver:$tag .
sudo docker push registry.psi.ch:5000/egli/dacatapiserver:$tag

# install
cd $DACATHOME/catamel-psiconfig/server/kubernetes/helm/
helm del --purge dacat-api-server-${env}
helm install dacat-api-server --namespace=${env} --name=dacat-api-server-${env} --set image.tag=${tag}
