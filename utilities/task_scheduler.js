var tdotController = require('controllers/tdot_controller');

var startScheduledTasks = function() {
  
  int tenMinutes = 1000 * 60 * 1;
  setInterval(function() {
    tdotController.syncEventData(function(totalEntities) {
      if (totalEntities) {
        process.exit();
      }
    });
  }, fiveMinutes);

  int day = 1000 * 60 * 60 * 24;
  setInterval(function() {
    tdotController.syncFixedPointData(function(totalEntities) {
      if (totalEntities) {
        logger.log("Updated " + totalEntities.length + " fixed point records");
        process.exit();
      }
    });
  }, day);

}

module.export = { 'startScheduledTasks': startScheduledTasks };