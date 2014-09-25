var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var GeoEntity = require('../models/geo_entity');
var Moment = require('moment');
var _ = require('underscore');

//mongoose.connect(process.env.GEOFLECT_MONGO_DB);

router.get('/locations/chattanooga', function(req, res) {
    
    var query = {};
    var centerCoords = [-85.2386909, 35.0982955];
    var radiusMiles = 5;

    debugger;
    if (!isNaN(req.query.typeId)) {
      query.entityTypeId = Number(req.query.typeId);
      console.log("Adding query");
    }

    GeoEntity.geoNear(
      { type: 'Point', coordinates: centerCoords },
      { maxDistance: radiusMiles / 3961.3, 'query': query, lean: true, spherical: true},
      function (err, data) {
        if (err) {
          console.error(err);
          res.json({error: err});

        } else {

          var meta = {};
          meta.returned_at = new Moment().format();
          meta.query_center_coordinates = centerCoords;
          meta.query_mile_radius = radiusMiles;
          meta.query_params = query;

          var entities = [];

          if (data && data.length > 0) {
            _.each(data, function(result) {
              entities.push({
                'guid': result.obj.guid,
                'label': result.obj.label,
                'entity_type': result.obj.entityType,
                'entity_type_id': result.obj.entityTypeId,
                'url': result.obj.url,
                'last_modified': result.obj.lastModified,
                'location': result.obj.loc
              });
            });
          }

          res.json({ 'meta': meta, 'geo_entities': entities });
        }
      });
})

module.exports = router;