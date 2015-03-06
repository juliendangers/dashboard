var express = require('express');
var engine = require('ejs-mate');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var env = require('node-env-file');

env(__dirname + '/.env');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var issues = require('./modules/issues');
var dashboardDb = require('./modules/dashboardDb');

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

io.on('connection', function(socket) {
    console.log('A user connected');

    var bugsCount = 0;
    dashboardDb.find('bug-count-issues', {}, function(bugsCount) {
        bugsCount = bugsCount[0];

        dashboardDb.find('burndown', {}, function(burndownData) {
            burndownData = burndownData[0];

            dashboardDb.find('chart', {}, function(chartData) {
                chartData = chartData[0];

                socket.emit('init-all', {
                        "chart": chartData,
                        "burndown": burndownData,
                        "bugs": bugsCount
                    }
                );
            };
        };
    });

    socket.on('disconnect', function () {
        console.log('Client disconnected');
    });
});

var CronJob = require('cron').CronJob;
new CronJob('* * 23 * * 1-5', function() {
    console.log('test');
    issues.getBugIssues(function(data){
        dashboardDb.insert('bug-count-issues', data);
        io.sockets.emit('init-bugs', data);
    });
}, null, true, "Europe/Paris");


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

http.listen(8080, "127.0.0.1", function () {
    console.log('Example app listening on port 8080');
});
