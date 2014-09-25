var _ = require('underscore');
var mongoose = require('mongoose');
var GeoEntity = require('../models/geo_entity');
var logger = require('../utilities/logger');
var Moment = require('moment');
var http = require('http');
var xml2js = require('xml2js'),
    parser = xml2js.Parser();

/** TDOT GeoRSS host/paths **/
const TDOT_HOST = 'ww2.tdot.state.tn.us';
const TDOT_PATH_CAMERAS = { id: 0, name: 'Camera', path: '/tsw/GeoRSS/TDOTCameraGeorss.xml', type: 'atom' };
const TDOT_PATH_MESSAGES = { id: 1, name: 'Message Sign', path: '/tsw/GeoRSS/TDOTMessageGeorss.xml', type: 'atom' };
const TDOT_PATH_INCIDENTS = { id: 2, name: 'Incident', path: '/tsw/GeoRSS/TDOTIncidentGeoRSS.xml', type: 'rss2' };
const TDOT_PATH_CONSTRUCTION = { id: 3, name: 'Construction', path: '/tsw/GeoRSS/TDOTConstructionGeorss.xml', type: 'rss2' };
const TDOT_PATH_ROAD_CONDITIONS = { id: 4, name: 'Road Condition', path: '/tsw/GeoRSS/TDOTWeatherGeorss.xml', type: 'rss2' };
const TDOT_PATH_COUNTYWIDE_WEATHER = { id: 5, name: 'Countywide Weather Advisory', path: '/tsw/GeoRSS/TDOTCWAGeorss.xml', type: 'rss2' };
const TDOT_PATH_NASH_SPEED = { id: 6, name: 'Nashville Average Speed', path: '/tsw/GeoRSS/TDOTNashSpeedGeorss.xml', type: 'rss2' };
const TDOT_PATH_KNOX_SPEED = { id: 7, name: 'Knoxville Average Speed', path: '/tsw/GeoRSS/TDOTKnoxSpeedGeorss.xml', type: 'rss2' };
const TDOT_PATH_MEMPHIS_SPEED = { id: 8, name: 'Memphis Average Speed', path: '/tsw/GeoRSS/TDOTMempSpeedGeorss.xml', type: 'rss2' };

mongoose.connect(process.env.GEOFLECT_MONGO_DB);

function syncData(entitySource, currTime, callback) {

  var httpOptions = {
    host: TDOT_HOST,
    port: 80,
    'path': entitySource.path
  };

  var xml = '';

  var entityArray = [];
  var geoEntities = [];
  var updateCount = 0;
  var failedInsertCount = 0;

  http.get(httpOptions, function(res) {
    res.setEncoding('utf8');
    
    res.on('data', function(chunk) {
      xml += chunk;
    })

    res.on('end', function () {
      parser.parseString(xml, function (err, data) {
        if (!err) {

          if (entitySource.type === 'atom') {
            entityArray = data.feed.entry;
          } else if (entitySource.type === 'rss2') {
            entityArray = data.rss.channel[0].item;
          }

          if (!!!entityArray) {
            callback({});
            return;
          }

          for (var i = 0; i < entityArray.length; i++) {
            var entity = entityArray[i];

            var point = entity.marker[0].split(' ');
            var lng = parseFloat(point[0]);
            var lat = parseFloat(point[1]);

            var geoEntity;

            if (entitySource.type === 'atom') {
              geoEntity = {
                guid: entity.id[0],
                loc: { 'type': 'Point', 'coordinates': [lat, lng]},
                label: entity.summary[0],
                entityType: entitySource.name,
                entityTypeId: entitySource.id,
                lastModified: currTime
              };

            } else if (entitySource.type === 'rss2') {
              geoEntity = {
                guid: entity.guid[0]._,
                loc: { 'type': 'Point', 'coordinates': [lat, lng]},
                label: entity.title[0],
                entityType: entitySource.name,
                entityTypeId: entitySource.id,
                lastModified: currTime
              };

            }

            if (entity.imageurl) {
              geoEntity.url = entity.imageurl[0];
            } else {
              geoEntity.url = entity.link ? entity.link[0] : null;
            }

            if (entity.AverageSpeed) {
              geoEntity.data = entity.AverageSpeed;
            }

            GeoEntity.findOneAndUpdate({ id: geoEntity.guid }, geoEntity, { upsert: true }, function (err, geoDoc) {
              if (err) {
                console.error(err);
                failedInsertCount++;
              } else {
                geoEntities.push(geoDoc);
              }

              if (geoEntities.length + failedInsertCount === entityArray.length) {
                // This is probably a poor check that doesn't account for individual insertion/update errors
                callback(geoEntities, err);
              }
            });
          }

        } else {
          console.error(err);
          callback(null, err);
        }
      });

    });

  }).on('error', function (err) {
    console.error(err);
    callback(null, err);
  });
}

