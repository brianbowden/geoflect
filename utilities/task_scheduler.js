var tdotController = require('../controllers/tdot_controller');

var startScheduledTasks = function() {
  
  var tenMinutes = 1000 * 60 * 10;
  setInterval(function() {
    tdotController.syncEventData(function(totalEntities) {
      if (totalEntities) {
        // Do nothing
      }
    });
  }, tenMinutes);

  var day = 1000 * 60 * 60 * 24;
  setInterval(function() {
    tdotController.syncFixedPointData(function(totalEntities) {
      if (totalEntities) {
        // Do nothing
      }
    });
  }, day);

}

module.exports = { 'startScheduledTasks': startScheduledTasks };