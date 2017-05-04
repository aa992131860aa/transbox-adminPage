(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.doctor', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('doctor', {
                url: '/doctor',
                templateUrl: 'app/pages/transbox/database/doctor/doctor.html',
                title: '医师库管理',
                controller: 'DoctorPageCtrl'
            });
    }

})();