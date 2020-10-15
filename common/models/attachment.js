'use strict';

module.exports = function(Attachment) {

        // put
        Attachment.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
            // convert base64 image
            
            next();
        });
    
        //patch
        Attachment.beforeRemote('patchOrCreate', function(ctx, instance, next) {
            next();
        });

};
