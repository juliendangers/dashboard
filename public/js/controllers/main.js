'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webApp
 */
angular.module('dashboardApp')
  .controller('MainCtrl', function ($scope, c3SimpleService, Chart, Burndown, socket) {
        $scope.datachart = Chart.getData();
        $scope.dataTest = Burndown.getData();

        $scope.transform = function(chartId, serie) {
            c3SimpleService['#' + chartId].transform($scope.chartType[serie], serie);
        };

        $scope.chart = {
            data: {
                x: 'x',
                json: $scope.datachart,
                type: 'bar',
                colors: {
                    'UX': '#000',
                    'DEV': '#69BE00',
                    'LIVE': '#53A9FF',
                    'TOOLS': '#931C9A'
                },
                columns: []
            },
            bar: {
                width: {
                    ratio: 0.5
                }
            },
            axis: {
                x: {
                    type: 'category'
                },
                y: {
                    label: {
                        text: 'issues',
                        position: 'outer-middle'
                    }
                }
            }
        };

        $scope.burndown = {
            data: {
                x: 'x',
                json: $scope.dataTest,
                columns: []
            },
            color: {
                pattern: ['#CCC', '#000', '#69BE00', '#53A9FF', '#931C9A']
            },
            point: {
                r: 4
            },
            axis: {
                x: {
                    type: 'category'
                },
                y: {
                    label: {
                        text: 'Points',
                        position: 'outer-middle'
                    }
                }
            },
            legend: {
                hide: ['base']
            },
            tooltip: {
                show: false,
                grouped: false
            }
        }
    });
