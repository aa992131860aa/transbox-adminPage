(function () {
    // 'use strict';

    angular.module('HttpService', [])
        .service("Utils", utils)
        .service("Http", http)
        .service("Common", common);


    // by xiyangyang begin
    function common() {
        return {
            attr: function (id) {
                $('#' + id).attr("readonly", "readonly");
                $('#' + id).attr("disabled", "disabled");
            },
            removeAttr: function (id) {
                $('#' + id).removeAttr("readonly", "readonly");
                $('#' + id).removeAttr("disabled", "disabled");
            },
            Validate_checkphone: function (phone) {
                var reg = /^(1)[\d]{10}$/;
                if (!reg.test(phone)) {
                    return false;
                } else {
                    return true;
                }
            },
            arrMaxNum2: function arrMaxNum2(arr) {
                return Math.max.apply(null, arr);
            },
            arrMinNum2: function arrMinNum2(arr) {
                return Math.min.apply(null, arr);
            },
            arrAverageNum2: function arrAverageNum2(arr) {
                var sum = eval(arr.join("+"));
                // return ~~(sum / arr.length * 100) / 100;
                return (~~(sum / arr.length * 100) / 100).toFixed(2);
            }
        }
    }

    // by xiyangyang end

    function utils($q) {
        return {
            promiseHttpResult: function (httpPromise) {
                var deferred = $q.defer();
                httpPromise.success(function (response) {
                    if (response.status === 'OK') {
                        deferred.resolve(response.data);

                    } else if (response.status === 'failed' && response.error) {
                        var msg = response.error;
                        deferred.reject(msg);

                    } else {
                        var msg = "很抱歉，无法从服务器获取数据。";
                        deferred.reject(msg);
                    }

                }).error(function (err) {
                    var msg = "很抱歉，无法从服务器获取数据。";
                    deferred.reject(msg);
                });

                return deferred.promise;
            }
        };
    }

    function http($http, $rootScope, Utils) {
        //local host
        var host = "http://116.62.28.28:1337/transbox/api";
        //release host
        //var host = "http://www.lifeperfusor.com/transbox/api";

        return {
            host: host,
            get: function (path, params) {
                params = params || {};
                params.timestamp = new Date().getTime();
                return Utils.promiseHttpResult($http({
                    method: 'GET',
                    url: host + path,
                    params: params,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                }));
            },
            post: function (path, params) {
                params = params || {};
                params.timestamp = new Date().getTime();

                return Utils.promiseHttpResult($http({
                    method: 'POST',
                    url: host + path,
                    data: $.param(params),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                }));
            },
            put: function (path, params) {
                params = params || {};
                params.timestamp = new Date().getTime();

                return Utils.promiseHttpResult($http({
                    method: 'PUT',
                    url: host + path,
                    data: $.param(params),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                }));
            },
            getDate: function (times) {
                var date = new Date(parseInt(times));
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                m = m < 10 ? ('0' + m) : m;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                var minute = date.getMinutes();
                minute = minute < 10 ? ('0' + minute) : minute;
                return y + '-' + m + '-' + d;
            }
        };

    }

})();

