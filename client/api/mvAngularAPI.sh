#!/bin/bash 

cd $DACATHOME/catamel/client/

echo "copying sdk"
rm -rf $DACATHOME/catanie/src/app/shared/sdk 
cp -r api/angular2/sdk $DACATHOME/catanie/src/app/shared/sdk/ 
cp $DACATHOME/auth.service.ts $DACATHOME/catanie/src/app/shared/sdk/services/core
cp $DACATHOME/User.ts $DACATHOME/catanie/src/app/shared/sdk/services/custom/User.ts
echo "done"
