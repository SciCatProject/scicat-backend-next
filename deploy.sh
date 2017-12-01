#!/bin/bash 

export DACATHOME=~/dev/psi 
export KUBECONFIG=~/dev/psi/catamel-psisecrets/server/kubernetes/admin.conf

envarray=(development qa production)

kubectl config use-context admin@kubernetes

for ((i=0;i<${#envarray[@]};i++)); do 
    cd $DACATHOME/catamel/
    git pull
    env="${envarray[i]}"
   read -r -p "Deploy to $env? [y/N] " response
   if [[ "$response" =~ ^([yY][eE][sS]|[yY])+$ ]]
   then
      echo "Building release"
      tag=$(git rev-parse HEAD )
      sudo docker build -t registry.psi.ch:5000/egli/dacatapiserver:$tag .
      sudo docker push registry.psi.ch:5000/egli/dacatapiserver:$tag

      # install
      echo "Deploying via helm"
      cd $DACATHOME/catamel-psiconfig/server/kubernetes/helm/
      helm del --purge dacat-api-server-${env}
      helm install dacat-api-server --namespace=${env} --name=dacat-api-server-${env} --set image.tag=${tag}
   else
      continue
   fi
done
