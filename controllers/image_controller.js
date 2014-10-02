var _ = require('underscore');
var http = require('http');
var fs = require('fs');
var path = require('path');
var logger = require('../utilities/logger');
var tdotController = require('./tdot_controller');
var Moment = require('moment');
var AWS = require('aws-sdk');
var utils = require('../utilities/utils');

mongoose.connect(process.env.GEOFLECT_MONGO_DB);

AWS.config.update({
  accessKeyId: process.env.GEOFLECT_S3_KEY_ID,
  secretAccessKey: process.env.GEOFLECT_S3_SECRET,
  region: process.env.GEOFLECT_S3_REGION
})

function processImage(source, currTime, callback) {
  var key = utils.formatGuidForUrl(source.guid + currTime) + '.jpg';
  
  var filepath = path.resolve('tmp/' + key);

  var tmpFile = fs.createWriteStream(filepath);
  http.get(source.url, function (res) {
    res.pipe(tmpFile);
    tmpFile.on('finish', function() {
      tmpFile.close();

      // Do image processing

      fs.readFile(filepath, function(err, file_buffer) {
        var params = {
          Bucket: 'geoflectcamerahistory',
          Key: key,
          Body: file_buffer,
          ACL: 'public-read'
        };

        var s3 = new AWS.S3();
        s3.putObject(params, function (perr, pres) {
          if (perr) {
            logger.log({error: perr}, 'imageController');
            callback(err);
          } else {
            logger.log("Logged camera image: " + key, 'processImage');
            tdotController.addHistorySnapshot(source.guid, currTime, key);
            callback();
          }

          fs.unlink(filepath);
        });

      });
    });
  })
}

function processImageList(sources, callback, currTime, current) {
  if (!_.isNumber(current)) {
    current = 0;
  }

  processImage(sources[current], currTime, function(err) {
    if (err) {
      console.error(err);
    }

    current++;
    if (current < sources.length) {
      processImageList(sources, callback, currTime, current);
    } else {
      callback(currTime);
      return;
    }
  });
}

var downloadCameraImages = function(callback) {

  var currTime = new Moment().format();

  tdotController.getAllCameras(function(data) {
    if (data && data.geo_entities && data.geo_entities.length > 0) {
      var sources = [];

      _.each(data.geo_entities, function(entity) {
        sources.push({ 'guid': entity.guid, 'url': entity.url });
      });

      processImageList(sources, function() {
        logger.log("Images processed", 'downloadCameraImages');
      }, currTime);
    }
  });
}

if (require.main === module) {
  downloadCameraImages(function() {});
}

module.exports = { 'downloadCameraImages': downloadCameraImages }
