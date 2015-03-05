'use strict';

/**
 * @ngdoc service
 * @name dashboardApp.myService
 * @description
 * # myService
 * Service in the dashboardApp.
 */
angular.module('dashboardApp')
    .service('Burndown', function () {
        return {
            getData : function() {
                var datatest = {
                    "x":[
                        "-",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday"
                    ],
                    "base":[350,311,272,233,194,156,117,78,39,0],
                    "UX":[350,345,344],
                    "DEV":[350,340,306],
                    "LIVE":[350,350,259],
                    "TOOLS":[350,305,284]
                };

                return datatest;
            }
        }
    });
