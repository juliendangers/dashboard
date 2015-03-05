var datachart = {
	    	"x" : ['TODO', 'IN PROGRESS', 'CODE REVIEW', 'AWAITING QUALITY','DONE'],

            'UX'   : [ 10, 2, 4, 8, 25],
            'DEV'  : [30, 10, 5, 1, 4],
            'LIVE' : [3, 5, 1, 0, 3],
            'TOOLS': [8, 1, 0, 1, 2],
	    };

var chart = c3.generate({
	bindto: '#chart',
   data: {
		x: 'x',
		json: datachart,
		type: 'bar',
		colors: {
		'UX': '#000',
		'DEV': '#69BE00',
		'LIVE': '#53A9FF',
		'TOOLS': '#931C9A',
		},
	},
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }
    },
    axis: {
		x: {
			type: 'category'
		},
			y: {
			label: {
  				text: 'issues',
  				position: 'outer-middle'
  			}
		}
	},

});