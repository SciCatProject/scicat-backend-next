'use strict';
var utils = require('./utils');

module.exports = function(DatasetLifecycle) {

    // this function is called when embedded API endpoint is used, e.g  Datasets/{id}/datasetLifecycle...
    // the history is kept then within the embedded model
    
    DatasetLifecycle.observe('before save', (ctx, next) => {
        utils.keepHistory(ctx,next)
    })
}