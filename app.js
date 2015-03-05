var express = require('express');
var engine = require('ejs-mate');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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


io.on('connection', function(socket){
    console.log('Client connected');

    socket.on('disconnect', function(){
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

var cronJob = require('cron').CronJob;
new cronJob('* * * * * *', function() {
    //var JiraApi = require('./modules/jira').JiraApi;
    //var async   = require('async');
    //var mongoDashboard = require('./modules/mongoDashboard');
    //_ = require('lodash');
    //var jira = new JiraApi('https', 'iadvize.atlassian.net', '443', 'marc.fricou', 'D4shB0rd', '2');
    //var assert = require('assert');
    //
    //mongoDashboard.removeAll('active-sprint-issues', function(result){
    //    jira.getSprintsForRapidView(4, function(error, sprints) {
    //        async.map(
    //            sprints,
    //            function(sprint, f) {
    //                if (sprint.state == 'ACTIVE') {
    //                    jira.getSprintIssues(4, sprint.id, function(error, issues) {
    //                        assert.equals(error, null);
    //
    //                        f(null, issues.contents.incompletedIssues);
    //                    });
    //                } else {
    //                    f();
    //                }
    //            },
    //            function(err, returnIssues) {
    //                console.log(err);
    //                returnIssues = _.compact(returnIssues);
    //                console.log(returnIssues);
    //                res.render('index.ejs', {
    //                        title: 'Home Page',
    //                        toto: 'toto',
    //                        issues: returnIssues
    //                    }
    //                );
    //            }
    //        );
    //    });
    //});

}, null, true, "America/Los_Angeles");

module.exports = app;

http.listen(8080, "127.0.0.1", function () {
    console.log('Listening on port 8080');
});
