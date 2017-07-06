(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.statistics.organ', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('organ', {
                url: '/organ',
                templateUrl: 'app/pages/transbox/statistics/organ/organ.html',
                title: '2017年转运报告',
                controller: 'OrganPageCtrl'
            });
    }

})();