'use strict';

module.exports = function (app, logger) {

    // Get HOME page
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            title: 'Home Page'
        });
    });

    app.use('/users', function(req, res) {
        res.send('respond with a resource');
    });

};
