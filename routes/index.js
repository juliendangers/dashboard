var express = require('express');
var router = express.Router();

// Get HOME page
router.get('/', function(req, res, next) {
    res.render('index.ejs', {
        title: 'Home Page'
    });
});

module.exports = router;
