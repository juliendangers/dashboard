/**
 * Created by Guillaume-Idz on 05/03/15.
 */
var moment = require('moment');
var JiraApi = require('../modules/jira').JiraApi;

var getBugIssues = function(f) {
    var jira = new JiraApi('https', 'iadvize.atlassian.net', 443, 'ps', 'psGenius', '2');

    var rapidViewID = 4;
    var filterID = 14;
    var issues;

    var fr = moment().locale('fr');
    var now = fr.format('YYYY-MM-DD'); // YYYY-MM-DD
    //Compte le nombre de bug dans le backlog pour le jour now()
    var count = 0;
    var data = [];

    jira.getBacklogForRapidView(rapidViewID, filterID, function(error, result) {
        if(error==null) {
            issues = result.issues;
        }
        if(issues) {
            issues.forEach(function (entry) {
                if (entry.typeName == 'Bug') {
                    count++;
                }
            });
        }
        data.push({
            number:count,
            date:now
        });

        f(data);
    });
};

module.exports.getBugIssues = getBugIssues;
