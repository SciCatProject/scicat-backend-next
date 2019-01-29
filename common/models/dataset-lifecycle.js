'use strict';
var utils = require('./utils');

module.exports = function(DatasetLifecycle) {

    // this function is called when embedded API endpoint is used, e.g  Datasets/{id}/datasetLifecycle...
    // the history is kept then within the embedded model
    
    // we need to treat only the single dataset case here
    // note: in this case no copy of the initial state of the parent Dataset is triggered

    DatasetLifecycle.observe('before save', (ctx, next) => {
        if (ctx.data) {
    
            // add history to ctx.data
            var message =JSON.parse(JSON.stringify(ctx.data)) // deep copy needed to avoid circular links
            
            // Note: for embedded model this creates an embedded history since currentInstance is just the embedded portion
            if(ctx.currentInstance && ctx.currentInstance.history){
                ctx.data.history=ctx.currentInstance.history
            } else {
                ctx.data.history=[]
            }
            ctx.data.history.push(message)
            // console.log("============= Resulting history inside datasetlifecycle:",JSON.stringify(ctx.data.history,null,3))
        }
        return next()
    })
}