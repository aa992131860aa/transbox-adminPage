(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.box', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('comprehensive', {
                url: '/comprehensive',
                templateUrl: 'http://localhost:8080/WebReport/ReportServer?reportlet=organ_type_count.cpt',
                title: '设备管理',
                controller: 'BoxPageCtrl'
            });
    }

})();