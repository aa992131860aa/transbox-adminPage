(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.statistics.transfer', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('transfer', {
                url: '/transfer',
                templateUrl: 'app/pages/transbox/statistics/transfer/transfer.html',
                title: '转运分析',
                controller: 'TransferPageCtrl'
            });
    }

})();