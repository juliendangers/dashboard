var express        = require('express');
var dashboardDb = require('../modules/dashboardDb');
var dataFormatter  = require('../modules/dataFormatter');
var router         = express.Router();
//var issues = require('../modules/issues');

// Get HOME page
router.get('/', function(req, res, next) {
    var dataToFormat = [
	    {
	        id: "20708",
	        type: "BUG",
	        timeSpent: 2400,
	        project: "IDZ",
	        status: "TODO|INPROGRESS|CODEREVIEW|QUALITY|DONE",
	        originalEstimate: "3h",
	        remainingEstimate: "2h", // Voir progress plutot que timetracking
	        sprint: "DEV",
         	points: 4
	    },
	        {
	        id: "20708",
	        type: "STORY",
	        timeSpent: 2400,
	        project: "IDZ",
	        status: "TODO|INPROGRESS|CODEREVIEW|QUALITY|DONE",
	        originalEstimate: "90m",
	        remainingEstimate: "2m", // Voir progress plutot que timetracking
	        sprint: "UX",
	        points: 4
	    },
	        {
	        id: "20708",
	        type: "BUG",
	        timeSpent: 2400,
	        project: "IDZ",
	        status: "TODO|INPROGRESS|CODEREVIEW|QUALITY|DONE",
	        originalEstimate: "150m",
	        remainingEstimate: "2m", // Voir progress plutot que timetracking
	        sprint: "PRODUCT"
	    },
	    {
	        id: "20708",
	        type: "BUG",
	        timeSpent: 2400,
	        project: "IDZ",
	        status: "TODO|INPROGRESS|CODEREVIEW|QUALITY|DONE",
	        originalEstimate: "30m",
	        remainingEstimate: "2m", // Voir progress plutot que timetracking
	        sprint: "LIVE",
	        points: 4
	    },
	    {
	        id: "20708",
	        type: "BUG",
	        timeSpent: 2400,
	        project: "IDZ",
	        status: "TODO|INPROGRESS|CODEREVIEW|QUALITY|DONE",
	        originalEstimate: "34m",
	        remainingEstimate: "2m", // Voir progress plutot que timetracking
	        sprint: "DEV",
	        points: 4
	    },
	    {
	        id: "20708",
	        type: "BUG",
	        timeSpent: 2400,
	        project: "IDZ",
	        status: "TODO|INPROGRESS|CODEREVIEW|QUALITY|DONE",
	        originalEstimate: "24m",
	        remainingEstimate: "2m", // Voir progress plutot que timetracking
	        sprint: "IT",
	        points: 4
	    }
	];

   // var dataformatted = dataFormatter.burndownFormatter(dataToFormat);

    res.render('index.ejs', {
        title: 'Home Page'
       // dataformatted :dataformatted
    });
});

module.exports = router;
