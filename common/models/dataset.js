'use strict';

var config = require('../../server/config.local');
var p = require('../../package.json');

module.exports = function(Dataset) {


    // Dataset.validatesUniquenessOf('sourceFolder', {
    //     message: 'SourceFolder is not unique'
    // });

    // prepend PID prefix, e.g. 20.500.12345 and add version number of API

    Dataset.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            ctx.instance.pid = config.pidPrefix + '/' + ctx.instance.pid;
            console.log(' new pid:', ctx.instance.pid);
            ctx.instance.version=p.version
        }
        next();
})
};
