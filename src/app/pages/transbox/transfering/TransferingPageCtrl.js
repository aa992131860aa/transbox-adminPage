(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transbox.transfering')
        .controller('TransferingPageCtrl', TransferingPageCtrl)
        .controller('TransferingModalCtrl', TransferingModalCtrl)
        .controller('StopTransferCtrl', StopTransferCtrl)
        .controller('WriteTransferCtrl', WriteTransferCtrl);

    function StopTransferCtrl($scope) {


    }

    function WriteTransferCtrl($scope) {


    }

    function TransferingPageCtrl($scope, $filter, editableOptions, editableThemes, Http, Config, $uibModal, Common, $interval, toastr, toastrConfig, $location) {
        //登录类型
        $scope.userType = Config.userInfo.type;
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

        /**
         * 补全信息
         * @param transferId
         */
        $scope.writeInfo = function (event, index, transferId) {
            event.stopPropagation();
            //console.log("transferId:" + transferId);
        }

        $scope.open = function (page, size, ctrl, params, windowTopClass, saveCB, cancelCB) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: ctrl,
                bindToController: true,
                resolve: {
                    params: params
                },
                windowTopClass: windowTopClass
            }).result.then(function (result) {
                saveCB(result);
            }, function (result) {
                cancelCB(result);
            });
        };

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
            username:Config.userInfo.username,
            pwd: "",
            transferId: "",
            boxId: "",
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
        $scope.openNewModal = function (event, index, transferId) {
            event.stopPropagation();
            $scope.data.transferId = transferId;


            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/transfering/modal/stopTransfer.html',
                size: 'sm',
                controller: 'StopTransferCtrl',
                controllerAs: 'NewModalCtrl',
                bindToController: true,
                scope: $scope,
                //backdrop: 'static',
                windowTopClass: 'transfer-transfer-modal-top-class'
            }
            $scope.data.deleteModal = $uibModal.open(options);

            $scope.data.deleteModal.closed.then(function () {
                console.log('modal is closed.');
                //console.log($scope.data.newOpo);
            });
        }
        var username = Config.userInfo.username;
        $scope.stopTransfer = function () {
            var pwd = $scope.data.pwd;
            var loginParams = {
                pwd: pwd,
                username: $scope.data.username
            }
            var stopParams = {
                transferid: $scope.data.transferId
            }


            Http.post(Config.apiPath.login, loginParams).then(function (data) {

                //验证密码成功
                if (data.username == $scope.data.username) {
                    //停止转运
                    Http.put("/transfer/" + $scope.data.transferId + "/done", stopParams).then(function (data) {

                        $scope.openToast('success', '删除成功', '您已成功停止转运');

                        $scope.deleteModal();
                        //刷新界面
                        $scope.refreshTable();
                    }, function (msg) {

                    });
                } else {
                    $scope.openToast('warning', '温馨提醒', '密码错误!!!');
                }
            }, function (msg) {
                console.log("msg:" + msg);
                $scope.openToast('warning', '温馨提醒', '密码错误!!!');
            });
        }
        $scope.deleteModal = function () {
            $scope.data.deleteModal.close();
        }


        $scope.tdClick = function (event) {
            event.stopPropagation();
        }
        $scope.createNewModal = function (event, index, transferId, boxId, transfer) {
            console.log(transfer);
            event.stopPropagation();
            $scope.data1 = {
                pageState: 1,
                keyData: '',
                opoData: '',
                transPersonData: '',
                pwd1: '',
                pwd2: '',
                transferid:'',
                CreateOrganInfo: {
                    segNumber: '',
                    type: '',
                    bloodType: '',
                    bloodSampleCount: '1',
                    organizationSampleType: '',
                    organizationSampleCount: '1',
                    dataType: ''
                },
                CreateBaseInfo: {
                    box_id: '',
                    boxPin: '',
                    getOrganAt: '',
                    organCount: '1',
                    fromCity: '',
                    tracfficType: '',
                    tracfficNumber: '',
                    deviceType: ''
                },
                CreateOpoInfo: {
                    name: '',
                    contactPerson: '',
                    contactPhone: '',
                    opoid: '',
                    dataType: ''
                },
                CreateTransToInfo: {
                    toHospName: '',
                    dataType: ''
                },
                CreateTransPersonInfo: {
                    name: '',
                    phone: '',
                    dataType: '',
                    transferPersonid: ''
                }
            };

            $scope.data.transferId = transferId;
            $scope.data.boxId = boxId;
            $scope.data1.pageState = 1;
            $scope.data1.transferid = transferId;
            //设置已显示的信息
            if (transfer.organInfo && transfer.organInfo.segNumber) {
                $scope.data1.CreateOrganInfo.segNumber = transfer.organInfo.segNumber;
            }
            if (transfer.organInfo && transfer.organInfo.type) {
                $scope.data1.CreateOrganInfo.type = transfer.organInfo.type;
            }
            if (transfer.organInfo && transfer.organInfo.bloodType) {
                $scope.data1.CreateOrganInfo.bloodType = transfer.organInfo.bloodType;
            }
            if (transfer.organInfo && transfer.organInfo.organizationSampleType) {
                $scope.data1.CreateOrganInfo.organizationSampleType = transfer.organInfo.organizationSampleType;
            }
            if (transfer.organCount) {
                $scope.data1.CreateBaseInfo.organCount = transfer.organCount;
            }
            if (transfer.organInfo && transfer.organInfo.bloodSampleCount) {
                $scope.data1.CreateOrganInfo.bloodSampleCount = transfer.organInfo.bloodSampleCount;
            }
            if (transfer.organInfo && transfer.organInfo.organizationSampleCount) {
                $scope.data1.CreateOrganInfo.organizationSampleCount = transfer.organInfo.organizationSampleCount;
            }
            //起始地 目的地
            if (transfer.fromCity) {
                $scope.data1.CreateBaseInfo.fromCity = transfer.fromCity;
            }
            if (transfer.toHospitalInfo && transfer.toHospitalInfo.name) {
                $scope.data1.CreateTransToInfo.toHospName = transfer.toHospitalInfo.name;
            }
            if (transfer.tracfficType) {
                $scope.data1.CreateBaseInfo.tracfficType = transfer.tracfficType;
            }

            if (transfer.tracfficNumber) {
                $scope.data1.CreateBaseInfo.tracfficNumber = transfer.tracfficNumber;
            }

            if(transfer.transferPersonInfo&&transfer.transferPersonInfo.name){
                $scope.data1.CreateTransPersonInfo.name = transfer.transferPersonInfo.name;
            }
            if(transfer.transferPersonInfo&&transfer.transferPersonInfo.transferPersonid){
                $scope.data1.CreateTransPersonInfo.transferPersonid = transfer.transferPersonInfo.transferPersonid;
            }
            if(transfer.transferPersonInfo&&transfer.transferPersonInfo.phone){
                $scope.data1.CreateTransPersonInfo.phone = transfer.transferPersonInfo.phone;
            }
            if(transfer.opoInfo&&transfer.opoInfo.name){
                $scope.data1.CreateOpoInfo.name = transfer.opoInfo.name;
            }
            if(transfer.opoInfo&&transfer.opoInfo.contactPerson){
                $scope.data1.CreateOpoInfo.contactPerson = transfer.opoInfo.contactPerson;
            }
            if(transfer.opoInfo&&transfer.opoInfo.contactPhone){
                $scope.data1.CreateOpoInfo.contactPhone = transfer.opoInfo.contactPhone;
            }
            if(transfer.opoInfo&&transfer.opoInfo.opoid){
                $scope.data1.CreateOpoInfo.opoid = transfer.opoInfo.opoid;
            }
            if(transfer.boxPin){
                $scope.data1.pwd1 = transfer.boxPin;
                $scope.data1.pwd2 = transfer.boxPin;
            }


            var options = {
                animation: true,
                templateUrl: 'app/pages/transbox/transfering/modal/create.html',
                size: 'lg',
                controller: 'WriteTransferCtrl',
                controllerAs: 'createModalCtrl',
                bindToController: true,
                scope: $scope,
                backdrop: 'static',
                windowTopClass: 'transfer-create-modal-top-class'
            }
            $scope.data.createModal = $uibModal.open(options);

            $scope.data.createModal.closed.then(function () {
                console.log('modal is closed.');

            });

            var data = {
                boxid: boxId
            };


            Http.get("/boxInfo", data).then(
                function (suc) {
                    if (suc) {
                        Config.boxid = suc.boxid;
                        Config.hospitalid = suc.hospital.hospitalid;
                        Config.name = suc.hospital.name;
                        $scope.getTransPerson(suc.hospital.hospitalid);
                        //console.log(suc)
                    }
                }, function (fail) {
                    //console.log(fail)
                });
            $scope.getOpoInfo();
            $scope.initData = function () {


                Http.get('/kwds', "").then(
                    function (suc) {
                        if (suc) {
                            $scope.data1.keyData = suc;
                            //$scope.data1.keyData.organ.push("其他(可填写)");
                            //$scope.data1.keyData.bloodType.push("其他(可填写)");
                            //$scope.data1.keyData.organisationSample.push("其他(可填写)");
                            $scope.data1.keyData.tracfficType.push("其他(可填写)");
                            //console.log(suc);
                        }
                    }, function (fail) {
                    });

            };


            $scope.initData();

            $scope.getTransPerson = function (hosId) {
                var data = {
                    hospitalid: hosId
                };
                Http.get("/transferPersons", data).then(
                    function (suc) {
                        if (suc) {
                            $scope.data1.transPersonData = suc;
                            var add = {
                                "transferPersonid": "",
                                "name": "其他(可填写)",
                                "phone": "",
                                "organType": "",
                                "createAt": "",
                                "modifyAt": "",
                                "hospital": {
                                    "hospitalid": "",
                                    "name": "",
                                    "district": "",
                                    "address": "",
                                    "electricStatus": 1,
                                    "grade": "",
                                    "remark": "",
                                    "status": "",
                                    "createAt": "",
                                    "modifyAt": "",
                                    "account_id": ""
                                }
                            }
                            $scope.data1.transPersonData.push(add);
                            $scope.initDataType();
                            //console.log(suc);
                        }
                    }, function (fail) {
                        // console.log(fail);
                    });
            };
            $scope.initDataType = function () {

                ///初始化需要的的数据
                $scope.data1.pageState = 1;
                $scope.data1.CreateBaseInfo.deviceType = "web";
                $scope.data1.CreateOrganInfo.dataType = "new";
                $scope.data1.CreateTransPersonInfo.dataType = "new";
                //$scope.data1.CreateTransPersonInfo.transferPersonid = "";

                $scope.data1.CreateBaseInfo.box_id = Config.boxid;
                $scope.data1.CreateTransToInfo.toHospName = Config.name;
            };

            $scope.initTime = function () {
                var date = new Date();
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                m = m < 10 ? ('0' + m) : m;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                var minute = date.getMinutes();
                minute = minute < 10 ? ('0' + minute) : minute;

                $('#time').text(y + '-' + m + '-' + d + ' ' + h + ':' + minute);

                $scope.data1.CreateBaseInfo.getOrganAt = y + '-' + m + '-' + d + ' ' + h + ':' + minute + ":00";
            };
            $scope.initTime();


        }

        $scope.createClose = function () {
            $scope.data.createModal.close();
        }


        $scope.choiceOrgType = function (pos) {
            mui('#pop_orgType').popover('hide');
            if (pos == $scope.data1.keyData.organ.length - 1) {
                // Common1.removeAttr("id_orgType");
                $scope.data1.CreateOrganInfo.type = '';
                return;
            }
            //Common1.attr("id_orgType");
            $scope.data1.CreateOrganInfo.type = $scope.data1.keyData.organ[pos];
            if ($scope.data1.keyData.organ[pos] == '肾') {
                $scope.data1.CreateBaseInfo.organCount = 2;
            }

        };

        $scope.choiceBloodType = function (pos) {
            mui('#pop_bloodType').popover('hide');
            if (pos == $scope.data1.keyData.bloodType.length - 1) {
                //Common1.removeAttr("id_bloodType");
                $scope.data1.CreateOrganInfo.bloodType = '';
                return;
            }
            // Common1.attr("id_bloodType");
            $scope.data1.CreateOrganInfo.bloodType = $scope.data1.keyData.bloodType[pos];
        };

        $scope.choiceOrgSmapleType = function (pos) {
            mui('#pop_orgSmapleType').popover('hide');
            if (pos == $scope.data1.keyData.organisationSample.length - 1) {
                // Common1.removeAttr("id_orgSmapleType");
                $scope.data1.CreateOrganInfo.organizationSampleType = '';
                return;
            }
            // Common1.attr("id_orgSmapleType");
            $scope.data1.CreateOrganInfo.organizationSampleType = $scope.data1.keyData.organisationSample[pos];
        };

        $scope.choiceOpo = function (pos) {
            mui('#pop_opoInfo').popover('hide');
            var item = $scope.data1.opoData[pos];

            $scope.data1.CreateOpoInfo.name = item.name;
            $scope.data1.CreateOpoInfo.contactPerson = item.contactPerson;
            $scope.data1.CreateOpoInfo.contactPhone = item.contactPhone;
            $scope.data1.CreateOpoInfo.opoid = item.opoid;
            $scope.data1.CreateOpoInfo.dataType = "db";
        };

        $scope.choiceTracfficType = function (pos) {
            mui('#pop_tracfficType').popover('hide');
            if (pos == $scope.data1.keyData.tracfficType.length - 1) {
                // Common1.removeAttr("id_tracfficType");
                $scope.data1.CreateBaseInfo.tracfficType = '';
                return;
            }
            //Common1.attr("id_tracfficType");
            $scope.data1.CreateBaseInfo.tracfficType = $scope.data1.keyData.tracfficType[pos];
        };

        $scope.choiceTransPerson = function (pos) {
            mui('#pop_transPerson').popover('hide');
            var item = $scope.data1.transPersonData[pos];
            $scope.data1.CreateTransPersonInfo.name = item.name;
            $scope.data1.CreateTransPersonInfo.phone = item.phone;
            $scope.data1.CreateTransPersonInfo.transferPersonid = item.transferPersonid;
            $scope.data1.CreateTransPersonInfo.dataType = "db";
        };


        $scope.getOpoInfo = function () {

            Http.get("/opos2", {}).then(
                function (suc) {
                    if (suc) {
                        $scope.data1.opoData = suc;
                    }
                }, function (fail) {

                })
        };

        $scope.tvDown = function (state) {
            switch (state) {
                case 0:
                    var orgNum = parseInt($scope.data1.CreateBaseInfo.organCount);
                    if (orgNum > 1) {
                        $scope.data1.CreateBaseInfo.organCount = --orgNum;
                    }
                    break;
                case 1:
                    var bloodNum = parseInt($scope.data1.CreateOrganInfo.bloodSampleCount);
                    if (bloodNum > 1) {
                        $scope.data1.CreateOrganInfo.bloodSampleCount = --bloodNum;
                    }
                    break;
                case 2:
                    var orgSampleNum = parseInt($scope.data1.CreateOrganInfo.organizationSampleCount);
                    if (orgSampleNum > 1) {
                        $scope.data1.CreateOrganInfo.organizationSampleCount = --orgSampleNum;
                    }
                    break;
            }
        };

        $scope.tvUp = function (state) {
            switch (state) {
                case 0:
                    var orgNum = parseInt($scope.data1.CreateBaseInfo.organCount);
                    $scope.data1.CreateBaseInfo.organCount = ++orgNum;
                    break;
                case 1:
                    var bloodNum = parseInt($scope.data1.CreateOrganInfo.bloodSampleCount);
                    $scope.data1.CreateOrganInfo.bloodSampleCount = ++bloodNum;
                    break;
                case 2:
                    var orgSampleNum = parseInt($scope.data1.CreateOrganInfo.organizationSampleCount);
                    $scope.data1.CreateOrganInfo.organizationSampleCount = ++orgSampleNum;
                    break;
            }
        };

        $scope.back = function () {
            $scope.data1.pageState = 1;
        };
        $scope.selectIndex = 0;
        $scope.cancelPerson = function () {
            if ($scope.selectIndex == 1) {
                $("#tracfficChange ").get(0).selectedIndex = 0;
            } else if ($scope.selectIndex == 2) {
                $("#transPersonChange ").get(0).selectedIndex = 0;
            }

        }

        //转运方式
        $scope.tracfficChange = function (index, title) {
            if (index === $scope.data1.keyData.tracfficType.length - 1) {
                $('#tracfficChange').removeAttr('readonly', 'readonly');
                $('#tracfficChange').val('');
                $('#tracfficChange').focus();
                var p = $(".popup").prompt21();

                p.getData(function (err, data) {
                    var name = data.name.first;
                    $('#tracfficChange').val(name);
                    $scope.data1.CreateBaseInfo.tracfficType = name;

                });


            } else {
                $('#tracfficChange').attr('readonly', 'readonly');
                $scope.data1.CreateBaseInfo.tracfficType = title;

            }
        }
        //转运人
        $scope.transPersonChange = function (index, title) {
            if (index === $scope.data1.transPersonData.length - 1) {
                $('#transPersonChange').removeAttr('readonly', 'readonly');
                $('#transPersonChange').val('');
                $('#transPersonChange').focus();
                var p = $(".popup").prompt21();

                p.getData(function (err, data) {
                    var name = data.name.first;
                    $('#transPersonChange').val(name);
                    $scope.data1.CreateTransPersonInfo.name = name;

                });


            } else {
                $('#transPersonChange').attr('readonly', 'readonly');
                $scope.data1.CreateTransPersonInfo.name = title;
                $scope.data1.CreateTransPersonInfo.transferPersonid = $scope.data1.transPersonData[index].transferPersonid;
                $scope.data1.CreateTransPersonInfo.phone = $scope.data1.transPersonData[index].phone;
            }
        }

        //获取组织
        $scope.opoChange = function (index, title) {

            $scope.data1.CreateOpoInfo.name = title;
            $scope.data1.CreateOpoInfo.opoid = $scope.data1.opoData[index].opoid;
            $scope.data1.CreateOpoInfo.contactPerson = $scope.data1.opoData[index].contactPerson;
            $scope.data1.CreateOpoInfo.contactPhone = $scope.data1.opoData[index].contactPhone;

        }
        //器官种类
        $scope.CreateOrganInfoType = function (index, title) {

            $scope.data1.CreateOrganInfo.type = title;

        }
        //血型
        $scope.CreateOrganInfoBloodType = function (index, title) {

            $scope.data1.CreateOrganInfo.bloodType = title;

        }
        //组织样本类型
        $scope.CreateOrganInfoOrganisationSample = function (index, title) {

            $scope.data1.CreateOrganInfo.organizationSampleType = title;

        }

        $scope.preView = function () {
            if ($scope.data1.CreateOrganInfo.segNumber == '' || $scope.data1.CreateBaseInfo.getOrganAt == '' ||
                $scope.data1.CreateOrganInfo.type == '' || $scope.data1.CreateBaseInfo.organCount == '' ||
                $scope.data1.CreateOrganInfo.bloodType == '' || $scope.data1.CreateOrganInfo.bloodSampleCount == '' ||
                $scope.data1.CreateOrganInfo.organizationSampleType == '' || $scope.data1.CreateOrganInfo.organizationSampleCount == '') {

                $scope.openToast('warning', '温馨提示', '请完善所有信息');
                return;
            }
            if ($scope.data1.CreateBaseInfo.fromCity == '' || $scope.data1.CreateTransToInfo.toHospName == '' ||
                $scope.data1.CreateBaseInfo.tracfficType == '' ||
                $scope.data1.CreateTransPersonInfo.name == '' || $scope.data1.CreateTransPersonInfo.phone == '' ||
                $scope.data1.CreateOpoInfo.name == '' || $scope.data1.CreateOpoInfo.contactPerson == '' ||
                $scope.data1.CreateOpoInfo.contactPhone == '' || $scope.data1.pwd1 == '' || $scope.data1.pwd2 == '') {
                $scope.openToast('warning', '温馨提示', '请完善所有信息');
                return;
            }
            //$scope.openToast('warning', '温馨提示', $scope.data1.CreateTransPersonInfo.transferPersonid);
            console.log("gg:"+ $scope.data1.CreateTransPersonInfo.transferPersonid)
            // if (!Common1.Validate_checkphone($scope.data.CreateTransPersonInfo.phone)) {
            //     mui.toast("手机号格式不正确");
            //     //return;
            // }

            if ($scope.data1.pwd1 != $scope.data1.pwd2) {
                $scope.openToast('warning', '温馨提示', '两次输入的密码不一致');
                return;
            }

            // 开箱密码
            $scope.data1.CreateBaseInfo.boxPin = $scope.data1.pwd1;

            // 目的地状态
            if (Config.name == $scope.data1.CreateTransToInfo.toHospName) {
                $scope.data1.CreateTransToInfo.dataType = "db";
            } else {
                $scope.data1.CreateTransToInfo.dataType = "new";
            }

            $scope.data1.pageState = 2;
        };

        $scope.editTrans = function () {
            $scope.data1.pageState = 2;
        };


        //新建转运 提交请求

        $scope.commitTrans = function () {
            var data = {
                baseInfo: $scope.data1.CreateBaseInfo,
                organ: $scope.data1.CreateOrganInfo,
                person: $scope.data1.CreateTransPersonInfo,
                to: $scope.data1.CreateTransToInfo,
                opo: $scope.data1.CreateOpoInfo,
                transferId:$scope.data1.transferid
            };
            Http.post("/modifyTransfer", data).then(
                function (suc) {
                    $scope.openToast("warning","温馨提示","修改转运信息成功");
                    $scope.createClose();
                    //刷新界面
                    $scope.refreshTable();

                }, function (fail) {
                    alert(fail);
                    $scope.openToast("warning","温馨提示",fail);
                })
        }


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
        $scope.data.searchOptions.organType = '0';
        $scope.data.searchOptions.toHospitalName = '0';
        $scope.toggleBeginDatepicker = function () {
            $scope.data.beginDate.isOpen = !$scope.data.beginDate.isOpen;
        }

        $scope.toggleEndDatepicker = function () {
            $scope.data.endDate.isOpen = !$scope.data.endDate.isOpen;
        }

        $scope.getDateString = function (obj) {
            return Config.getDateStringFromObject(obj);
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
                type: 'transfering'
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

            // if (Config.getFormatStringFromDate(beginDate)) {
            //     params.beginDate = Config.getFormatStringFromDate(beginDate);
            // }
            //
            // var endDate = $scope.data.searchOptions.endDate;
            // if (Config.getFormatStringFromDate(endDate)) {
            //     params.endDate = Config.getFormatStringFromDate(endDate);
            // }

            Http.get(Config.apiPath.transfers, params).then(function (data) {
                $scope.data.pageData = data;
                tableState.pagination.numberOfPages = data.numberOfPages;
                $scope.data.pageData.displayedPages = Math.ceil(parseFloat(data.totalItems) / parseInt(data.numberOfPages));
                $scope.data.pageData.tableState = tableState;
                $scope.data.pagination.isLoading = false;

            }, function (msg) {
                //console.log(msg);
                $scope.data.pagination.isLoading = false;
            });
        }

        $scope.refreshTable = function () {
            if (parseInt($scope.data.pageData.numberOfPages) <= 1 && $scope.data.pageData.tableState) {
                $scope.getTransfers($scope.data.pageData.tableState);

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
            var params = {
                transferId: transfer.transferid,
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
                boxPin: transfer.boxPin
                //organSegNumber:"1354",

            };
            // Http.get('/transferInfo', params).then(function(data) {
            //     $scope.data.selectedTransfer = data;
            //     $scope.initData();
            //     $scope.openDetailModal();
            //
            // }, function(msg) {
            //
            // });
            $scope.open('app/pages/transbox/transfering/modal/detail.html', 'lg',
                TransferingModalCtrl, {name: params}, 'transfer-history-modal-top-class',
                function (item) {

                }, function (err) {

                });
        }

        $scope.openDetailModal = function () {

        }

        $scope.isDetailTransferParamsCorrect = function () {
            var opo = $scope.data.newTransfer;
            // console.log(opo);
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
        }


        $scope.propertyName = 'transferNumber';
        $scope.reverse = true;

        $scope.sortBy = function (propertyName) {
            $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
        };
    }

    // modal controller
    function TransferingModalCtrl($scope, Http, params, $uibModal, Common, $timeout) {
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
        $scope.addTeam = function () {
            $scope.item.isShow = !$scope.item.isShow;
        }
        var params1 = {
            organSegNumber: params.name.segNumber,
            transferNumber: params.name.transferNumber,
            transferId: params.name.transferId
        }


        $scope.openInfoForWindow = function (transferId) {
            // localStorage.transferInfo = transferInfo;
            var url = 'http://www.lifeperfusor.com/transbox/transbox-adminPage/src/app/pages/transbox/transfering/modal/detailWindow.html?transferId=' + transferId;
            //var url = 'http://localhost:63342/transbox-adminPage/src/app/pages/transbox/transfering/modal/detailWindow.html?transferId=' + transferId;
            window.open(url, '_blank');
        }
        var transferId = params.name.transferId;
        //$timeout(function () {
        // 根据传过来的参数 获取记录
        Http.get('/transferInfo', params1).then(
            function (data) {
                $scope.infoBase = data[0][0];
                $scope.infoRecord = data[1];
                //console.log("js init2");
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