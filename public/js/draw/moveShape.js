var GlobeMoveShape = function () {
    this.init.apply(this, arguments);
};

GlobeMoveShape.prototype = {
    viewer: null,
    scene: null,
    clock: null,
    canvas: null,
    camera: null,
    ellipsoid: null,
    tooltip: null,
    entity: null,
    positions: [],
    tempPositions: [],
    drawHandler: null,
    modifyHandler: null,
    okHandler: null,
    cancelHandler: null,
    material: null,
    outlineMaterial: null,
    fill: true,
    outline: true,
    outlineWidth: 2,
    extrudedHeight: 0,
    toolBarIndex: null,
    markers: {},
    moveHandler: null,
    pickedEntity: null,
    layerId: "globeDrawerLayer",
    init: function (viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        _this.tooltip = new GlobeTooltip(viewer.container);
    },
    clear: function () {
        var _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        if (_this.toolBarIndex != null) {
            layer.close(_this.toolBarIndex);
        }
        // _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);
    },
    showMoveShape: function (positions, pickedEntity, okHandler, cancelHandler) {
        var _this = this;
        _this.positions = positions;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        // _this._showToolBar();
        _this._startMovePolygon();
        _this.pickedEntity = pickedEntity;
    },
    startMoveShape: function (okHandler, cancelHandler) {
        var _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        //进入编辑状态
        _this.clear();
    },
    _startMovePolygon: function () {
        var _this = this;
        _this._showToolBar();
        var objId = (new Date()).getTime();
        // flag = 0;
        var leftDownFlag = false;
        var pointDraged = null;
        // var handler;
        var startPoint;
        // 保存线，多边形，矩形坐标
        var polylinePreviousCoordinates = {};
        var polygonPreviousCoordinates = {};
        var rectanglePreviousCoordinates = {};
        var ellipsePreviousCoordinates = {};
        var pointPreviousCoordinates = {};
        var StraightArrowCoordinates = {};
        var rectanglePosition = {};
        // 临时存储点坐标
        var rectanglePoint = [];
        let currentsPoint = [];
        var saveCurrentsPoint = [];
        var saveRectangle = [];
        var obj;

        _this.moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        _this.moveHandler.setInputAction(function (movement) {
            // pointDraged = viewer.scene.pick(movement.position); //选取当前的entity 
            pointDraged = _this.pickedEntity;
            var pick = viewer.scene.pick(movement.position);
            if (!pointDraged) {
                return;
            }
            if (!pick) {
                return;
            }
            if (pick.id.objId != pointDraged.id.objId) {
                return;
            }
            obj = pointDraged.id;
            objId = obj.objId;
            leftDownFlag = true;
            if (pointDraged) {
                currentsPoint = []
                //记录按下去的坐标
                startPoint = viewer.scene.pickPosition(movement.position);
                viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
                if (pointDraged.id.shapeType == "StraightArrow") {
                    StraightArrowCoordinates = pointDraged.id.polygon.hierarchy.getValue();
                } else { // 放在else里面是因为写的是“pointDraged.id.polyline”，应该像上面一样写shapeType，如果改成shapeType就可以放出来
                    if (pointDraged.id.billboard) {
                        pointPreviousCoordinates = pointDraged.id.position.getValue();
                    }
                    if (pointDraged.id.polyline) {
                        polylinePreviousCoordinates = pointDraged.id.polyline.positions.getValue();
                    }
                    if (pointDraged.id.polygon) {
                        polygonPreviousCoordinates = pointDraged.id.polygon.hierarchy.getValue();
                    }
                    if (pointDraged.id.rectangle) {
                        rectanglePreviousCoordinates = pointDraged.id.rectangle.coordinates.getValue();
                        rectanglePosition = pointDraged.id.rectanglePosition;
                    }
                    if (pointDraged.id.ellipse) {
                        ellipsePreviousCoordinates = pointDraged.id.circlePosition;
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        _this.moveHandler.setInputAction(function (movement) {
            let startPosition = viewer.scene.pickPosition(movement.startPosition);
            let endPosition = viewer.scene.pickPosition(movement.endPosition);
            if (startPosition && endPosition) {
                if (Cesium.defined(currentsPoint)) {
                    //计算每次的偏差
                    let changed_x = endPosition.x - startPosition.x;
                    let changed_y = endPosition.y - startPosition.y;
                    let changed_z = endPosition.z - startPosition.z;
                    if (pointDraged) {
                        if (pointDraged.id.shapeType == "StraightArrow") {
                            for (let i = 0; i < StraightArrowCoordinates.positions.length; i++) {
                                StraightArrowCoordinates.positions[i].x = StraightArrowCoordinates.positions[i].x + changed_x;
                                StraightArrowCoordinates.positions[i].y = StraightArrowCoordinates.positions[i].y + changed_y;
                                StraightArrowCoordinates.positions[i].z = StraightArrowCoordinates.positions[i].z + changed_z;
                                currentsPoint.push(StraightArrowCoordinates.positions[i])
                            }
                            saveCurrentsPoint = currentsPoint;
                            obj.polygon.hierarchy = new Cesium.CallbackProperty(function () {
                                return new Cesium.PolygonHierarchy(saveCurrentsPoint);
                            }, false);
                            obj.polyline.positions = new Cesium.CallbackProperty(function () {
                                return saveCurrentsPoint;
                            }, false);
                        } else {
                            if (pointDraged.id.billboard) {
                                currentsPoint = [];
                                obj.position = new Cesium.CallbackProperty(function () {
                                    return endPosition;
                                }, false);
                                shapeDic[objId] = endPosition;
                            }
                            if (pointDraged.id.polyline) {
                                currentsPoint = [];
                                for (let i = 0; i < polylinePreviousCoordinates.length; i++) {
                                    //与之前的算差 替换掉
                                    polylinePreviousCoordinates[i].x = polylinePreviousCoordinates[i].x + changed_x;
                                    polylinePreviousCoordinates[i].y = polylinePreviousCoordinates[i].y + changed_y;
                                    polylinePreviousCoordinates[i].z = polylinePreviousCoordinates[i].z + changed_z;
                                    currentsPoint.push(polylinePreviousCoordinates[i])
                                }
                                saveCurrentsPoint = currentsPoint;
                                obj.polyline.positions = new Cesium.CallbackProperty(function () {
                                    return saveCurrentsPoint;
                                }, false);
                            }
                            if (polygonPreviousCoordinates.positions) {
                                currentsPoint = []
                                if (pointDraged.id.polygon) {
                                    for (let i = 0; i < polygonPreviousCoordinates.positions.length; i++) {
                                        polygonPreviousCoordinates.positions[i].x = polygonPreviousCoordinates.positions[i].x + changed_x;
                                        polygonPreviousCoordinates.positions[i].y = polygonPreviousCoordinates.positions[i].y + changed_y;
                                        polygonPreviousCoordinates.positions[i].z = polygonPreviousCoordinates.positions[i].z + changed_z;
                                        currentsPoint.push(polygonPreviousCoordinates.positions[i])
                                    }
                                    saveCurrentsPoint = currentsPoint;
                                    obj.polygon.hierarchy = new Cesium.CallbackProperty(function () {
                                        return new Cesium.PolygonHierarchy(saveCurrentsPoint);
                                    }, false);
                                }
                            }
                            if (pointDraged.id.rectangle) {
                                let storePoint = {};
                                rectanglePoint = []
                                let position_start = startPosition;
                                let cartographic_start = Cesium.Cartographic.fromCartesian(position_start);
                                let longitude_start = Cesium.Math.toDegrees(cartographic_start.longitude);
                                let latitude_start = Cesium.Math.toDegrees(cartographic_start.latitude);
                                let height_start = cartographic_start.height;

                                let position_end = endPosition;
                                let cartographic_end = Cesium.Cartographic.fromCartesian(position_end);
                                let longitude_end = Cesium.Math.toDegrees(cartographic_end.longitude);
                                let latitude_end = Cesium.Math.toDegrees(cartographic_end.latitude);
                                let height_end = cartographic_end.height;
                                let changer_lng = longitude_end - longitude_start;
                                let changer_lat = latitude_end - latitude_start;
                                rectanglePreviousCoordinates.west = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.west) +
                                    changer_lng);
                                rectanglePreviousCoordinates.east = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.east) +
                                    changer_lng);
                                rectanglePreviousCoordinates.south = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.south) +
                                    changer_lat);
                                rectanglePreviousCoordinates.north = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.north) +
                                    changer_lat);
                                storePoint = rectanglePreviousCoordinates;
                                saveRectangle = storePoint
                                obj.rectangle.coordinates = new Cesium.CallbackProperty(function () {
                                    return saveRectangle;
                                }, false);
                                for (let i = 0; i < rectanglePosition.length; i++) {
                                    //与之前的算差 替换掉
                                    rectanglePosition[i].x = rectanglePosition[i].x + changed_x;
                                    rectanglePosition[i].y = rectanglePosition[i].y + changed_y;
                                    rectanglePosition[i].z = rectanglePosition[i].z + changed_z;
                                    rectanglePoint.push(rectanglePosition[i])
                                }
                                obj.rectanglePosition = rectanglePoint
                                shapeDic[objId] = rectanglePoint;
                            }
                            if (pointDraged.id.ellipse) {
                                saveId = objId;
                                currentsPoint = []
                                for (let i = 0; i < ellipsePreviousCoordinates.length; i++) {
                                    //与之前的算差 替换掉
                                    ellipsePreviousCoordinates[i].x = ellipsePreviousCoordinates[i].x + changed_x;
                                    ellipsePreviousCoordinates[i].y = ellipsePreviousCoordinates[i].y + changed_y;
                                    ellipsePreviousCoordinates[i].z = ellipsePreviousCoordinates[i].z + changed_z;
                                    currentsPoint.push(ellipsePreviousCoordinates[i])
                                }
                                saveCurrentsPoint = currentsPoint;
                                obj.position = new Cesium.CallbackProperty(function () {
                                    return saveCurrentsPoint[0]
                                }, false)
                            }
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        _this.moveHandler.setInputAction(function (movement) {
            viewer.scene.screenSpaceCameraController.enableRotate = true; //解锁相机
            currentsPoint = undefined
            // moveHandler.destroy()
        }, Cesium.ScreenSpaceEventType.LEFT_UP)
    },
    _showToolBar: function () {
        var _this = this;
        _this._createToolBar();
        var width = $(window).width();
        var wTop = 60;
        var wLeft = parseInt((width - 145) / 2);
        _this.toolBarIndex = layer.open({
            title: false,
            type: 1,
            fixed: true,
            resize: false,
            shade: 0,
            content: $("#shapeEditContainer"),
            offset: [wTop + "px", wLeft + "px"],
            move: "#shapeEditRTCorner"
        });
        var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    },
    _createToolBar: function () {
        var _this = this;
        var objs = $("#shapeEditContainer");
        objs.remove();
        var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">' +
            '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>' +
            '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>' +
            '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">' +
            '    </div>' +
            '</div>';
        $("body").append(html);

        var btnOK = $("#shapeEditContainer button[name='btnOK']");
        var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        btnOK.unbind("click").bind("click", function () {
            layer.close(_this.toolBarIndex);
            // function a(callback) {
            _this.moveHandler.destroy();
            if (_this.okHandler) {
                var positions = [];
                for (var i = 0; i < _this.tempPositions.length; i += 2) {
                    var p = _this.tempPositions[i];
                    positions.push(p);
                }
                _this.positions = positions;
                _this.okHandler(positions);
                _this.clear();
            }
            //     callback()
            // }
            // a(_this.clear())
            // //  _this.clear();
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.cancelHandler) {
                _this.cancelHandler();
            }
        });
    },
    CLASS_NAME: "GlobePolygonDrawer"
};