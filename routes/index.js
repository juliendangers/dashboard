var express        = require('express');
var dashboardDb = require('../modules/dashboardDb');
var dataFormatter  = require('../modules/dataFormater');
var router         = express.Router();
//var issues = require('../modules/issues');

// Get HOME page
router.get('/', function(req, res, next) {




    res.render('index.ejs', {
        title: 'Home Page'
    });
});

module.exports = router;
