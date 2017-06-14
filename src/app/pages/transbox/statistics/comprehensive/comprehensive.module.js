(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.statistics.comprehensive', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('comprehensive', {
                url: '/comprehensive',
                templateUrl: 'app/pages/transbox/statistics/comprehensive/comprehensive.html',
                title: '综合分析',
                controller: 'ComprehensivePageCtrl'
            });
    }

})();