var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

router.get('/locations/chattanooga', function(req, res) {
    res.json({status: 'succcessful'});
    res.end();
})

module.exports = router;