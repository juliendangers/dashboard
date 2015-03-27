'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webApp
 */
angular.module('dashboardApp')
  .controller('MainCtrl', function ($scope, c3SimpleService, socket) {
        $scope.dataBurndown = {};
        $scope.dataChart = {};
        $scope.bugs = {};
        $scope.bugsWeekly = {};
        $scope.projects = {};

        $scope.transform = function(chartId, serie) {
            c3SimpleService['#' + chartId].transform($scope.chartType[serie], serie);
        };

        var setBurndown = function() {
            return $scope.burndown = {
                bindto: '#burndown',
                data: {
                    x: 'x',
                    json: $scope.dataBurndown,
                    columns: []
                },
                color: {
                    pattern: ['#3C3D42', '#CCC', '#000', '#6BAC1B', '#40BEFA', '#931C9A']
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
        };

        var setChart = function() {
            return $scope.chart = {
                bindto: '#chart',
                data: {
                    x: 'x',
                    json: $scope.dataChart,
                    type: 'bar',
                    colors: {
                        '_id': '#3C3D42',
                        'UX': '#000',
                        'DEV': '#6BAC1B',
                        'LIVE': '#40BEFA',
                        'IT': '#931C9A'
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
        };

        socket.on('init-all', function (data) {
            $scope.dataChart = data.chart;
            $scope.dataBurndown = data.burndown;
            $scope.bugs = data.bugs;
            $scope.bugsWeekly = data.bugsWeekly;
        });

        socket.on('update-bugs', function (data) {
            $scope.bugs = data;
        });

        socket.on('update-bugs-weekly', function (data) {
            $scope.bugsWeekly = data;
        });

        socket.on('update-projects', function (data) {
            $scope.projects = data;
        });

        socket.on('update-burndown', function (data) {
            $scope.dataBurndown = data;
        });

        socket.on('update-chart', function (data) {
            $scope.dataChart = data;
        });

        $scope.$watch('dataChart', function(newSeries, oldSeries) {
            c3SimpleService[$scope.chart.bindto] = c3.generate(setChart());
        });

        $scope.$watch('dataBurndown', function(newSeries, oldSeries) {
            c3SimpleService[$scope.burndown.bindto] = c3.generate(setBurndown());
        });

        setChart();

        setBurndown();

    });

