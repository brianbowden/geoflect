var _ = require('underscore');
var GeoEntity = require('../models/geo_entity');
var logger = require('../utilities/logger');
var http = require('http');
var path = require('path');
var utils = require('../utilities/utils');
var tdotController = require('./tdot_controller');

function processImage(historyItem, currTime, callback) {
  var urlSegments = historyItem.url.split('/');

  var filename = urlSegments[urlSegments.length - 1];
  var filepath = path.resolve('giftmp/' + filename);

  var tmpFile = fs.createWriteStream(filepath);
  http.get(historyItem.url, function (res) {
    res.pipe(tmpFile);
    tmpFile.on('finish', function() {
      tmpFile.close();

      // Do image processing
      
  });
}

function processImageList(historyItems, callback, currTime, current) {
  if (!_.isNumber(current)) {
    current = 0;
  }

  processImage(historyItems[current], currTime, function(err) {
    if (err) {
      console.error(err);
    }

    current++;
    if (current < historyItems.length) {
      processImageList(historyItems, callback, currTime, current);
    } else {
      callback(currTime);
      return;
    }
  });
}

var createGif = function(guid, callback) {
  tdotController.getCamera(giud, function(data) {
    if (!data || data.error) {
      console.error(data.error);
      logger.log(data.error);
      callback({ error: data.error });

    } else {
      downloadImages(data.geo_entities, callback);
    }
  });
};

module.exports = { createGif: createGif };