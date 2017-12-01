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

  Dataset.reset = function(id, cb) {
    var Datablock = app.models.Datablock;
    var DatasetLifecycle = app.models.DatasetLifecycle;
    Datablock.destroyAll({'where': {'datasetId': id}}, function(err, blocks) {
      if (err) {
        cb(err);
      }
      console.log('Deleted datablocks');
      DatasetLifecycle.findOne({'where': {'datasetId': id}}, function(err, lifecycle) {
        if (err) {
          cb(err);
        }
        lifecycle['archiveStatusMessage'] = 'datasetCreated';
        lifecycle['retrieveStatusMessage'] = '';
        DatasetLifecycle.update(lifecycle, function(err, inst) {
          if (err) {
            cb(err);
          }
          cb('Dataset reset successfully');
        });
      });
    });
  };
};
