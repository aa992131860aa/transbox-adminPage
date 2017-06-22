(function () {
    'use strict';

    angular.module('ConfigFactory', [])
        .factory('Config', config)
        .directive('eChart', function($http, $window) {
        function link($scope, element, attrs) {
            var myChart = echarts.init(element[0]);
            attrs.$observe('eData', function() {//通过$observe监听attrs中绑定的option属性，可以通过ajax请求数据，动态更新图表。
                var option = $scope.$eval(attrs.eData);
                if (angular.isObject(option)) {
                    myChart.setOption(option);
                }
            }, true);
            $scope.getDom = function() {
                return {
                    'height': element[0].offsetHeight,
                    'width': element[0].offsetWidth
                };
            };
            $scope.$watch($scope.getDom(), function() {
                // resize echarts图表
                myChart.resize();
            }, true);
        }
        return {
            restrict: 'A',
            link: link
        };
    });
    //     .factory('$echartsConfig', function () {
    //     return {
    //
    //         tooltip : {
    //             trigger: 'axis'
    //         },
    //         legend: {
    //             data:[]
    //         },
    //         xAxis : [
    //             {
    //                 type : 'category',
    //                 boundaryGap : false,
    //                 data : [1,2,3,4,5,6]
    //             }
    //         ],
    //         yAxis : [
    //             {
    //                 type : 'value'
    //
    //             }
    //         ],
    //         series : [
    //             {
    //                 name:'',
    //                 type:'line',
    //                 data:[0,0,0,0,0,0],
    //             }
    //         ]
    //     };
    // })
    // //echarts directive
    //     .directive('echarts', ['$echartsConfig','$window', function ($echartsConfig,$window) {
    //         return {
    //             restrict: 'A',
    //             link: function (scope, element, attrs) {
    //                 if (!scope.$echartsInstance)
    //                     scope.$echartsInstance = {};
    //                 scope.$watch(attrs.echarts, function () {
    //                     var option=angular.extend({},$echartsConfig,scope.$eval(attrs.echarts));
    //                     if (option.id) {
    //                         scope.$echartsInstance[option.id] = echarts.init(element[0]);
    //                         scope.$echartsInstance[option.id].setOption(option);
    //                     } else {
    //                         scope.$echartsInstance = echarts.init(element[0]);
    //                         scope.$echartsInstance.setOption(option);
    //                     }
    //                 });
    //                 $window.onresize = function() {
    //                     if(scope.$echartsInstance.searchTimeOption)
    //                         scope.$echartsInstance.searchTimeOption.resize();
    //                     if(scope.$echartsInstance.searchCostOption)
    //                         scope.$echartsInstance.searchCostOption.resize();
    //                     if(scope.$echartsInstance.searchNumOption)
    //                         scope.$echartsInstance.searchNumOption.resize();
    //
    //                 };
    //             }
    //         };
    //     }])

    function config($rootScope) {
        return {
            apiPath: {
                transfers: '/transfers',
                transfersOrganType: '/transfersOrganType',
                login: '/account/login',
                transfersSql: '/transfersSql',
                hospitalName: '/hospitalName',
                hospitals: '/hospitals',
                hospital: '/hospital',
                opos: '/opos',
                opo: '/opo',
                boxes: '/boxes',
                box: '/box',
                fittings: '/fittings',
                fitting: '/fitting',
                keywords: '/keywords',
                keyword: '/keyword',
                account: '/account'
            },
            getCookie: function (c_name) {
                if (document.cookie.length > 0) {
                    var c_start = document.cookie.indexOf(c_name + "=");
                    if (c_start != -1) {
                        c_start = c_start + c_name.length + 1;
                        var c_end = document.cookie.indexOf(";", c_start);
                        if (c_end == -1) c_end = document.cookie.length;
                        return unescape(document.cookie.substring(c_start, c_end));
                    }
                }
                return "";
            },
            setCookie: function (c_name, value, expiredays) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + expiredays);
                document.cookie = c_name + "=" + escape(value) +
                    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
            },
            removeCookie: function (name) {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            },
            getFormatStringFromDate: function (date) {
                if (!date || !date.getMonth()) {
                    return null;
                }

                var year = date.getFullYear();
                var month = (date.getMonth() + 1) >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
                var day = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();

                return year + '-' + month + '-' + day;
            },
            getDateStringFromObject: function (obj) {
                if (!obj) {
                    return null;
                }

                if (typeof(obj) === 'string') {
                    var arr = obj.split(' ');
                    if (arr && arr.length > 0) {
                        return arr[0];
                    }

                    return null;

                } else if (obj.getDate()) {
                    var year = obj.getFullYear();
                    var month = (obj.getMonth() + 1) >= 10 ? obj.getMonth() + 1 : '0' + (obj.getMonth() + 1);
                    var day = obj.getDate() >= 10 ? obj.getDate() : '0' + obj.getDate();

                    return year + '-' + month + '-' + day;

                } else {
                    return null;
                }
            },
            userInfo: {},
            getDateObjFromString: function (str) {
                if (!str || str.length < 1) {
                    return str;
                }

                str = str.replace(' ', 'T');
                str = str.concat('Z');
                return (new Date(str));
            },
        }
    }

})();