function syncSourceList(sources, callback, currTime, current, totalEntities) {
  if (!_.isNumber(current)) {
    current = 0;
  }

  if (!totalEntities) {
    totalEntities = [];
  }

  syncData(sources[current], currTime, function(geoEnts, err) {
    if (err) {
      console.error(err);
    } else if (geoEnts) {
      _.each(geoEnts, function(ent) {
        totalEntities.push(ent);
      });
    }

    debugger;

    current++;
    if (current < sources.length) {
      syncSourceList(sources, callback, currTime, current, totalEntities);
    } else {
      callback(totalEntities, currTime);
      return;
    }
  });
}

var syncMultiData = function(sources, callback) {

  var currTime = new Moment().format();

  syncSourceList(sources, function (totalEntities, currTime) {

    var typeIdQuery = [];

    _.each(sources, function (source) {
      typeIdQuery.push({'entityTypeId': source.entityTypeId});
    });

    GeoEntity.remove({ lastModified: { $lt: currTime }, entityTypeId: { $or: typeIdQuery } }, 
      function (err) {
        callback(totalEntities);
      });

  }, currTime);
}

var syncAllData = function(callback) {
  var sources = [
    TDOT_PATH_CAMERAS,
    TDOT_PATH_MESSAGES,
    TDOT_PATH_INCIDENTS,
    TDOT_PATH_CONSTRUCTION,
    TDOT_PATH_ROAD_CONDITIONS,
    TDOT_PATH_COUNTYWIDE_WEATHER,
    TDOT_PATH_NASH_SPEED,
    TDOT_PATH_KNOX_SPEED,
    TDOT_PATH_MEMPHIS_SPEED
  ];

  syncMultiData(sources, callback);
}

var syncEventData = function(callback) {
  var sources = [
    TDOT_PATH_INCIDENTS,
    TDOT_PATH_CONSTRUCTION,
    TDOT_PATH_ROAD_CONDITIONS,
    TDOT_PATH_COUNTYWIDE_WEATHER,
    TDOT_PATH_NASH_SPEED,
    TDOT_PATH_KNOX_SPEED,
    TDOT_PATH_MEMPHIS_SPEED
  ];

  syncMultiData(sources, function(totalEntities) {
    logger.log("Updated " + totalEntities.length + " event records", "eventupdate");
    callback(totalEntities);
  });
}

var syncFixedPointData = function(callback) {
  var sources = [
    TDOT_PATH_CAMERAS,
    TDOT_PATH_MESSAGES
  ];

  syncMultiData(sources, function(totalEntities) {
    logger.log("Updated " + totalEntities.length + " fixed point records", "fixedpointupdate");
    callback(totalEntities);
  });
}

if (require.main === module) {
  // Command line
  syncFixedPointData(function(totalEntities) {
    console.log("Fixed Point Request Completed");
  });
}

module.exports = {
  'syncEventData': syncEventData,
  'syncFixedPointData': syncFixedPointData
}

