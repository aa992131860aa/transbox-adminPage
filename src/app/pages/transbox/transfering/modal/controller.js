/**
app.controller('InController', function ($scope, $state, $location, Config) {

})
    .controller('CreateController', function ($scope, $state, Config, HttpService, Common, $location) {
        $scope.init = function () {
            Common.setWechatTitle('新建转运');
        };
        $scope.init();

        $scope.data11 = {
            pageState: 1,
            keyData: '',
            opoData: '',
            transPersonData: '',
            pwd1: '',
            pwd2: '',

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
        $scope.initData = function () {
            var data = {
                deviceId: Config.deviceId
            };
            HttpService.get("/boxInfo", data,
                function (suc) {
                    if (suc) {
                        Config.boxid = suc.boxid;
                        Config.hospitalid = suc.hospital.hospitalid;
                        Config.name = suc.hospital.name;
                        $scope.getTransPerson(suc.hospital.hospitalid);
                    }
                }, function (fail) {

                });

            HttpService.get('/kwds', {},
                function (suc) {
                    if (suc) {
                        $scope.data1.keyData = suc;
                        $scope.data1.keyData.organ.push("其他(可填写)");
                        $scope.data1.keyData.bloodType.push("其他(可填写)");
                        $scope.data1.keyData.organisationSample.push("其他(可填写)");
                        $scope.data1.keyData.tracfficType.push("其他(可填写)");
                    }
                }, function (fail) {
                });

        };

        $scope.getParams = function () {
            if (!$location.search().deviceId) {
                alert("获取箱子信息失败，请重新尝试!");
               // return;
            }
            //Config.deviceId = $location.search().deviceId;
            Config.deviceId = '868930022822182';
            $scope.initData();
        };
        $scope.getParams();

        $scope.getTransPerson = function (hosId) {
            var data = {
                hospitalid: hosId
            };
            HttpService.get("/transferPersons", data,
                function (suc) {
                    if (suc) {
                        $scope.data1.transPersonData = suc;
                        $scope.initDataType();
                    }
                }, function (fail) {

                });
        };
        $scope.initDataType = function () {

             ///初始化需要的的数据

            $scope.data1.CreateBaseInfo.deviceType = "web";
            $scope.data1.CreateOrganInfo.dataType = "new";
            $scope.data1.CreateTransPersonInfo.dataType = "new";
            $scope.data1.CreateTransPersonInfo.transferPersonid = "";

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

        $scope.choiceOrgType = function (pos) {
            mui('#pop_orgType').popover('hide');
            if (pos == $scope.data1.keyData.organ.length - 1) {
                Common.removeAttr("id_orgType");
                $scope.data1.CreateOrganInfo.type = '';
                return;
            }
            Common.attr("id_orgType");
            $scope.data1.CreateOrganInfo.type = $scope.data1.keyData.organ[pos];
            if ($scope.data.keyData.organ[pos] == '肾') {
                $scope.data1.CreateBaseInfo.organCount = 2;
            }

        };

        $scope.choiceBloodType = function (pos) {
            mui('#pop_bloodType').popover('hide');
            if (pos == $scope.data1.keyData.bloodType.length - 1) {
                Common.removeAttr("id_bloodType");
                $scope.data1.CreateOrganInfo.bloodType = '';
                return;
            }
            Common.attr("id_bloodType");
            $scope.data1.CreateOrganInfo.bloodType = $scope.data1.keyData.bloodType[pos];
        };

        $scope.choiceOrgSmapleType = function (pos) {
            mui('#pop_orgSmapleType').popover('hide');
            if (pos == $scope.data1.keyData.organisationSample.length - 1) {
                Common.removeAttr("id_orgSmapleType");
                $scope.data1.CreateOrganInfo.organizationSampleType = '';
                return;
            }
            Common.attr("id_orgSmapleType");
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
                Common.removeAttr("id_tracfficType");
                $scope.data1.CreateBaseInfo.tracfficType = '';
                return;
            }
            Common.attr("id_tracfficType");
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

        $scope.next = function () {
            if ($scope.data.CreateOrganInfo.segNumber == '' || $scope.data1.CreateBaseInfo.getOrganAt == '' ||
                $scope.data1.CreateOrganInfo.type == '' || $scope.data1.CreateBaseInfo.organCount == '' ||
                $scope.data1.CreateOrganInfo.bloodType == '' || $scope.data1.CreateOrganInfo.bloodSampleCount == '' ||
                $scope.data1.CreateOrganInfo.organizationSampleType == '' || $scope.data1.CreateOrganInfo.organizationSampleCount == '') {
                mui.toast("请完善所有信息");
               // return;
            }

            // console.log($scope.data.CreateOrganInfo.segNumber + " / " + $scope.data1.CreateBaseInfo.getOrganAt + " / " +
            //     $scope.data1.CreateOrganInfo.type + " / " + $scope.data1.CreateBaseInfo.organCount + " / " +
            //     $scope.data1.CreateOrganInfo.bloodType + " / " + $scope.data1.CreateOrganInfo.bloodSampleCount + "/" +
            //     $scope.data1.CreateOrganInfo.organizationSampleType + " / " + $scope.data1.CreateOrganInfo.organizationSampleCount);

            $scope.getOpoInfo();
            $scope.data1.pageState = 2;
        };

        $scope.getOpoInfo = function () {

            HttpService.get("/opos2", {},
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
                    var orgNum = parseInt($scope.data.CreateBaseInfo.organCount);
                    if (orgNum > 1) {
                        $scope.data1.CreateBaseInfo.organCount = --orgNum;
                    }
                    break;
                case 1:
                    var bloodNum = parseInt($scope.data.CreateOrganInfo.bloodSampleCount);
                    if (bloodNum > 1) {
                        $scope.data1.CreateOrganInfo.bloodSampleCount = --bloodNum;
                    }
                    break;
                case 2:
                    var orgSampleNum = parseInt($scope.data.CreateOrganInfo.organizationSampleCount);
                    if (orgSampleNum > 1) {
                        $scope.data1.CreateOrganInfo.organizationSampleCount = --orgSampleNum;
                    }
                    break;
            }
        };

        $scope.tvUp = function (state) {
            switch (state) {
                case 0:
                    var orgNum = parseInt($scope.data.CreateBaseInfo.organCount);
                    $scope.data1.CreateBaseInfo.organCount = ++orgNum;
                    break;
                case 1:
                    var bloodNum = parseInt($scope.data.CreateOrganInfo.bloodSampleCount);
                    $scope.data1.CreateOrganInfo.bloodSampleCount = ++bloodNum;
                    break;
                case 2:
                    var orgSampleNum = parseInt($scope.data.CreateOrganInfo.organizationSampleCount);
                    $scope.data1.CreateOrganInfo.organizationSampleCount = ++orgSampleNum;
                    break;
            }
        };

        $scope.back = function () {
            $scope.data1.pageState = 1;
        };

        $scope.preView = function () {
            if ($scope.data.CreateBaseInfo.fromCity == '' || $scope.data1.CreateTransToInfo.toHospName == '' ||
                $scope.data1.CreateBaseInfo.tracfficType == '' ||
                $scope.data1.CreateTransPersonInfo.name == '' || $scope.data1.CreateTransPersonInfo.phone == '' ||
                $scope.data1.CreateOpoInfo.name == '' || $scope.data1.CreateOpoInfo.contactPerson == '' ||
                $scope.data1.CreateOpoInfo.contactPhone == '' || $scope.data1.pwd1 == '' || $scope.data1.pwd2 == '') {
                mui.toast("请完善所有信息");
                //return;
            }

            if (!Common.Validate_checkphone($scope.data.CreateTransPersonInfo.phone)) {
                mui.toast("手机号格式不正确");
                //return;
            }

            if ($scope.data.pwd1 != $scope.data1.pwd2) {
                mui.toast("两次输入的密码不一致");
               // return;
            }

            // 开箱密码
            $scope.data1.CreateBaseInfo.boxPin = $scope.data1.pwd1;

            // 目的地状态
            if (Config.name == $scope.data1.CreateTransToInfo.toHospName) {
                $scope.data1.CreateTransToInfo.dataType = "db";
            } else {
                $scope.data1.CreateTransToInfo.dataType = "new";
            }

            $scope.data1.pageState = 3;
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
                opo: $scope.data1.CreateOpoInfo
            };
            HttpService.post("/transfer", data,
                function (suc) {

                    $scope.data1 = '';
                    $state.go('createSuccess');
                }, function (fail) {

                })
        }

    })
    .controller('CreateSuccessController', function ($scope, Common) {
        $scope.init = function () {
            Common.setWechatTitle('新建成功');
        };
        $scope.init();

        $scope.data1 = {
            bg: "img/suc.png"
        }

    });
*/