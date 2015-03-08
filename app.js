var express = require('express');
var engine = require('ejs-mate');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');

var env = require('node-env-file');
env(__dirname + '/.env');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var issues = require('./modules/issues');
var dashboardDb = require('./modules/dashboardDb');
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

var CronJob = require('cron').CronJob;
new CronJob('45 * * * * *', function() {

    var JiraApi = require('./modules/jira').JiraApi;
    var _ = require('lodash');
    var jira = new JiraApi('https', process.env.JIRA_HOST, '443', process.env.JIRA_USER, process.env.JIRA_PASSWORD, 2);
    var assert = require('assert');
    var env = require('node-env-file');

    var options = {
        maxResults: 500
    };
    dashboardDb.removeAll('bug-count-issues', function(result){
        issues.getBugIssues(function(data){
            dashboardDb.insert('bug-count-issues', data);
            io.sockets.emit('init-bugs', data);
        });
    });

    dashboardDb.removeAll('active-sprint-issues', function(result){
        jira.getSprintsForRapidView(4, function(error, sprints) {
            assert.equal(error, null);
            var sprint;
            sprints.forEach(function(sprint){
                if (sprint.state == 'ACTIVE') {
                    var sprintName = 'UNKNOWN';

                    if (_.includes(sprint.name, 'DEV')) {
                        sprintName = 'DEV';
                    } else if (_.includes(sprint.name, 'UX')) {
                        sprintName = 'UX';
                    } else if (_.includes(sprint.name, 'LIVE')) {
                        sprintName = 'LIVE';
                    }
                    assert.equal(error, null);

                    jira.searchJira('Sprint=' + sprint.id, options, function (error, searchResult) {
                        assert.equal(error, null);
                        
                        searchResult.issues.forEach(function (issueDetail) {
                            var formattedIssue = {
                                id: issueDetail.key,
                                type: issueDetail.fields.issuetype.name.toUpperCase(),
                                timeSpent: issueDetail.fields.timespent || 0,
                                project: issueDetail.fields.project.key,
                                status: issueDetail.fields.status.statusCategory.name.replace(' ', '_').toUpperCase(),
                                originalEstimate: issueDetail.fields.aggregatetimeoriginalestimate || 0,
                                remainingEstimate: issueDetail.fields.timeestimate, // Voir progress plutot que timetracking
                                sprint: sprintName
                            };

                            dashboardDb.insert('active-sprint-issues', [formattedIssue]);
                        });
                    });
                }
            });

            jira.getSprintsForRapidView(31, function(error, itSprints) {
                itSprints.forEach(function(ITsprint) {
                    if (ITsprint.state == 'ACTIVE') {
                        jira.searchJira('Sprint=' + ITsprint.id, options, function (error, searchResult) {
                            assert.equal(error, null);

                            searchResult.issues.forEach(function (itIssueDetail) {
                                var itFormattedIssue = {
                                    id: itIssueDetail.key,
                                    type: itIssueDetail.fields.issuetype.name.toUpperCase(),
                                    timeSpent: itIssueDetail.fields.timespent || 0,
                                    project: itIssueDetail.fields.project.key,
                                    status: itIssueDetail.fields.status.statusCategory.name.replace(' ', '_').toUpperCase(),
                                    originalEstimate: itIssueDetail.fields.aggregatetimeoriginalestimate || 0,
                                    remainingEstimate: itIssueDetail.fields.timeestimate, // Voir progress plutot que timetracking
                                    sprint: 'IT'
                                };

                                dashboardDb.insert('active-sprint-issues', [itFormattedIssue]);
                            });
                        });
                    }
                });

                // Update burndown et chart data
                async.waterfall([
                    function (callback) {
                        dashboardDb.findAll('active-sprint-issues', function(issues) {
                            callback(null, issues);
                        });
                    },
                    function (issues, callback) {
                        dashboardDb.findAll('burndown', function(burndowns) {
                            callback(null, issues, burndowns);
                        });
                    },
                    function (issues, burndowns, callback) {
                        var previousFormatedData = burndowns[0];
                        console.log("issues");
                        console.log(issues);
                        console.log("previousFormatedData");
                        console.log(previousFormatedData);
                        dataFormater.formatBurndown(issues, previousFormatedData, function(formatedBurndownData) {
                            callback(null, burndowns, formatedBurndownData);
                        });
                    },
                    function (issues, burndowns, formatedBurndownData, callback) {
                        dashboardDb.removeAll('burndown', function(){
                            callback(null, issues, burndowns, formatedBurndownData);
                        });
                    },
                    function (issues, burndowns, formatedBurndownData, callback) {
                        dashboardDb.insert('burndown', [formatedBurndownData], function() {
                            callback(null, issues, burndowns, formatedBurndownData);
                        });
                    },
                    function (issues, burndowns, formatedBurndownData, callback) {
                        dataFormater.formatChart(issues, function(formatedChartData) {
                            callback(null, formatedBurndownData, formatedChartData);
                        });
                    },
                    function (formatedBurndownData, formatedChartData, callback) {
                        dashboardDb.removeAll('chart', function() {
                            callback(null, formatedBurndownData, formatedChartData);
                        });
                    },
                    function (formatedBurndownData, formatedChartData, callback) {
                        dashboardDb.insert('chart', [formatedChartData], function() {
                            callback(null, formatedBurndownData, formatedChartData);
                        });
                    },
                    function (formatedBurndownData, formatedChartData, callback) {
                        dashboardDb.findAll('bug-count-issues', function(bugs){
                            bugsCount = bugs[0];
                            io.emit('init-all', {
                                "chart": formatedChartData,
                                "burndown": formatedBurndownData,
                                "bugs": bugsCount
                            });
                            callback();
                        });
                    }
                ], function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        });
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
