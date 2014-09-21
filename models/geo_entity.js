var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var GeoEntitySchema = new Schema({
  guid: String,
  loc: { "type": {type: String} , "coordinates": Array },
  entityType: String,
  title: String,
  description: String,
  imageUrl: String,
  lastModified: Date
});

GeoEntitySchema.index({ loc: '2dsphere' })

var GeoEntity = mongoose.model('GeoEntity', GeoEntitySchema);

module.exports = GeoEntity;