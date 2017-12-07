#!/bin/bash 

cd $DACATHOME/catamel/client/

echo "copying sdk"
cp -r $DACATHOME/catanie/src/app/shared/sdk/services/custom/User.ts $DACATHOME/sdk/services/custom/User.ts
rm -rf $DACATHOME/catanie/src/app/shared/sdk 
cp -r api/angular2/sdk $DACATHOME/catanie/src/app/shared/sdk/ 
cp $DACATHOME/sdk/services/custom/User.ts $DACATHOME/catanie/src/app/shared/sdk/services/custom/User.ts
echo "done"
