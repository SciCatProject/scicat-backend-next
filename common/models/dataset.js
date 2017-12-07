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
    console.log('resetting');
    var Datablock = app.models.Datablock;
    var DatasetLifecycle = app.models.DatasetLifecycle;
    console.log(id);
    DatasetLifecycle.findOne({datasetId: id}, function(err, l) {
      console.log(l);
      l['archiveStatusMessage'] = 'datasetCreated';
      l['retrieveStatusMessage'] = '';
      DatasetLifecycle.update(l, function(err, inst) {
        if (err) {
          cb(err);
        }
        // cb('Dataset reset successfully');
      });
      Datablock.find({datasetId: "20.500.11935/cf59ce47-f645-4f37-a0c3-54f1ff7682bd"}, function(err, b) {
        console.log(b === 'undefined');
      });
    });
    /* Datablock.find({datasetId: id}, function(err, blocks) {
      console.log(err, blocks);
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
    });*/
  };
};
