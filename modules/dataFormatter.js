var _ = require('lodash');

var formatBurndown = function(dataToFormat, oldDataFormated, callback) {
	var formatedData = { 
		"x":[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Monday", "Tuesday", "Wednesday", "Thursday","Friday" ],
		"base":[],
	    "UX":[1, 3],
	    "DEV":[3],
	    "LIVE":[4],
	    "IT":[5]
	 };
	 	if(oldDataFormated.UX.length == 14) {
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
			 		return prev + _.parseInt(current.originalEstimate.replace('m',''));
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
			 		return prev + _.parseInt(current.remainingEstimate.replace('m',''));
			 	}, 0);
			 	console.log(formatedData[data.sprint]);
			 	formatedData[data.sprint].push(totalRemainingEstimate);
			 	return data;
   		}).value();

    return formatedData;
};

module.exports.burndownFormatter = burndownFormatter;