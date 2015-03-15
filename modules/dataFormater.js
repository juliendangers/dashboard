var _ = require('lodash');

/**
 * Format burndown
 *
 * @param dataToFormat
 * @param oldDataFormated
 * @param callback
 */
var formatBurndown = function (dataToFormat, oldDataFormated, callback) {

    var formatedData;

    if (!oldDataFormated || !oldDataFormated.DEV || oldDataFormated.UX.length == 10) {
        formatedData = {
            "x"   : [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "base": [350, 311, 272, 233, 194, 194, 194, 156, 117, 78, 39, 0, 0, 0],
            "UX"  : [],
            "DEV" : [],
            "LIVE": [],
            "IT"  : []
        };
        // calculate first remaining estimate


    } else {
        formatedData = oldDataFormated;
    }

    // Get maxTotalOriginalEstimate
    _.chain(dataToFormat).groupBy('sprint').map(function (item) {

        var maxTotalOriginalEstimate = item.reduce(function (prev, current) {
            return prev + _.parseInt(current.originalEstimate);
        }, 0);

        var totalRemainingEstimate = item.reduce(function (prev, current) {
            return prev + _.parseInt(current.remainingEstimate);
        }, 0);

        totalRemainingEstimate = Math.round((totalRemainingEstimate * 350) / maxTotalOriginalEstimate);

        debugger;

        formatedData[item[0].sprint].push(totalRemainingEstimate);

    }).value();

    debugger;

    callback(formatedData);
};

var formatChart = function (dataToFormat, callback) {
    var chartData = {
        "x"   : ['TO DO', 'IN PROGRESS', 'CODE REVIEW', 'AWAITING QUALITY', 'DONE'],
        'UX'  : [17, 4, 0, 0, 0, 5],
        'DEV' : [41, 12, 4, 5, 0, 5],
        'LIVE': [1, 0, 0, 0, 0, 0],
        'IT'  : [3, 1, 1, 0, 1, 0]
    };

    _.chain(dataToFormat).groupBy('sprint').map(function (sprintIssues) {
        var issuesByStatus = {
            "TO_DO"           : 0,
            "IN_PROGRESS"     : 0,
            "CODE_REVIEW"     : 0,
            "AWAITING_QUALITY": 0,
            "DONE"            : 0
        };

        var temp = _.groupBy(sprintIssues, 'status');

        _.map(temp, function (statusIssues) {
            var statusName = statusIssues[0].status;

            issuesByStatus[statusName] = statusIssues.length;
        });

        var sprintName = sprintIssues[0].sprint;

        chartData[sprintName] = [
            issuesByStatus['TO_DO'],
            issuesByStatus['IN_PROGRESS'],
            issuesByStatus['CODE_REVIEW'],
            issuesByStatus['AWAITING_QUALITY'],
            issuesByStatus['DONE']
        ];
    }).value();

    if (callback) {
        callback(chartData);
    }
};

module.exports.formatBurndown = formatBurndown;
module.exports.formatChart = formatChart;
