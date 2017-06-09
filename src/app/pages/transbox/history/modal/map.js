var mapId ;
var temperatureId;
function map() {
    var mapObj;
    var recordData;

    var scope = angular.element($("#map")).scope();
    if (scope) {
     window.clearInterval(mapId);

    var data = scope.infoRecord;

    if (data) {
        recordData = data;

        if (recordData.length > 0) {

            function mapInit() {
                for (var i = 0; i < recordData.length; i++) {
                    var item = recordData[i];
                    if (item.longitude && item.latitude) {
                        mapObj = new AMap.Map('map', {
                            dragEnable: false,
                            zoomEnable: false,
                            zoom: 10,
                            center: [item.longitude, item.latitude]
                        });

                        AMap.event.addListener(mapObj, "complete", completeEventHandler);

                        return;
                    }
                }

            }

            mapInit();
            //在指定位置打开信息窗体
            function openInfoCollision(map, e, data) {
                //构建信息窗体中显示的内容
                var info = [];

                info.push("<div style=\"padding:0px 0px 0px 8px;\"><b>碰撞异常</b>");
                info.push("<div style=\";color:#ff0000;\">" + data + "");
                infoWindow = new AMap.InfoWindow({
                    content: info.join("<br/>")  //使用默认信息窗体框样式，显示信息内容
                });
                infoWindow.open(map, e.target.getPosition());
            }

            //在指定位置打开信息窗体
            function openInfoOpenData(map, e, data) {
                //构建信息窗体中显示的内容
                var info = [];

                info.push("<div style=\"padding:0px 0px 0px 4px;\"><b>开箱异常</b>");
                info.push("时间:<div style=\";color:#ff0000;\"><b>" + data + "</b>");
                infoWindow = new AMap.InfoWindow({
                    content: info.join("<br/>")  //使用默认信息窗体框样式，显示信息内容
                });
                infoWindow.open(map, e.target.getPosition());
            }

            //在指定位置打开信息窗体
            function openInfoTemperature(map, e, data, time) {
                //构建信息窗体中显示的内容
                var info = [];

                info.push("<div style=\"padding:0px 0px 0px 4px;\"><b>温度异常</b>");
                info.push("温度:<span style=\"color:#ff0000;\"><b>" + data + "℃</b></span>");
                info.push("时间:<sapn style=\"color:#ff0000;\"><b>" + time + "</b></sapn>");
                infoWindow = new AMap.InfoWindow({
                    content: info.join("<br/>")  //使用默认信息窗体框样式，显示信息内容
                });
                infoWindow.open(map, e.target.getPosition());
            }

            function completeEventHandler() {
                lineArr = new Array();
                //碰撞
                var collisionData = scope.data.collisionData;
                var openData = scope.data.openData;
                for (var i = 0; i < recordData.length; i++) {
                    var item = recordData[i];
                    if (item.longitude && item.latitude) {

                        //alert(item.longitude+","+item.latitude);
                        //开始标志
                        if (i == 0) {
                            marker = new AMap.Marker({
                                map: mapObj,
                                position: new AMap.LngLat(item.longitude, item.latitude),//基点位置
                                //  title: item.temperature,
                                icon: "http://webapi.amap.com/theme/v1.3/markers/n/start.png"
                            });

                        }

                        //结束标志
                        if (i == recordData.length - 1) {
                            marker = new AMap.Marker({
                                map: mapObj,
                                position: new AMap.LngLat(item.longitude, item.latitude),//基点位置
                                //  title: item.temperature,
                                icon: "http://webapi.amap.com/theme/v1.3/markers/n/end.png"
                            });
                        }

                        //异常温度
                        if (item.temperature < 0 || item.temperature > 6) {
                            // console.log("t:"+item.temperature);
                            markerT = new AMap.Marker({
                                map: mapObj,
                                position: new AMap.LngLat(item.longitude, item.latitude),//基点位置
                                //  title: item.temperature,
                                icon: "http://127.0.0.1:8080/transbox/images/temperature.png"
                            });
                            //鼠标点击marker弹出自定义的信息窗体
                            markerT.on('click', function (e) {
                                openInfoTemperature(mapObj, e, item.temperature, item.recordAt);


                            });
                        }
                        //碰撞
                        for (var d = 0; d < collisionData.length; d++) {
                            //console.log("c:"+collisionData[d]);
                            // console.log("r:"+item.recordAt);
                            if (collisionData[d] == item.recordAt) {
                                markerC = new AMap.Marker({
                                    map: mapObj,
                                    position: new AMap.LngLat(item.longitude, item.latitude),//基点位置
                                    //  title: item.temperature,
                                    icon: "http://127.0.0.1:8080/transbox/images/collision.png"
                                });
                                //鼠标点击marker弹出自定义的信息窗体
                                markerC.on('click', function (e) {
                                    openInfoCollision(mapObj, e, item.recordAt);
                                });
                                break;
                            }
                        }
                        //开箱
                        for (var m = 0; m < openData.length; m++) {
                            //console.log("c:"+collisionData[d]);
                            // console.log("r:"+item.recordAt);
                            if (openData[m] == item.recordAt) {
                                markerO = new AMap.Marker({
                                    map: mapObj,
                                    position: new AMap.LngLat(item.longitude, item.latitude),//基点位置
                                    //  title: item.temperature,
                                    icon: "http://127.0.0.1:8080/transbox/images/open.png"
                                });
                                //鼠标点击marker弹出自定义的信息窗体
                                markerO.on('click', function (e) {
                                    openInfoOpenData(mapObj, e, item.recordAt);
                                });
                                break;
                            }
                        }
                        lineArr.push(new AMap.LngLat(item.longitude, item.latitude));

                    }
                }


                var polyline = new AMap.Polyline({
                    map: mapObj,
                    panel: "panel",
                    path: lineArr,
                    strokeColor: '#00FF00',   // 线颜色
                    strokeOpacity: 0.7,         // 线透明度
                    strokeWeight: 6,          // 线宽
                    strokeStyle: 'solid',     // 线样式
                    strokeDasharray: [10, 5], // 补充线样式
                    geodesic: true,            // 绘制大地线
                    isOutline: true,
                    outlineColor: "#ff8511",
                    showDir: true,
                    lineJoin: 'round'
                });
                mapObj.setFitView();

            }

        } else {


            var map = new AMap.Map('map', {
                resizeEnable: true,
                dragEnable: false,
                zoomEnable: false,
                zoom: 11,
                center: [120.373091, 30.304104]
            });
        }
    } else {
        var map = new AMap.Map('map', {
            resizeEnable: true,
            dragEnable: false,
            zoomEnable: false,
            zoom: 11,
            center: [120.373091, 30.304104]
        });
    }
}
}

