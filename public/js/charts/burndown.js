var dataTest = {
		"x":[
			"-",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday"
		],
		"base":[350,311,272,233,194,156,117,78,39,0],
		"UX":[350,345,344],
		"DEV":[350,340,306],
		"LIVE":[350,350,259],
		"TOOLS":[350,305,284]
	};

var chart = c3.generate({
	bindto: '#burndown',
	size: {
		height: 300
	},
	data: {
		x: 'x',
		json: dataTest,
	},
	color: {
		pattern: ['#CCC', '#000', '#69BE00', '#53A9FF', '#931C9A']
	},
	point: {
		r: 4
	},
	axis: {
		x: {
			type: 'category'
		},
			y: {
			label: {
  				text: 'Points',
  				position: 'outer-middle'
  			}
		}
		},
		legend: {
			hide: ['base']
		},
		tooltip: {
		show: false,
		grouped: false
	}
});
