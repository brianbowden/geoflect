var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var GeoEntity = require('../models/geo_entity');
var _ = require('underscore');

//mongoose.connect(process.env.GEOFLECT_MONGO_DB);

router.get('/locations/chattanooga', function(req, res) {
    
    var query = {};

    debugger;
    if (!isNaN(req.query.typeId)) {
      query.entityTypeId = Number(req.query.typeId);
      console.log("Adding query");
    }

    GeoEntity.geoNear(
      { type: 'Point', coordinates: [-85.2386909, 35.0982955] },
      { maxDistance: 5 / 3961.3, 'query': query, lean: true, spherical: true},
      function (err, data) {
        if (err) {
          console.error(err);
          res.json({error: err});

        } else {
          res.json(data);
        }
      });
})

module.exports = router;