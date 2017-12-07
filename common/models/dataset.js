'use strict';

var config = require('../../server/config.local');
var p = require('../../package.json');

module.exports = function(Dataset) {
  var app = require('../../server/server');
  // Dataset.validatesUniquenessOf('sourceFolder', {
  //     message: 'SourceFolder is not unique'
  // });
  //

  Dataset.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      ctx.instance.pid = config.pidPrefix + '/' + ctx.instance.pid;
      console.log(' new pid:', ctx.instance.pid);
      ctx.instance.version = p.version;
    }
    next();
  });

  Dataset.reset = function(id, options, cb) {
    console.log('resetting ' + id);
    var Datablock = app.models.Datablock;
    var DatasetLifecycle = app.models.DatasetLifecycle;
    DatasetLifecycle.findOne({datasetId: id}, options, function(err, l) {
      if (err) {
        cb(err);
      }
      l['archiveStatusMessage'] = 'datasetCreated';
      l['retrieveStatusMessage'] = '';
      DatasetLifecycle.update(l, function(err, inst) {
        if (err) {
          cb(err);
        }
        console.log('Dataset Lifecycle reset');
        Datablock.destroyAll({datasetId: id}, options, function(err, b) {
          if (err) {
            cb(err);
          }
          console.log('Deleted blocks');
          cb();
        });
      });
    });
  };
};
