(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.statistics.transfer', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('transfer', {
                url: '/transfer',
                templateUrl: 'app/pages/transbox/statistics/transfer/transfer.html',
                title: '实时统计分析图',
                controller: 'TransferPageCtrl'
            });
    }

})();