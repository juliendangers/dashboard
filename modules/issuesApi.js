var moment = require('moment');
var assert = require('assert');
var _ = require('lodash');
var async = require('async');

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

    var getProjects = function (callback) {
        var jira = new JiraApi('https', config.jira.host, config.jira.port, config.jira.user, config.jira.password, 2);
        var query = 'issuetype = Epic AND labels in (onDashboard) AND "Epic Status" != "done" ORDER BY duedate ASC';

        jira.searchJira(query, {maxResults: 500}, function (err, result) {
            assert.equal(err, null);

            var data = _.map(result.issues, function (issue) {
                return {
                    name: issue.fields.customfield_10009,
                    duedate: issue.fields.duedate,
                    achievement: issue.fields.progress.percent ? issue.fields.progress.percent : 0,
                };
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
        var jira = new JiraApi('https', config.jira.host, config.jira.port, config.jira.user, config.jira.password, 2);

        var allIssues = [];
        var options = {
            "maxResults" : 700
        };

        function getSprintName(sprint) {
            var sprintName = 'UNKNOWN';

            if (_.includes(sprint.name, 'DEV')) {
                sprintName = 'DEV';
            } else if (_.includes(sprint.name, 'UX')) {
                sprintName = 'UX';
            } else if (_.includes(sprint.name, 'LIVE')) {
                sprintName = 'LIVE';
            }
            return sprintName;
        }

        function searchSprintIssues(sprint, f) {
            var sprintName = getSprintName(sprint);
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
                f();
            });
        }

        jira.getSprintsForRapidView(4, function (err, sprints) {
            assert.equal(err, null);

            sprints = _.compact(sprints.map(function(sprint) {
                if (sprint.state == 'ACTIVE') {
                    return sprint;
                }
            }));

            async.map(sprints, function(sprint, f) {
                searchSprintIssues(sprint, f);
            }, function(err) {
                jira.getSprintsForRapidView(31, function (err, itSprints) {
                    itSprints.forEach(function (ITsprint) {
                        if (ITsprint.state == 'ACTIVE') {
                            async.map(sprints, function(sprint, f) {
                                searchSprintIssues(sprint, f);
                            }, function(err) {
                                callback(err, allIssues);
                            });
                        }
                    });
                });
            });
        });
    };

    return {
        "getBugIssues": getBugIssues,
        "getBugWeeklyIssues": getBugWeeklyIssues,
        "getProjects": getProjects,
        "getActiveSprintIssues": getActiveSprintIssues
    }
};
