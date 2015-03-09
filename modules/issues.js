/**
 * Created by Guillaume-Idz on 05/03/15.
 */
var moment = require('moment');
var JiraApi = require('../modules/jira').JiraApi;
var assert = require('assert');

/**
 * List all bug issues
 *
 * @param callback
 */
var getBugIssues = function(callback) {
    var jira = new JiraApi('https', process.env.JIRA_HOST, '443', process.env.JIRA_USER, process.env.JIRA_PASSWORD, 2);

    var fr = moment().locale('fr');
    var now = fr.format('YYYY-MM-DD HH:mm:ss'); // YYYY-MM-DD

    //Compte le nombre de bug dans le backlog pour le jour now()
    var count = 0;
    var data = [];

    jira.searchJira('issuetype=Bug&status!=resolved&status!=closed&labels != poney', {maxResults: 500}, function(error, result) {
        assert.equal(error, null);
        count = result.issues.length;

        data.push({
            number:count,
            date:now
        });

        callback(data);
    });
};

module.exports.getBugIssues = getBugIssues;
