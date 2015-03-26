var express = require('express');
var engine = require('ejs-mate');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var assert = require('assert');
var _ = require('lodash');

var config = require('./config')(console);

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var issuesApi = require('./modules/issuesApi')(config, logger);
var dashboardDb = require('./modules/dashboardDb')(config, logger);
var dataFormater = require('./modules/dataFormater');

// Route setup
var routes = require('./routes/index');
var users = require('./routes/users');

app.engine('ejs', engine);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// Init all chart on connection
io.on('connection', function(socket) {
    console.log('A user connected');

    // Update bug count widget
    dashboardDb.find('bug-count-issues', {}, function(bugsCount) {
        bugsCount = bugsCount ? bugsCount[bugsCount.length - 1] : {number: '/'};
        socket.emit('update-bugs', bugsCount);
    });

    // Update burndown widget
    dashboardDb.find('burndown', {}, function(burndownData) {
        var burndownDefaultData = {
            "x":["Monday","Tuesday","Wednesday","Thursday","Friday","Monday","Tuesday","Wednesday","Thursday","Friday"],
            "base":[],
            "UX":[],
            "DEV":[],
            "LIVE":[],
            "TOOLS":[]
        };

        burndownData = burndownData ? burndownData[0] : burndownDefaultData;
        socket.emit('update-burndown', burndownData);
    });

    // Update chart widget
    dashboardDb.find('chart', {}, function(chartData) {
        burndownDefaultData = {
            "x" : ['TODO', 'IN PROGRESS', 'CODE REVIEW', 'AWAITING QUALITY','DONE'],
            'UX'   : [],
            'DEV'  : [],
            'LIVE' : [],
            'TOOLS': []
        };

        chartData = chartData ? chartData[0] : burndownDefaultData;
        socket.emit('update-chart', chartData);
    });

    socket.on('disconnect', function () {
        console.log('Client disconnected');
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers
// development error handler will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.ejs', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.ejs', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

http.listen(config.port, config.host, function () {
    console.log('Server run in: http://' + config.host + ':' + config.port);
});
