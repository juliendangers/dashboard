module.exports = function(http, dashboardDb, logger) {

    var io = require('socket.io')(http);

    // Init all chart on connection
    io.on('connection', function(socket) {
        logger.info('A user connected');

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
            logger.info('Client disconnected');
        });
    });
};
