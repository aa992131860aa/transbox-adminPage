(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.history')
        .controller('HistoryPageCtrl', HistoryPageCtrl)
        .controller('HistoryModalCtrl', HistoryModalCtrl)

    ;

    function HistoryPageCtrl($scope, $filter, editableOptions, editableThemes, Http, Config, $uibModal, $window,
                             Common, toastr, toastrConfig) {
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
                windowTopClass : "transfer-history-modal-top-class"
            }).result.then(function (result) {
                saveCB(result);
            }, function (result) {
                cancelCB(result);
            });
        };
        //器官种类
        //$scope.organTypes = ["心","肝","费"];
        // $scope.getOrganTypes = function () {
        Http.get(Config.apiPath.transfersOrganType, "").then(function (data) {

            //$scope.openToast('warning', '温馨提示', 'data:'+data);
            $scope.organTypes = data;
        }, function (msg) {
            $scope.organTypes = ['肝', '心', '肺'];
        });
        //}
        //转运目的地
        Http.get(Config.apiPath.hospitalName, "").then(function (data) {

            //$scope.openToast('warning', '温馨提示', 'data:'+data);
            $scope.hospitalNames = data;
        }, function (msg) {
            $scope.openToast('warning', '温馨提示', '查询医院名称错误');
        });



        var defaultConfig = angular.copy(toastrConfig);
        $scope.types = ['success', 'error', 'info', 'warning'];
        var openedToasts = [];
        $scope.options = {
            autoDismiss: false,
            positionClass: 'toast-top-right',
            type: 'error',
            timeOut: '5000',
            extendedTimeOut: '2000',
            allowHtml: false,
            closeButton: false,
            tapToDismiss: true,
            progressBar: false,
            newestOnTop: true,
            maxOpened: 0,
            preventDuplicates: false,
            preventOpenDuplicates: false,
            title: "保存失败",
            msg: "请正确填写所有医院信息"
        };

        $scope.openToast = function (type, title, msg, duration) {
            if (!type || !title || !msg) {
                return;
            }

            $scope.options.type = type;
            $scope.options.title = title;
            $scope.options.msg = msg;
            $scope.options.timeOut = duration ? duration : '3000';

            angular.extend(toastrConfig, $scope.options);
            openedToasts.push(toastr[$scope.options.type]($scope.options.msg, $scope.options.title));
            var strOptions = {};
            for (var o in $scope.options)
                if (o != 'msg' && o != 'title') strOptions[o] = $scope.options[o];
            $scope.optionsStr = "toastr." + $scope.options.type + "(\'" + $scope.options.msg + "\', \'" + $scope.options.title + "\', " + JSON.stringify(strOptions, null, 2) + ")";
        };

        $scope.$on('$destroy', function iVeBeenDismissed() {
            angular.extend(toastrConfig, defaultConfig);
        });

        $scope.data = {
            pageData: {
                totalItems: 0,
                transfers: [],
                displayedPages: 0
            },
            pagination: {
                currentPage: 1,
                maxSize: 20,
                previousText: '上一页',
                nextText: '下一页',
                isLoading: true
            },
            selectAll: false,
            detailModal: {},
            selectedTransfer: {},
            searchOptions: {
                transferNumber: '',
                organSegNumber: '',
                organType: '',
                transferPersonName: '',
                fromCity: '',
                toHospitalName: '',
                beginDate: '',
                endDate: ''
            },
            beginDate: {
                options: {
                    formatYear: 'yyyy',
                    startingDay: 1,
                    showWeeks: false,
                    language: 'zh-CN',
                },
                isOpen: false,
                altInputFormats: ['yyyy-MM-dd'],
                format: 'yyyy-MM-dd',
                modelOptions: {
                    timezone: 'Asia/beijing'
                }
            },
            endDate: {
                options: {
                    formatYear: 'yyyy',
                    startingDay: 1,
                    showWeeks: false,
                    language: 'zh-CN',
                },
                isOpen: false,
                altInputFormats: ['yyyy-MM-dd'],
                format: 'yyyy-MM-dd',
                modelOptions: {
                    timezone: 'Asia/beijing'
                }
            },
            newTransfer: {
                model: '',
                boxNumber: '',
                status: '',
                buyFrom: '',
                buyAt: '',
                remark: ''
            },
            modalPageIndex: 0, //0 for basic info, 1 for realtime info
            //below is for xiyangyang data show
            pageState: 2,
            humidity: {}, // 统计湿度max/min
            temperature: {}, // 统计温度max/min
            openData: [],
            collisionData: [],
            crashData: [] //总的crash 数据
        }

        $scope.toggleBeginDatepicker = function () {
            $scope.data.beginDate.isOpen = !$scope.data.beginDate.isOpen;
        }

        $scope.toggleEndDatepicker = function () {
            $scope.data.endDate.isOpen = !$scope.data.endDate.isOpen;
        }

        $scope.getDateString = function (obj) {
            return Config.getDateStringFromObject(obj);
        }

        $scope.data.searchOptions.organType = '0';
        $scope.data.searchOptions.toHospitalName = '0';

        //get all transfers that status is not 'done'
        $scope.getTransfersSql = function (tableState) {
            $scope.tableStateParam = tableState;
            if (!tableState) {
                return;
            }

            $scope.data.selectAll = false;
            $scope.data.pagination.isLoading = true;
            var pagination = tableState.pagination;
            var start = pagination.start || 0;
            // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var number = pagination.number || $scope.data.pagination.maxSize;
            // Number of entries showed per page.

            var params = {
                start: start,
                number: number
            }

            params.reverse = $scope.reverse;
            params.type = $scope.dataType;
            if (Config.userInfo.type === 'hospital' && Config.userInfo.hospitalInfo) {
                params.hospitalid = Config.userInfo.hospitalInfo.hospitalid;
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferNumber)) {
                params.transferNumber = $scope.data.searchOptions.transferNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organSegNumber)) {
                params.organSegNumber = $scope.data.searchOptions.organSegNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organType)) {
                params.organType = $scope.data.searchOptions.organType
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferPersonName)) {
                params.transferPersonName = $scope.data.searchOptions.transferPersonName
            }

            if (!$.isEmptyObject($scope.data.searchOptions.fromCity)) {
                params.fromCity = $scope.data.searchOptions.fromCity
            }

            if (!$.isEmptyObject($scope.data.searchOptions.toHospitalName)) {
                params.toHospitalName = $scope.data.searchOptions.toHospitalName
            }


            if ($scope.data.searchOptions.beginDate) {
                params.beginDate = moment($scope.data.searchOptions.beginDate).format('YYYY-MM-DD');
            }

            if ($scope.data.searchOptions.endDate) {
                params.endDate = moment($scope.data.searchOptions.endDate).format('YYYY-MM-DD');
            }

            Http.get(Config.apiPath.transfersSql, params).then(function (data) {
                $scope.data.pageData = data;
                tableState.pagination.numberOfPages = data.numberOfPages;
                $scope.data.pageData.displayedPages = Math.ceil(parseFloat(data.totalItems) / parseInt(data.numberOfPages));
                $scope.data.pageData.tableState = tableState;
                $scope.data.pagination.isLoading = false;

            }, function (msg) {
                console.log(msg);
                $scope.data.pagination.isLoading = false;
            });
        }
        $scope.sortBySql = function (propertyName) {
            //排序的符号
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;

            var tableStateParam = $scope.tableStateParam;
            $scope.data.selectAll = false;
            $scope.data.pagination.isLoading = true;
            //排序的类型
            $scope.dataType = propertyName;
            var pagination = tableStateParam.pagination;
            $scope.tableStateParam.pagination.start = 0;
            var start = pagination.start || 0;
            start = 0;

            // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var number = pagination.number || $scope.data.pagination.maxSize;
            // Number of entries showed per page.

            var params = {
                start: start,
                number: number,
                type: propertyName
            }
            params.reverse = $scope.reverse;
            if (Config.userInfo.type === 'hospital' && Config.userInfo.hospitalInfo) {
                params.hospitalid = Config.userInfo.hospitalInfo.hospitalid;
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferNumber)) {
                params.transferNumber = $scope.data.searchOptions.transferNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organSegNumber)) {
                params.organSegNumber = $scope.data.searchOptions.organSegNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organType)) {
                params.organType = $scope.data.searchOptions.organType
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferPersonName)) {
                params.transferPersonName = $scope.data.searchOptions.transferPersonName
            }

            if (!$.isEmptyObject($scope.data.searchOptions.fromCity)) {
                params.fromCity = $scope.data.searchOptions.fromCity
            }

            if (!$.isEmptyObject($scope.data.searchOptions.toHospitalName)) {
                params.toHospitalName = $scope.data.searchOptions.toHospitalName
            }


            if ($scope.data.searchOptions.beginDate) {
                params.beginDate = moment($scope.data.searchOptions.beginDate).format('YYYY-MM-DD');
            }

            if ($scope.data.searchOptions.endDate) {
                params.endDate = moment($scope.data.searchOptions.endDate).format('YYYY-MM-DD');
            }


            Http.get(Config.apiPath.transfersSql, params).then(function (data) {
                $scope.data.pageData = data;
                tableStateParam.pagination.numberOfPages = data.numberOfPages;
                $scope.data.pageData.displayedPages = Math.ceil(parseFloat(data.totalItems) / parseInt(data.numberOfPages));
                $scope.data.pageData.tableState = tableStateParam;
                $scope.data.pagination.isLoading = false;
                //$scope.openToast('warning', '温馨提示', 's:'+data.numberOfPages+","+$scope.data.pageData.displayedPages);
            }, function (msg) {
                console.log(msg);
                $scope.data.pagination.isLoading = false;
                //$scope.openToast('warning', '温馨提示', msg);
            });

        }
        //get all transfers that status is not 'done'
        $scope.getTransfers = function (tableState) {
            if (!tableState) {
                return;
            }

            $scope.data.selectAll = false;
            $scope.data.pagination.isLoading = true;
            var pagination = tableState.pagination;
            var start = pagination.start || 0;
            // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var number = pagination.number || $scope.data.pagination.maxSize;
            // Number of entries showed per page.

            var params = {
                start: start,
                number: number,
                type: 'done'
            }

            if (Config.userInfo.type === 'hospital' && Config.userInfo.hospitalInfo) {
                params.hospitalid = Config.userInfo.hospitalInfo.hospitalid;
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferNumber)) {
                params.transferNumber = $scope.data.searchOptions.transferNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organSegNumber)) {
                params.organSegNumber = $scope.data.searchOptions.organSegNumber
            }

            if (!$.isEmptyObject($scope.data.searchOptions.organType)) {
                params.organType = $scope.data.searchOptions.organType
            }

            if (!$.isEmptyObject($scope.data.searchOptions.transferPersonName)) {
                params.transferPersonName = $scope.data.searchOptions.transferPersonName
            }

            if (!$.isEmptyObject($scope.data.searchOptions.fromCity)) {
                params.fromCity = $scope.data.searchOptions.fromCity
            }

            if (!$.isEmptyObject($scope.data.searchOptions.toHospitalName)) {
                params.toHospitalName = $scope.data.searchOptions.toHospitalName
            }


            if ($scope.data.searchOptions.beginDate) {
                params.beginDate = moment($scope.data.searchOptions.beginDate).format('YYYY-MM-DD');
            }

            if ($scope.data.searchOptions.endDate) {
                params.endDate = moment($scope.data.searchOptions.endDate).format('YYYY-MM-DD');
            }


            Http.get(Config.apiPath.transfers, params).then(function (data) {
                $scope.data.pageData = data;
                tableState.pagination.numberOfPages = data.numberOfPages;
                $scope.data.pageData.displayedPages = Math.ceil(parseFloat(data.totalItems) / parseInt(data.numberOfPages));
                $scope.data.pageData.tableState = tableState;
                $scope.data.pagination.isLoading = false;

            }, function (msg) {
                console.log(msg);
                $scope.data.pagination.isLoading = false;
            });
        }

        $scope.refreshTable = function () {
            if (parseInt($scope.data.pageData.numberOfPages) <= 1 && $scope.data.pageData.tableState) {
                $scope.getTransfersSql($scope.data.pageData.tableState);

            } else {
                angular
                    .element('#transferTablePagination')
                    .isolateScope()
                    .selectPage(1);
            }
        }

        $scope.searchTransfers = function () {
            $scope.refreshTable();
        }

        $scope.switchSelectAll = function () {
            $scope.data.selectAll = !$scope.data.selectAll;

            if ($scope.data.selectAll) {
                for (var i = 0; i < $scope.data.pageData.transfers.length; i++) {
                    $scope.data.pageData.transfers[i].checked = true;
                }

            } else {
                for (var i = 0; i < $scope.data.pageData.transfers.length; i++) {
                    $scope.data.pageData.transfers[i].checked = false;
                }
            }
        }

        $scope.checkTransfer = function (event, index) {
            event.stopPropagation();
        }

        /* ================= create a new box begin  ================= */
        $scope.pickTransfer = function (transfer) {
            console.log(transfer);
            var params = {
                transferId:transfer.transferid,
                organSegNumber: transfer.organInfo.segNumber,
                //transferNumber: transfer.transferNumber,
                deviceId: transfer.boxInfo.deviceId,
                segNumber: transfer.organInfo.segNumber,
                type: transfer.organInfo.type,
                organCount: transfer.organCount,
                bloodType: transfer.organInfo.bloodType,
                bloodSampleCount: transfer.organInfo.bloodSampleCount,
                organizationSampleCount: transfer.organInfo.organizationSampleCount,
                getOrganAt: transfer.getOrganAt,
                transferNumber: transfer.transferNumber,
                fromCity: transfer.fromCity,
                h_name: transfer.toHospitalInfo.name,
                tracfficType: transfer.tracfficType,
                tracfficNumber: transfer.tracfficNumber,
                tp_name: transfer.transferPersonInfo.name,
                phone: transfer.transferPersonInfo.phone,
                o_name: transfer.opoInfo.name,
                contactPerson: transfer.opoInfo.contactPerson,
                contactPhone: transfer.opoInfo.contactPhone,
                boxPin:transfer.boxPin
                //organSegNumber:"1354",

            };
            console.log(params);
            // Http.get('/transferInfo', params).then(function (data) {
            //     $scope.data.selectedTransfer = data;
            //     $scope.initData();  // 调用获取相关数据
            //     $scope.openDetailModal();   //打开model
            //
            // }, function (msg) {
            //
            // });

            $scope.open('app/pages/transbox/history/modal/detail.html', 'lg',
                HistoryModalCtrl, {name: params},
                function (item) {

                }, function (err) {
                    console.log(err);
                });
        };

        $scope.openDetailModal = function () {
            // var options = {
            //     animation: true,
            //     templateUrl: 'app/pages/transbox/history/modal/detail.html',
            //     size: 'lg',
            //     controller: 'HistoryModalCtrl',
            //     controllerAs: 'DetailModalCtrl',
            //     bindToController: true,
            //     scope: $scope,
            //     // backdrop: 'static',
            //     windowTopClass: 'transfer-modal-top-class'
            // }
            // $scope.data.detailModal = $uibModal.open(options);
            //
            // $scope.data.detailModal.closed.then(function () {
            //     console.log('modal is closed.');
            //     console.log($scope.data.newTransfer);
            // });
        };

        $scope.isDetailTransferParamsCorrect = function () {
            var opo = $scope.data.newTransfer;
            console.log(opo);
            if ($.isEmptyObject(opo.name) || $.isEmptyObject(opo.grade) || $.isEmptyObject(opo.district)) {
                return false;
            }

            if ($.isEmptyObject(opo.address) || $.isEmptyObject(opo.contactPerson) || $.isEmptyObject(opo.contactPhone)) {
                return false;
            }

            return true;
        }

        $scope.createDetailBox = function () {
            if (!$scope.isDetailBoxParamsCorrect()) {
                $scope.openToast('warning', '温馨提示', '请正确填写所有OPO信息');
                return;
            }

            var opoInfo = {
                name: $scope.data.newBox.name,
                grade: $scope.data.newBox.grade,
                contactPerson: $scope.data.newBox.contactPerson,
                district: $scope.data.newBox.district,
                address: $scope.data.newBox.address,
                contactPhone: $scope.data.newBox.contactPhone
            }

            if (!$.isEmptyObject($scope.data.newBox.remark)) {
                opoInfo.remark = $scope.data.newBox.remark;
            }

            Http.post(Config.apiPath.opo, opoInfo).then(function (data) {
                $scope.openToast('success', '创建成功', '您已成功创建一个OPO');
                $scope.initDetailBoxParams();
                $scope.closeDetailModal();
                $scope.refreshPage();
                // $scope.getBoxs();

            }, function (msg) {
                $scope.openToast('error', '创建失败', msg);
            });
        }

        $scope.closeDetailModal = function () {
            $scope.data.detailModal.close();
        };

        /* ================= create a new hospital end  ================= */

        $scope.openExportPage = function () {
            var url = "app/pages/transbox/history/widgets/export.html";
            var win = $window.open(url, true);
            win.focus();
        }


        $scope.exportTransfers = function () {
            var transferIds = [];
            for (var i = 0; i < $scope.data.pageData.transfers.length; i++) {
                var trans = $scope.data.pageData.transfers[i];
                if (trans.checked) {
                    transferIds.push(trans.transferid);
                }
            }

            if (transferIds.length > 0) {

                for (var i = 0; i < transferIds.length; i++) {
                    var transferid = transferIds[i];
                    var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
                    //local
                    //var URL = 'http://127.0.0.1:8080/transbox/api/export/' + transferid;
                    var URL = 'http://127.0.0.1:8080/transbox/download.do?transfer_id=' + transferid;
                    //release
                    //var URL = 'http://www.lifeperfusor.com/transbox/api/export/' + transferid;
                    var win = window.open(URL, "_blank", strWindowFeatures);

                }

            } else {
                $scope.openToast('warning', '温馨提示', '请先选择转运记录');
            }
        }


        $scope.propertyName = 'transferNumber';
        $scope.reverse = true;

        $scope.sortBy = function (propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };

    }


    // modal controller
    function HistoryModalCtrl($scope, Http, params,$uibModal, Common, $timeout) {
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
        var params1 = {
            organSegNumber: params.name.segNumber,
            transferNumber: params.name.transferNumber,
            transferId:params.name.transferId
        }



        $scope.openInfoForWindow = function (transferId) {
           // localStorage.transferInfo = transferInfo;
            var url ='http://www.lifeperfusor.com/transbox/transbox-adminPage/src/app/pages/transbox/history/modal/detailWindow.html?transferId='+transferId;
            window.open(url,'_blank');
        }
       var transferId =params.name.transferId;
        //$timeout(function () {
        // 根据传过来的参数 获取记录
        Http.get('/transferInfo', params1).then(
            function (data) {
                $scope.infoBase = data[0][0];
                $scope.infoRecord = data[1];
                console.log("js init2");
                if($scope.infoBase.avgHumidity){
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
        $scope.transferInfo = params.name;

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
            var count  = $scope.infoBase.count;
            var lineSize = 40;
            var sizeInt =1;
            if(count<=lineSize){

            }else{
               sizeInt = parseInt(count/lineSize)
            }

            for (var i = 0; i < $scope.infoRecord.length; i++) {
                if(i%sizeInt==0) {
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
                if(item.temperature<0||item.temperature>6){
                    temperature.push(parseFloat(item.temperature));
                    tDataX.push(item.recordAt1);
                    tDataY.push(item.temperature);
                    unTemperature++;
                    temperatureTotal++;
                }else if(item.temperature&&j%sizeInt==0)
                {
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

        $scope.getShowtime = function (time) {
            if (time == '--') {
                return '--'
            } else {
                return moment(time).format('YYYY-MM-DD HH:mm');
            }
        };

        // fullPage
        $scope.mainOptions = {
            navigation: true,
            navigationPosition: 'right',
            scrollingSpeed: 1000
        };
        console.log("five");
        // diff
        var script = document.createElement('script');
        script.src = "http://webapi.amap.com/maps?v=1.3&key=6178b4ecd30a43f661ad2abf15f35595";
        document.head.appendChild(script);
        var script1 = document.createElement('script');
        script1.src = "https://img.hcharts.cn/highcharts/highcharts.js";
        document.head.appendChild(script1);

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
            var transferid = tId;
            var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
            //local
            //var URL = 'http://localhost:1337/transbox/api/export/' + transferid;
            var URL = 'http://127.0.0.1:8080/transbox/download.do?transfer_id=' + transferid;
            //release
            // var URL = 'http://www.lifeperfusor.com/transbox/api/export/' + transferid;
            var win = window.open(URL, "_blank", strWindowFeatures);
        };
    }

})();