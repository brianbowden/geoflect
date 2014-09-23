var mongoose = require('mongoose');
var GeoEntity = require('./models/geo_entity');
var Moment = require('moment');
var http = require('http');
var xml2js = require('xml2js'),
    parser = xml2js.Parser();

/** TDOT GeoRSS host/paths **/
const TDOT_HOST = 'ww2.tdot.state.tn.us';
const TDOT_PATH_CAMERAS = { id: 0, name: 'Cameras', path: '/tsw/GeoRSS/TDOTCameraGeorss.xml', type: 'atom' };
const TDOT_PATH_MESSAGES = { id: 1, name: 'Message Signs', path: '/tsw/GeoRSS/TDOTMessageGeorss.xml', type: 'atom' };
const TDOT_PATH_INCIDENTS = { id: 2, name: 'Incidents', path: '/tsw/GeoRSS/TDOTIncidentGeoRSS.xml', type: 'rss2' };
const TDOT_PATH_CONSTRUCTION = { id: 3, name: 'Construction', path: '/tsw/GeoRSS/TDOTConstructionGeorss.xml', type: 'rss2' };
const TDOT_PATH_ROAD_CONDITIONS = { id: 4, name: 'Road Conditions', path: '/tsw/GeoRSS/TDOTWeatherGeorss.xml', type: 'rss2' };
const TDOT_PATH_COUNTYWIDE_WEATHER = { id: 5, name: 'Countywide Weather Advisory', path: '/tsw/GeoRSS/TDOTCWAGeorss.xml', type: 'rss2' };
const TDOT_PATH_NASH_SPEED = { id: 6, name: 'Nashville Average Speed', path: '/tsw/GeoRSS/TDOTNashSpeedGeorss.xml', type: 'rss2' };
const TDOT_PATH_KNOX_SPEED = { id: 7, name: 'Knoxville Average Speed', path: '/tsw/GeoRSS/TDOTKnoxSpeedGeorss.xml', type: 'rss2' };
const TDOT_PATH_MEMPHIS_SPEED = { id: 8, name: 'Memphis Average Speed', path: '/tsw/GeoRSS/TDOTMempSpeedGeorss.xml', type: 'rss2' };

mongoose.connect('mongodb://localhost/geoflect');

var syncData = function(entitySource) {

  var httpOptions = {
    host: TDOT_HOST,
    port: 80,
    'path': entitySource.path
  };

  var xml = '';

  http.get(httpOptions, function(res) {
    res.setEncoding('utf8');
    
    res.on('data', function(chunk) {
      xml += chunk;
    })

    res.on('end', function () {
      parser.parseString(xml, function (err, data) {
        if (!err) {

          var currTime = new Moment().format();

          var entityArray;

          if (entitySource.type === 'atom') {
            entityArray = data.feed.entry;
          } else if (entitySource.type === 'rss2') {
            entityArray = data.rss.channel[0].item;
          }

          if (!!!entityArray) return;

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
                entityTypeId: entitySource.id,s
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

            console.dir(geoEntity);

            GeoEntity.update({ id: geoEntity.guid }, geoEntity, { upsert: true }, function (err) {
              if (err) {
                console.error(err);
              }
            })
          }

        } else {
          console.error(err);
        }
      });

    });

  }).on('error', function (err) {
    console.error(err);

  });
}

var syncAllData = function() {
  syncData(TDOT_PATH_CAMERAS);
  syncData(TDOT_PATH_MESSAGES);
  syncData(TDOT_PATH_INCIDENTS);
  syncData(TDOT_PATH_CONSTRUCTION);
  syncData(TDOT_PATH_ROAD_CONDITIONS);
  syncData(TDOT_PATH_COUNTYWIDE_WEATHER);
  // This speed geo data contains lines, not points. Fix it later.
  syncData(TDOT_PATH_NASH_SPEED);
  syncData(TDOT_PATH_KNOX_SPEED);
  syncData(TDOT_PATH_MEMPHIS_SPEED);
}

// remove this after testing!!!!!!!!!!!!!!!!!!!!!!!
syncAllData();

module.exports = {
  'syncData': syncData,
  'syncAllData': syncAllData
}

