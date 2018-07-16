'use strict';
var utils = require('./utils');

module.exports = function(PublishedDataset) {

    // put
    PublishedDataset.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        // convert base64 image
		
        next();
    });

    //patch
    PublishedDataset.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        next();
    });

}


