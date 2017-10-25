#!/bin/bash

# export DACATHOME=/home/encima/dev/psi 
# export KUBECONFIG=/home/encima/dev/psi/catamel-psisecrets/server/kubernetes/admin.conf

envarray=(qa)
hostextarray=('-qa' '')

kubectl config use-context admin@kubernetes

for ((i=0;i<${#envarray[@]};i++)); do 
   cd $DACATHOME/catamel
   export CATAMEL_IMAGE_VERSION=$(git rev-parse HEAD)
   export LOCAL_ENV="${envarray[i]}"
   export PORTOFFSET="${portarray[i]}"
   export HOST_EXT="${hostextarray[i]}"
   echo $LOCAL_ENV $PORTOFFSET $HOST_EXT
   echo $LOCAL_ENV 
   echo pwd
   echo "Building release"
   docker build -t registry.psi.ch:5000/egli/dacatapiserver:$CATAMEL_IMAGE_VERSION$LOCAL_ENV --build-arg env=$LOCAL_ENV .
   docker push registry.psi.ch:5000/egli/dacatapiserver:$CATAMEL_IMAGE_VERSION$LOCAL_ENV
   cd  $DACATHOME/catamel-psiconfig/server/kubernetes/helm/ 
   echo "Deploying to Kubernetes"
   helm del --purge dacat-api-server-$LOCAL_ENV
   helm install dacat-api-server-qa --name dacat-api-server-$LOCAL_ENV --namespace $LOCAL_ENV --set image.tag=$CATAMEL_IMAGE_VERSION$LOCAL_ENV

done
