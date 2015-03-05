'use strict';

/**
 * @ngdoc service
 * @name dashboardApp.myService
 * @description
 * # myService
 * Service in the dashboardApp.
 */
angular.module('dashboardApp')
    .service('Chart', function () {
        return {
            getData : function() {
                 var datachart = {
                    "x" : ['TODO', 'IN PROGRESS', 'CODE REVIEW', 'AWAITING QUALITY','DONE'],

                    'UX'   : [ 10, 2, 4, 8, 25],
                    'DEV'  : [30, 10, 5, 1, 4],
                    'LIVE' : [3, 5, 1, 0, 3],
                    'TOOLS': [8, 1, 0, 1, 2]
                };

                return datachart;
            }
        }
    });