function temperature() {


    var scope1 = angular.element($("#temperature")).scope();
    if(scope1) {
        window.clearInterval(temperatureId);
        var test = [];
        if (scope1.tDataY) {
            for (var i = 0; i < scope1.tDataY.length; i++) {
                test.push(scope1.tDataY[i] / 1.0);
            }
        }
        var temratureTotal = scope1.temperatureTotal;
        var tickIntervalSize = 8;
        if (temratureTotal < 40) {
            tickIntervalSize = 8;
        } else {
            tickIntervalSize = parseInt(temratureTotal / 5);
        }

        parseInt(temratureTotal / 40);
        var chart = new Highcharts.Chart('temperature', {
            chart: {
                type: 'line'                         //指定图表的类型，默认是折线图（line）
            },
            title: {
                text: '温度监控显示（℃）'                //指定图表标题
            },
            xAxis: {
                tickInterval: tickIntervalSize,
                categories: scope1.tDataX //指定x轴分组
            },
            yAxis: {
                title: {
                    text: '温度'                //指定y轴的标题
                },
                tickPositions: [-6, 0, 6, 12, 18] // 指定竖轴坐标点的值
            },
            credits: {
                enabled: false
            },
            series: [{                              //指定数据列
                name: '温度',                       //数据列名
                data: test,                  //数据
                zones: [{
                    value: 0.0,
                    color: '#ff0000'
                }, {
                    value: 6.0,
                    color: '#379DF2'
                }, {
                    color: "#ff0000"
                }]
            }]
        });
        var test1 = [];
        if (scope1.dataY) {
            for (var i = 0; i < scope1.dataY.length; i++) {
                test1.push(scope1.dataY[i] / 1.0);
            }
        }
        var chart = new Highcharts.Chart('humidity', {
            chart: {
                type: 'line'                         //指定图表的类型，默认是折线图（line）
            },
            title: {
                text: '湿度监控显示（%）'                //指定图表标题
            },
            xAxis: {
                tickInterval: 8,
                categories: scope1.dataX //指定x轴分组
            },
            yAxis: {
                title: {
                    text: '湿度'                //指定y轴的标题
                }
            },
            credits: {
                enabled: false
            },
            series: [{                              //指定数据列
                name: '湿度',                       //数据列名
                data: test1
            }]
        });
    }
}



function clickMap() {
    mapId = setInterval("map()",300);
    temperatureId = setInterval("temperature()",300);
}
function closeWindow(){
    window.close();
}
