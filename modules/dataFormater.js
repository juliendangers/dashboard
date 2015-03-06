var _ = require('lodash');

var formatBurndown = function(dataToFormat, oldDataFormated, callback) {
	 	if(!oldDataFormated || oldDataFormated.UX.length == 14) {
 			var formatedData = { 
				"x":[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Monday", "Tuesday", "Wednesday", "Thursday","Friday" ],
                "base": [350, 311, 272, 233, 194, 156, 117, 78, 39, 0],
                "UX": [350, 345, 344, 344, 344],
                "DEV": [350, 340, 306, 306, 306],
                "LIVE": [350, 350, 259, 259, 259],
                "IT": [350, 305, 284, 284, 284]
            };
	 	}

    console.log(JSON.stringify(dataToFormat));

		//get maxTotalOriginalEstimate
   		var maxTotalOriginalEstimate = _.max(_.chain(dataToFormat).groupBy('sprint').map(function(item){
			 	return item.reduce(function(prev, current) {
			 		return prev + _.parseInt(current.originalEstimate);
			 	}, 0);
   		}).value());

   		// calcul de la base
		var diff = Math.round(maxTotalOriginalEstimate/14);
		var base = [];
		base.push(maxTotalOriginalEstimate-diff);

		for (var i = 1; i < 14; ++i) {
			base.push(base[i-1]-diff);
		};

		formatedData.base = base;

		// get maxTotalremainingEstimate
   		_.chain(dataToFormat).groupBy('sprint').map(function(item){
   				var data = { 'sprint': item[0].sprint, 'totalRemainingEstimate': 0};
			 	var totalRemainingEstimate = item.reduce(function(prev, current) {
			 		return prev + _.parseInt(current.remainingEstimate);
			 	}, 0);
			 	formatedData[data.sprint].push(totalRemainingEstimate);
   		}).value();

    callback(formatedData);
};

var formatChart = function(dataToFormat, callback) {
    var chartData = {
        "x" : ['TO DO', 'IN PROGRESS', 'CODE REVIEW', 'AWAITING QUALITY','DONE'],
        'UX'   : [17,4,0,0,0,5],
        'DEV'  : [41,12,4,5,0,5],
        'LIVE' : [1,0,0,0,0,0],
        'IT': [3,1,1,0,1,0]
    };

    _.chain(dataToFormat).groupBy('sprint').map(function(sprintIssues) {
        var issuesByStatus = {
            "TO_DO" : 0,
            "IN_PROGRESS": 0,
            "CODE_REVIEW": 0,
            "AWAITING_QUALITY": 0,
            "DONE": 0
        };

        var temp = _.groupBy(sprintIssues, 'status');

        _.map(temp, function(statusIssues) {
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
