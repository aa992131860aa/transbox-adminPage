(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.statistics.comprehensive', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('comprehensive', {
                url: '/comprehensive',
                //templateUrl: 'http://localhost:8080/transbox/trop.jsp',
                templateUrl: 'app/pages/transbox/statistics/comprehensive/comprehensive.html',
                title: '统计汇总',
               controller: 'ComprehensivePageCtrl',
                // headers: {
                //     'Content-Type': 'application/x-www-form-urlencoded'
                // }
            });
    }

})();