'use strict';
var utils = require('./utils');

module.exports = function(PublishedData) {

    // put
    PublishedData.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
        // convert base64 image
		
        next();
    });

    //patch
    PublishedData.beforeRemote('patchOrCreate', function(ctx, instance, next) {
        next();
    });

}


