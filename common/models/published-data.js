'use strict';
// var utils = require('./utils');

module.exports = function(PublishedData) {


    PublishedData.get_doi = function(msg, cb) {
        cb(null, '10.111.79/TES/DOI ' + msg);
    }

    PublishedData.remoteMethod('get_doi', {
        accepts: {arg: 'msg', type: 'string'},
        returns: {arg: 'doi', type: 'string'}
    });
     // TODO add logic that give authors privileges to modify data

    // // put
    // PublishedData.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
    //     // convert base64 image
    //
    //     next();
    // });
    //
    // //patch
    // PublishedData.beforeRemote('patchOrCreate', function(ctx, instance, next) {
    //     next();
    // });

}
