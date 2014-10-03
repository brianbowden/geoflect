var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var taskScheduler = require('./utilities/task_scheduler');
var loggly = require('./utilities/logger');
var mongoose = require('mongoose');

var apiRoutes = require('./routes/api');

var app = express();

var mongoOptions = { server: {}, replset: {} };
mongoOptions.server.socketOptions = mongoOptions.replset.socketOptions = { keepAlive: 1 };
mongoose.connect(GEOFLECT_MONGO_DB, mongoOptions);

loggly.log("Starting Geoflect server", "serverstart");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

/// start scheduled tasks
taskScheduler.startScheduledTasks();

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

if (require.main === module) {
    app.set('port', process.env.GEOFLECT_PORT || 3000);

    var server = app.listen(app.get('port'), function() {
      console.log('Express server listening on port ' + server.address().port);
    });
}

module.exports = app;
