var _ = require('lodash');
var moment = require('moment');

/**
 * Format burndown
 *
 * @param dataToFormat
 * @param callback
 */
var formatSingleDayBurndown = function (dataToFormat, callback) {

    var formatedToday = moment().format('YYYY-MM-DD');
    console.log(formatedToday);

    // Get maxTotalOriginalEstimate in all sprint
    var maxTotalOriginalEstimate = _.max(_.chain(dataToFormat).groupBy('sprint').map(function (item) {
        return item.reduce(function (prev, current) {
            return prev + _.parseInt(current.originalEstimate);
        }, 0);
    }).value());

    var formatedData = {
        "MAX_ESTIMATE": maxTotalOriginalEstimate,
        "UX"  : 0,
        "DEV" : 0,
        "LIVE": 0,
        "IT"  : 0,
        "DATE": formatedToday
    };


    // Get maxTotalremainingEstimate for each sprint
    _.chain(dataToFormat).groupBy('sprint').map(function (item) {
        var data = {
            'sprint': item[0].sprint,
            'totalRemainingEstimate': 0
        };
        var totalRemainingEstimate = item.reduce(function (prev, current) {
            return prev + _.parseInt(current.remainingEstimate);
        }, 0);
        formatedData[data.sprint].push(totalRemainingEstimate);
    }).value();

    callback(formatedData);
};

var formatAllDayBurndown = function() {

};

var formatChart = function (dataToFormat, callback) {
    var chartData = {
        "x"   : ['TO DO', 'IN PROGRESS', 'CODE REVIEW', 'AWAITING QUALITY', 'DONE'],
        'UX'  : [0, 0, 0, 0, 0, 0],
        'DEV' : [0, 0, 0, 0, 0, 0],
        'LIVE': [0, 0, 0, 0, 0, 0],
        'IT'  : [0, 0, 0, 0, 0, 0]
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

module.exports.formatBurndown = formatSingleDayBurndown;
module.exports.formatChart = formatChart;
