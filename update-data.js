require('morgan');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var logger = require('winston');
var config = require('./config')(console);
var issuesApi = require('./modules/issuesApi')(config, logger);
var dashboardDb = require('./modules/dashboardDb')(config, logger);

var ioClient = require('socket.io-client')('http://' + config.host + ':' + config.port);

ioClient.on('connect', function () {
    logger.info('Connexion to socket client.');

    // Get bug issues from JIRA, add them into mongo and refresh all dashboards
    dashboardDb.removeAll('bug-count-issues', function() {
        issuesApi.getBugIssues(function(data) {
            dashboardDb.insert('bug-count-issues', data);
            ioClient.emit('broadcast', 'update-bugs', data[0]);
            logger.info('update-bugs:', data);
        });
    });

    // Get weekly bug issues from JIRA, add them into mongo and refresh all dashboards
    dashboardDb.removeAll('bug-count-weekly-issues', function() {
        issuesApi.getBugWeeklyIssues(function(data) {
            dashboardDb.insert('bug-count-weekly-issues', data);
            ioClient.emit('broadcast', 'update-bugs-weekly', data[0]);
            logger.info('update-bugs-weekly:', data);
        });
    });

    // Update issues
    dashboardDb.removeAll('active-sprint-issues', function() {
        issuesApi.getActiveSprintIssues(function(err, issues) {
            assert.equal(null, err);

            dashboardDb.insert('active-sprint-issues', issues, function(issues) {
                // Update burndown and chart data
                async.waterfall([
                    function (callback) {
                        dashboardDb.findAll('burndown', function(burndowns) {
                            callback(null, issues, burndowns);
                        });
                    },
                    function (issues, burndowns, callback) {
                        var previousFormatedData = burndowns.length > 0 ? burndowns[0] : [];

                        dataFormater.formatBurndown(issues, previousFormatedData, function(formatedBurndownData) {
                            callback(null, issues, burndowns, formatedBurndownData);
                        });
                    },
                    function (issues, burndowns, formatedBurndownData, callback) {

                        dashboardDb.removeAll('burndown', function() {
                            callback(null, issues, burndowns, formatedBurndownData);
                        });
                    },
                    function (issues, burndowns, formatedBurndownData, callback) {
                        dashboardDb.insert('burndown', [formatedBurndownData], function() {
                            io.sockets.emit('update-burndown', formatedBurndownData);
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
                            io.sockets.emit('update-chart', formatedChartData);
                            callback(null, formatedBurndownData, formatedChartData);
                        });
                    },
                    function (formatedBurndownData, formatedChartData, callback) {
                        // Emit
                        io.on('connection', function(socket) {
                            socket.emit('update-chart', formatedChartData);
                            socket.emit('update-burndown', formatedBurndownData);
                        });

                        callback();
                    }
                ], function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        });
    });
});
