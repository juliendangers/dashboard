var express = require('express');
var mongoDashboard = require('../modules/mongoDashboard');

var router = express.Router();

// Get HOME page
router.get('/', function(req, res, next) {
    mongoDashboard.insert
    res.render('index.ejs', {
        title: 'Home Page'
    });
});

module.exports = router;
