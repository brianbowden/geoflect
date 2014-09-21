var mongoose = require('mongoose');
var GeoEntity = require('./models/geo_entity');
var Moment = require('moment');
var http = require('http');
var xml2js = require('xml2js'),
    parser = xml2js.Parser();

mongoose.connect('mongodb://localhost/geoflect');

var httpOptions = {
  host: 'ww2.tdot.state.tn.us',
  port: 80,
  path: '/tsw/GeoRSS/TDOTCameraGeorss.xml'
};

var cameraXml = '';

http.get(httpOptions, function(res) {
  res.setEncoding('utf8');
  
  res.on('data', function(chunk) {
    cameraXml += chunk;
  })

  res.on('end', function () {
    parser.parseString(cameraXml, function (err, data) {
      if (!err) {

        var currTime = new Moment().format();

        for (var i = 0; i < data.feed.entry.length; i++) {
          var entity = data.feed.entry[i];

          var point = entity.marker[0].split(' ');
          var lng = parseFloat(point[0]);
          var lat = parseFloat(point[1]);

          var geoEntity = new GeoEntity({
            guid: entity.id[0],
            loc: { 'type': 'Point', 'coordinates': [lat, lng]},
            title: entity.summary[0],
            entityType: 'Camera',
            imageUrl: entity.imageurl ? entity.imageurl[0] : null,
            lastModified: currTime
          });

          console.dir(geoEntity);

          geoEntity.save(function (err) {
            if (err) {
              console.error(err);
            }
          });
        }

      } else {
        console.error(err);
      }
    });

  });

}).on('error', function (err) {
  console.error(err);

});

/** Test works
var entity = new GeoEntity({
  guid: "thisisaguid",
  location: [-3.34234324, 5.50506060],
  title: "Test Title",
  description: "This is a test title",
  imageUrl: "http://google.com/images.jpg",
  lastModified: new Moment().format()
});

entity.save(function (err) {
  if (err) {
    console.error(err);
  }

  console.log("saved test entity");
})
**/