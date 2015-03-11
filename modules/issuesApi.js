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

/**
 * Get all issues from all sprint and projects
 *
 * @param callback
 */
var getActiveSprintIssues = function(callback) {
    var allIssues = [];
    var err;
    jira.getSprintsForRapidView(4, function (error, sprints) {
        assert.equal(error, null);

        var sprint;
        sprints.forEach(function (sprint) {
            if (sprint.state == 'ACTIVE') {
                var sprintName = 'UNKNOWN';

                if (_.includes(sprint.name, 'DEV')) {
                    sprintName = 'DEV';
                } else if (_.includes(sprint.name, 'UX')) {
                    sprintName = 'UX';
                } else if (_.includes(sprint.name, 'LIVE')) {
                    sprintName = 'LIVE';
                }
                assert.equal(error, null);

                jira.searchJira('Sprint=' + sprint.id, options, function (error, searchResult) {
                    assert.equal(error, null);

                    searchResult.issues.forEach(function (issueDetail) {
                        var formatedIssue = {
                            id               : issueDetail.key,
                            type             : issueDetail.fields.issuetype.name.toUpperCase(),
                            timeSpent        : issueDetail.fields.timespent || 0,
                            project          : issueDetail.fields.project.key,
                            status           : issueDetail.fields.status.statusCategory.name.replace(' ', '_').toUpperCase(),
                            originalEstimate : issueDetail.fields.aggregatetimeoriginalestimate || 0,
                            remainingEstimate: issueDetail.fields.timeestimate,
                            sprint           : sprintName
                        };
                        allIssues.push(formatedIssue);
                    });
                });
            }
        });

        jira.getSprintsForRapidView(31, function (error, itSprints) {
            itSprints.forEach(function (ITsprint) {
                if (ITsprint.state == 'ACTIVE') {
                    jira.searchJira('Sprint=' + ITsprint.id, options, function (error, searchResult) {
                        assert.equal(error, null);

                        searchResult.issues.forEach(function (itIssueDetail) {
                            var formatedIssue = {
                                id               : itIssueDetail.key,
                                type             : itIssueDetail.fields.issuetype.name.toUpperCase(),
                                timeSpent        : itIssueDetail.fields.timespent || 0,
                                project          : itIssueDetail.fields.project.key,
                                status           : itIssueDetail.fields.status.statusCategory.name.replace(' ', '_').toUpperCase(),
                                originalEstimate : itIssueDetail.fields.aggregatetimeoriginalestimate || 0,
                                remainingEstimate: itIssueDetail.fields.timeestimate,
                                sprint           : 'IT'
                            };
                            allIssues.push(formatedIssue);
                        });

                        callback(err, allIssues);
                    });
                }
            });
        });
    });
};

module.exports.getBugIssues = getBugIssues;
module.exports.getActiveSprintIssues = getActiveSprintIssues;
