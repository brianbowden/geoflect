var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var tdotController = require('../controllers/tdot_controller');
var GeoEntity = require('../models/geo_entity');
var Moment = require('moment');
var _ = require('underscore');

//mongoose.connect(process.env.GEOFLECT_MONGO_DB);

router.get('/cameras', function(req, res) {
    tdotController.getAllCameras(function(results) {
      res.json(results);
    });
});

router.get('/cameras/:guid', function(req, res) {
    tdotController.getCamera(req.params.guid, function(results) {
      res.json(results);
    });
});

router.get('/locations/chattanooga', function(req, res) {
    
    var geoJson = { type: 'Point', coordinates: [-85.2386909, 35.0982955] };
    var mileRadius = 5;

    tdotController.getGeoEntities(geoJson, mileRadius, req.query, function(results) {
      res.json(results);
    });
});

router.get('/locations/ridgecut', function(req, res) {
    
    var geoJson = { type: 'Point', coordinates: [-85.2680866, 35.0180184] };
    var mileRadius = 0.5;

    tdotController.getGeoEntities(geoJson, mileRadius, req.query, function(results) {
      res.json(results);
    });
});

router.get('/locations/thebend', function(req, res) {
    
    var geoJson = { type: 'Point', coordinates: [-85.3514422, 35.0274214] };
    var mileRadius = 2;

    tdotController.getGeoEntities(geoJson, mileRadius, req.query, function(results) {
      res.json(results);
    });
});

router.get('/locations/thesplit', function(req, res) {
    
    var geoJson = { type: 'Point', coordinates: [-85.3514422, 35.0274214] };
    var mileRadius = 2;

    tdotController.getGeoEntities(geoJson, mileRadius, req.query, function(results) {
      res.json(results);
    });
});

module.exports = router;