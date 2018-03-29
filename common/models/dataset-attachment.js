'use strict';
var utils = require('./utils');

module.exports = function(DatasetAttachment) {

    // put
    DatasetAttachment.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        // convert base64 image
		
        next();
    });

    //patch
    DatasetAttachment.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        next();
    });

}


