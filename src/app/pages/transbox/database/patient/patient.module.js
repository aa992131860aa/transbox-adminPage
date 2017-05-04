(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.database.patient', ['HttpService', 'ConfigFactory'])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('patient', {
                url: '/patient',
                templateUrl: 'app/pages/transbox/database/patient/patient.html',
                title: '术者库管理',
                controller: 'PatientPageCtrl'
            });
    }

})();