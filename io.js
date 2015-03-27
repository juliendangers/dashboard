module.exports = function(http, dashboardDb, logger) {

    var io = require('socket.io')(http);

    // Update bug count widget
    var updateBugCountWidget = function (socket) {
        dashboardDb.find('bug-count-issues', {}, function (bugsCount) {
            bugsCount = bugsCount ? bugsCount[bugsCount.length - 1] : {number: '/'};
            socket.emit('update-bugs', bugsCount);
        });
    };

    // Update bug weekly count widget
    var updateBugWeeklyCountWidget = function (socket) {
        dashboardDb.find('bug-count-weekly-issues', {}, function (bugsWeekly) {
            bugsWeekly = bugsWeekly ? bugsWeekly[bugsWeekly.length - 1] : {done: '–', notDone: '–'};
            socket.emit('update-bugs-weekly', bugsWeekly);
        });
    };

    // Update projects widget
    var updateProjects = function (socket) {
        dashboardDb.find('projects', {}, function (projects) {
            socket.emit('update-projects', projects ? projects : {});
        });
    };

    // Update burndown chart widget
    var updateBurndownChartWidget = function (socket) {
        dashboardDb.find('burndown', {}, function (burndownData) {
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
    };

    // Update chart widget
    var updateIssuesChartWidget = function (socket) {
        dashboardDb.find('chart', {}, function (chartData) {
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
    };

    // Init all chart on connection
    io.on('connection', function(socket) {
        logger.info('A user connected');

        // Disconnect
        socket.on('disconnect', function () {
            logger.info('Client disconnected');
        });

        // Broadcast events from clients
        socket.on('broadcast', function () {
            socket.broadcast.emit.apply(socket.broadcast, arguments);
        });

        // Init
        updateBugCountWidget(socket);
        updateBugWeeklyCountWidget(socket);
        updateProjects(socket);
        updateBurndownChartWidget(socket);
        updateIssuesChartWidget(socket);
    });
};
