var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var GeoEntitySchema = new Schema({
  guid: String,
  loc: { "type": { type: String } , "coordinates": Array },
  entityType: String,
  entityTypeId: Number,
  label: String,
  data: String,
  history: [ { timestamp: Date, snapshot: String } ],
  url: String,
  lastModified: Date
});

GeoEntitySchema.index({ loc: '2dsphere' })

var GeoEntity = mongoose.model('GeoEntity', GeoEntitySchema);

module.exports = GeoEntity;