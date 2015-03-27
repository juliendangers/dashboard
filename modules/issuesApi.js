var moment = require('moment');
var assert = require('assert');
var _ = require('lodash');

module.exports = function (config, logger) {
    var JiraApi = require('../modules/jira').JiraApi;

    /**
     * List all bug issues
     *
     * @param callback
     */
    var getBugIssues = function(callback) {
        var jira = new JiraApi('https', config.jira.host, config.jira.port, config.jira.user, config.jira.password, 2);

        var fr = moment().locale('fr');
        var now = fr.format('YYYY-MM-DD HH:mm:ss'); // YYYY-MM-DD

        // Compte le nombre de bug dans le backlog pour le jour now()
        var count = 0;
        var data = [];

        jira.searchJira('issuetype=Bug&status!=resolved&status!=closed&labels != poney', {maxResults: 500}, function(err, result) {
            assert.equal(err, null);
            count = result.issues.length;

            data.push({
                number:count,
                date:now
            });

            callback(data);
        });
    };

    /**
     * List all bug weekly issues
     *
     * @param callback
     */
    var getBugWeeklyIssues = function(callback) {
        var jira = new JiraApi('https', config.jira.host, config.jira.port, config.jira.user, config.jira.password, 2);

        var fr = moment().locale('fr');
        var now = fr.format('YYYY-MM-DD HH:mm:ss'); // YYYY-MM-DD
        var week = fr.week();
        var data = [];

        jira.searchJira('issuetype = Bug AND resolutiondate >= startOfWeek() AND resolutiondate < endOfWeek() AND status = Resolved', {maxResults: 500}, function(err, result) {
            assert.equal(err, null);
            countDone = result.issues.length;

            jira.searchJira('project = IDZ AND issuetype = Bug AND createdDate >= startOfWeek() AND createdDate < endOfWeek()', {maxResults: 500}, function(err, result) {
                assert.equal(err, null);
                countNotDone = result.issues.length;

                data.push({
                    done: countDone,
                    notDone: countNotDone,
                    date: now,
                    week: week
                });

                callback(data);
            });
        });
    };

    /**
     * Get all issues from all sprint and projects
     *
     * @param callback
     */
    var getActiveSprintIssues = function(callback) {
        return; // @todo Temporary shutdown bad function

        var jira = new JiraApi('https', config.jira.host, config.jira.port, config.jira.user, config.jira.password, 2);

        var allIssues = [];
        var options = {
            "maxResults" : 500
        };

        jira.getSprintsForRapidView(4, function (err, sprints) {
            assert.equal(err, null);

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
                    assert.equal(err, null);

                    jira.searchJira('Sprint=' + sprint.id, options, function (err, searchResult) {
                        assert.equal(err, null);

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

            jira.getSprintsForRapidView(31, function (err, itSprints) {
                itSprints.forEach(function (ITsprint) {
                    if (ITsprint.state == 'ACTIVE') {
                        jira.searchJira('Sprint=' + ITsprint.id, options, function (err, searchResult) {
                            assert.equal(err, null);

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

    return {
        "getBugIssues": getBugIssues,
        "getBugWeeklyIssues": getBugWeeklyIssues,
        "getActiveSprintIssues": getActiveSprintIssues
    }
};