(function () {
    'use strict';

    angular.module('openWindow', ["HttpService", "ui.bootstrap"])
        .controller('OpenWindowController', OpenWindowController);

    function TeamModalCtrl($scope, Http, params) {

    }

    // modal controller
    function OpenWindowController($scope, Http, $location, $uibModal) {
        $scope.open = function (page, size, ctrl, params, saveCB, cancelCB) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: ctrl,
                bindToController: true,
                resolve: {
                    params: params
                },
                windowTopClass: "transfer-history-modal-top-class"
            }).result.then(function (result) {
                saveCB(result);
            }, function (result) {
                cancelCB(result);
            });
        };
        //增加转运团队人员
        $scope.addTeam = function () {


        }
        //  var Highcharts = require('highcharts');
        // //
        // // // 在 Highcharts 加载之后加载功能模块
        //  require('highcharts/modules/exporting')(Highcharts);
        //  // 创建图表
        var transferId = location.href.split("=")[1];
        console.log("location:"+location.href);
        var baseInfo = [];
        var params2 = {
            transferId: transferId
        }
        var teams = [
            {
                "id": 1,
                "title": "团队组长",
                "name": "王某某",
                "post": "主治医生",
                "phone": "18300000000",
                "address": "浙江大学医学院附属第一医院",
                "leaderNum": 2,
                "attendNum": 4,
                "brief": "coco",
                "isShow": true
            },
            {
                "id": 2,
                "title": "团队组员",
                "name": "王某某",
                "post": "主治医生",
                "phone": "18300000000",
                "address": "浙江大学医学院附属第一医院",
                "leaderNum": 2,
                "attendNum": 4,
                "brief": "coco",
                "isShow": true
            },
            {
                "id": 3,
                "title": "团队组员",
                "name": "王某某",
                "post": "主治医生",
                "phone": "18300000000",
                "address": "浙江大学医学院附属第一医院",
                "leaderNum": 2,
                "attendNum": 4,
                "brief": "coco",
                "isShow": true
            }
        ];
        $scope.item = {
            id: 1,
            title: "",
            name: "",
            post: "",
            phone: "",
            address: "",
            leaderNum: "",
            attendNum: "",
            brief: "",
            isShow: true
        }
        $scope.teams = teams;
        //修改team
        $scope.modifyTeam = function (index) {
            $scope.teams[index].isShow = !$scope.teams[index].isShow;
        }
        //删除team
        $scope.delTeam = function (index) {
            $scope.teams.splice(index, 1);
        }
        //增加team
        $scope.addTeam = function(){
            $scope.item.isShow = !$scope.item.isShow;
        }
        //$timeout(function () {
        Http.get('/infoBase', params2).then(
            function (data) {

                // console.log(data);
                if (data[0]) {

                        baseInfo.bloodSampleCount = data[0].o_bloodSampleCount,
                        baseInfo.bloodType = data[0].o_bloodType,
                        baseInfo.boxPin = data[0].t_boxPin,
                        baseInfo.contactPerson = data[0].op_contactPerson,
                        baseInfo.contactPhone = data[0].op_contactPhone,
                        baseInfo.deviceId = data[0].b_deviceId,
                        baseInfo.fromCity = data[0].t_fromCity,
                        baseInfo.getOrganAt = data[0].t_getOrganAt ,
                        baseInfo.h_name = data[0].t_toHospName,
                        baseInfo.o_name = data[0].op_name,
                        baseInfo.organCount = data[0].t_organCount,
                        baseInfo.organSegNumber = data[0].o_segNumber,
                        baseInfo.organizationSampleCount = data[0].o_organizationSampleCount,
                        baseInfo.phone = data[0].tp_phone,
                        baseInfo.segNumber = data[0].o_segNumber,
                        baseInfo.tp_name = data[0].tp_name,
                        baseInfo.tracfficNumber = data[0].t_tracfficNumber,
                        baseInfo.tracfficType = data[0].t_tracfficType ,
                        baseInfo.transferId = data[0].transferId,
                        baseInfo.transferNumber = data[0].t_transferNumber,
                        baseInfo.type = data[0].o_type
                    $scope.transferInfo = baseInfo;
                    //console.log(baseInfo)
                }


            }, function (msg) {

            });


        var params1 = {
            // organSegNumber:  $scope.transferInfo.segNumber,
            // transferNumber:  $scope.transferInfo.transferNumber,
            transferId: transferId
        }


        // 根据传过来的参数 获取记录
        Http.get('/transferInfo', params1).then(
            function (data) {
                $scope.infoBase = data[0][0];
                $scope.infoRecord = data[1];
                console.log(data[1]);
                console.log("js init2");
                if ($scope.infoBase.avgHumidity) {
                    $scope.infoBase.avgHumidity = $scope.infoBase.avgHumidity.toFixed(1)
                }

                // if ($scope.infoBase) {
                //  console.log("init  data");
                $scope.initData();
                // }
                // $scope.beginTimer(); // start timer
            }, function (msg) {

            });

        //  }, 0);
        //历史的基本信息


        $scope.data = {
            modalPageIndex: 0,
            humidity: {},    // 统计湿度max/min
            temperature: {}, // 统计温度max/min
            openData: [],
            collisionData: [],
            crashData: []   //总的crash 数据
        };
        // morris
        $scope.info = {};
        $scope.lineModerationData = [];
        $scope.lineData = [];
        $scope.colors = ["#379DF2", "#F8B513"];
        $scope.initDate = function (x) {
            var date = new Date(x);
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            var minute = date.getMinutes();
            minute = minute < 10 ? ('0' + minute) : minute;

            return m + '-' + d + ' ' + h + ':' + minute;
        };

        // page data 开箱
        $scope.getCrashInfo = function () {
            var p1 = {
                transferid: transferId,
                type: "open"
            };

            Http.get("/records2", p1).then(function (suc) {
                $scope.data.openData = suc;
                $scope.getCollisionData();
            }, function (fail) {

            });


        };
        //碰撞
        $scope.getCollisionData = function () {
            var p2 = {
                transferid: transferId,
                type: "collision"
            };

            Http.get("/records2", p2).then(function (suc) {
                // init数组
                $scope.data.crashData = [];

                $scope.data.collisionData = suc;
                var oSize = $scope.data.openData.length;
                var cSize = $scope.data.collisionData.length;
                if (oSize > 0 || cSize > 0) {
                    var size = oSize > cSize ? oSize : cSize;
                    for (var i = 0; i < size; i++) {
                        $scope.data.crashData.push({
                            oInfo: $scope.data.openData[i] ? $scope.data.openData[i] : '--',
                            cInfo: $scope.data.collisionData[i] ? $scope.data.collisionData[i] : '--'
                        })
                    }
                } else {
                    $scope.data.crashData.push({
                        oInfo: '--',
                        cInfo: '--'
                    })
                }

            }, function (fail) {

            });
        };
        $scope.initData = function () {
            // $scope.info = Config.baseInfo;

            // if ($scope.info.records.length < 1) {
            //     return;
            // }

            $scope.getCrashInfo();
            console.log("two");
            // 湿度
            var dataX = [];
            var dataY = [];
            var humidity = [];
            var count = $scope.infoBase.count;
            var lineSize = 40;
            var sizeInt = 1;
            if (count <= lineSize) {

            } else {
                sizeInt = parseInt(count / lineSize)
            }

            for (var i = 0; i < $scope.infoRecord.length; i++) {
                if (i % sizeInt == 0) {
                    var temp = $scope.infoRecord[i];
                    if (temp.humidity) {
                        humidity.push(parseInt(temp.humidity));

                        dataX.push(temp.recordAt1);
                        dataY.push(temp.humidity);
                    }
                }
            }
            $scope.dataX = dataX;
            $scope.dataY = dataY;

            // if (humidity.length > 0) {
            //     $scope.data.humidity.max = Common.arrMaxNum2(humidity) + "%";
            //     $scope.data.humidity.min = Common.arrMinNum2(humidity) + "%";
            //     $scope.data.humidity.avg = Common.arrAverageNum2(humidity) + "%";
            // }

            // 温度
            var tDataX = [];
            var tDataY = [];
            var temperature = [];
            var unTemperature = 0;
            var temperatureTotal = 0;
            for (var j = 0; j < $scope.infoRecord.length; j++) {
                var item = $scope.infoRecord[j];
                // if (item.temperature && item.avgTemperature) {
                if (item.temperature < 0 || item.temperature > 6) {
                    temperature.push(parseFloat(item.temperature));
                    tDataX.push(item.recordAt1);
                    tDataY.push(item.temperature);
                    unTemperature++;
                    temperatureTotal++;
                } else if (item.temperature && j % sizeInt == 0) {
                    temperature.push(parseFloat(item.temperature));
                    tDataX.push(item.recordAt1);
                    tDataY.push(item.temperature);
                    temperatureTotal++;
                    //tData.push({y: item.recordAt, x: item.temperature,lineColor: "red", markerType: "circle" })
                }
            }
            console.log("four");
            $scope.tDataX = tDataX;
            $scope.tDataY = tDataY;
            $scope.unTemperature = unTemperature;
            $scope.temperatureTotal = temperatureTotal;
            // if (temperature.length > 0) {
            //     $scope.data.temperature.max = Common.arrMaxNum2(temperature) + "℃";
            //     $scope.data.temperature.min = Common.arrMinNum2(temperature) + "℃";
            // }

            // // 开始时间
            // $scope.info.startAtShow = moment($scope.info.startAt).format('MM-DD HH:mm');
            // // 获取器官时间
            // $scope.info.getOrganAtShow = moment($scope.info.getOrganAt).format('YYYY-MM-DD HH:mm');

        };
        // $scope.initData();


        // fullPage
        $scope.mainOptions = {
            navigation: true,
            navigationPosition: 'right',
            scrollingSpeed: 1000
        };


        $scope.modalCheckBasicInfo = function () {
            if ($scope.data.modalPageIndex != 0) {
                $scope.data.modalPageIndex = 0;
                $('#baseInfo').addClass('btn-blue-solid');

                $('#sensorInfo').removeClass('btn-blue-solid');
                $('#functionInfo').removeClass('btn-blue-solid');
                $('#teamInfo').removeClass('btn-blue-solid');
                $('#patientInfo').removeClass('btn-blue-solid');
            }
        };

        $scope.modalCheckDataInfo = function () {
            if ($scope.data.modalPageIndex != 1) {
                $scope.data.modalPageIndex = 1;
                $('#sensorInfo').addClass('btn-blue-solid');

                $('#baseInfo').removeClass('btn-blue-solid');
                $('#functionInfo').removeClass('btn-blue-solid');
                $('#teamInfo').removeClass('btn-blue-solid');
                $('#patientInfo').removeClass('btn-blue-solid');
            }
        };
        $scope.modalCheckFunctionInfo = function () {
            if ($scope.data.modalPageIndex != 2) {
                $scope.data.modalPageIndex = 2;
                $('#functionInfo').addClass('btn-blue-solid');

                $('#baseInfo').removeClass('btn-blue-solid');
                $('#sensorInfo').removeClass('btn-blue-solid');
                $('#teamInfo').removeClass('btn-blue-solid');
                $('#patientInfo').removeClass('btn-blue-solid');
            }
        };
        $scope.modalCheckTeamInfo = function () {
            if ($scope.data.modalPageIndex != 3) {
                $scope.data.modalPageIndex = 3;
                $('#teamInfo').addClass('btn-blue-solid');

                $('#baseInfo').removeClass('btn-blue-solid');
                $('#sensorInfo').removeClass('btn-blue-solid');
                $('#functionInfo').removeClass('btn-blue-solid');
                $('#patientInfo').removeClass('btn-blue-solid');
            }
        };
        $scope.modalCheckPatientInfo = function () {
            if ($scope.data.modalPageIndex != 4) {
                $scope.data.modalPageIndex = 4;
                $('#patientInfo').addClass('btn-blue-solid');

                $('#baseInfo').removeClass('btn-blue-solid');
                $('#sensorInfo').removeClass('btn-blue-solid');
                $('#functionInfo').removeClass('btn-blue-solid');
                $('#teamInfo').removeClass('btn-blue-solid');

            }
        };


        /**
         * 导出 excel
         */
        $scope.exportExcel = function (tId) {

            var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
            //local
            //var URL = 'http://localhost:1337/transbox/api/export/' + transferid;
            var URL = 'http://127.0.0.1:8080/transbox/download.do?transfer_id=' + transferId;
            //release
            // var URL = 'http://www.lifeperfusor.com/transbox/api/export/' + transferid;
            var win = window.open(URL, "_blank", strWindowFeatures);
        };
    }

})();