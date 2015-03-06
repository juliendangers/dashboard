var _ = require('lodash');

var formatBurndown = function(dataToFormat, oldDataFormated, callback) {
	 	if(!oldDataFormated || oldDataFormated.UX.length == 14) {
 			var formatedData = { 
				"x":[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Monday", "Tuesday", "Wednesday", "Thursday","Friday" ],
				"base":[],
			    "UX":[],
			    "DEV":[],
			    "LIVE":[],
			    "IT":[]
	 		};
	 	}

		// get maxTotalOriginalEstimate
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
   		var totalRemainingEstimate = _.chain(dataToFormat).groupBy('sprint').map(function(item){
   				var data = { 'sprint': item[0].sprint, 'totalRemainingEstimate': 0};	
			 	var totalRemainingEstimate = item.reduce(function(prev, current) {
			 		return prev + _.parseInt(current.remainingEstimate);
			 	}, 0);

			 	formatedData[data.sprint].push(totalRemainingEstimate);
			 	return data;
   		}).value();

    callback(formatedData);
};

var formatChart = function(dataToFormat, callback) {
    var chartData = {
        "x" : ['TO DO', 'IN PROGRESS', 'CODE REVIEW', 'AWAITING QUALITY','DONE'],
        'UX'   : [],
        'DEV'  : [],
        'LIVE' : [],
        'IT': []
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