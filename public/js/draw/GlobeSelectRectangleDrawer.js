var GlobeSelectRectangleDrawer = function() {
  this.init.apply(this, arguments)
}

GlobeSelectRectangleDrawer.prototype = {
  viewer: null,
  scene: null,
  clock: null,
  canvas: null,
  camera: null,
  ellipsoid: null,
  tooltip: null,
  entity: null,
  positions: [],
  drawHandler: null,
  modifyHandler: null,
  okHandler: null,
  cancelHandler: null,
  dragIconLight: 'http://222.178.182.14:18090/web/images/circle_red.png',
  material: null,
  outlineMaterial: null,
  fill: true,
  outline: true,
  outlineWidth: 2,
  extrudedHeight: 0,
  toolBarIndex: null,
  layerId: 'globeEntityDrawerLayer',
  vueComponent: null,
  inShapes: {},
  tempShapes:[],
  init: function(viewer) {
    var _this = this
    _this.viewer = viewer
    _this.scene = viewer.scene
    _this.clock = viewer.clock
    _this.canvas = viewer.scene.canvas
    _this.camera = viewer.scene.camera
    _this.ellipsoid = viewer.scene.globe.ellipsoid
    _this.tooltip = new GlobeTooltip(viewer.container)
  },
  clear: function() {
    var _this = this
    if (_this.drawHandler) {
      _this.drawHandler.destroy()
      _this.drawHandler = null
    }
    if (_this.modifyHandler) {
      _this.modifyHandler.destroy()
      _this.modifyHandler = null
    }
    if (_this.toolBarIndex != null) {
      layer.close(_this.toolBarIndex)
    }
    _this._clearMarkers(_this.layerId)
    _this.tooltip.setVisible(false)

    for (let i = 0; i < _this.tempShapes.length; i++) {
      _this.viewer.entities.remove(_this.tempShapes[i]);
    }
  },
  showModifyRectangle: function(positions, okHandler, cancelHandler) {
    var _this = this
    _this.positions = positions
    _this.okHandler = okHandler
    _this.cancelHandler = cancelHandler

    _this._showModifyRegion2Map()
    _this._startModify()
  },
  startDrawSelectRectangle: function(vueComponent, okHandler, cancelHandler) {
    var _this = this
    _this.okHandler = okHandler
    _this.cancelHandler = cancelHandler
    _this.vueComponent = vueComponent
    _this.positions = []
    var floatingPoint = null
    _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas)

    _this.drawHandler.setInputAction(function(event) {
      var position = event.position
      if (!Cesium.defined(position)) {
        return
      }
      var ray = _this.camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = _this.scene.globe.pick(ray, _this.scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      var num = _this.positions.length
      if (num == 0) {
        _this.positions.push(cartesian)
        floatingPoint = _this._createPoint(cartesian, -1)
        _this._showRegion2Map()
      }
      _this.positions.push(cartesian)
      var oid = _this.positions.length - 2
      _this._createPoint(cartesian, oid)
      if (num > 1) {
        _this.positions.pop()
        _this.viewer.entities.remove(floatingPoint)
        _this.tooltip.setVisible(false)
        _this._startModify()
        console.log(draw.shapeDic)
        console.log(draw.shape)
        _this.selectPoints()
      }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    _this.drawHandler.setInputAction(function(event) {
      var position = event.endPosition
      if (!Cesium.defined(position)) {
        return
      }
      if (_this.positions.length < 1) {
        //   _this.tooltip.showAt(position, "<p>选择起点</p>");
        return
      }
      //  _this.tooltip.showAt(position, "<p>选择终点</p>");

      var ray = _this.camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = _this.scene.globe.pick(ray, _this.scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      floatingPoint.position.setValue(cartesian)
      _this.positions.pop()
      _this.positions.push(cartesian)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  },
  _startModify: function() {
    var _this = this
    var isMoving = false
    var pickedAnchor = null
    if (_this.drawHandler) {
      _this.drawHandler.destroy()
      _this.drawHandler = null
    }
    _this._showToolBar()

    _this.modifyHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas)

    _this.modifyHandler.setInputAction(function(event) {
      var position = event.position
      if (!Cesium.defined(position)) {
        return
      }
      var ray = _this.camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = _this.scene.globe.pick(ray, _this.scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      if (isMoving) {
        isMoving = false
        pickedAnchor.position.setValue(cartesian)
        var oid = pickedAnchor.oid
        _this.positions[oid] = cartesian
        _this.tooltip.setVisible(false)
      } else {
        var pickedObject = _this.scene.pick(position)
        if (!Cesium.defined(pickedObject)) {
          return
        }
        if (!Cesium.defined(pickedObject.id)) {
          return
        }
        var entity = pickedObject.id
        if (entity.layerId != _this.layerId || entity.flag != 'anchor') {
          return
        }
        pickedAnchor = entity
        isMoving = true
        //  _this.tooltip.showAt(position, "<p>移动控制点</p>");
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    _this.modifyHandler.setInputAction(function(event) {
      console.log(2)
      if (!isMoving) {
        return
      }
      var position = event.endPosition
      if (!Cesium.defined(position)) {
        return
      }
      //  _this.tooltip.showAt(position, "<p>移动控制点</p>");

      var ray = _this.camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = _this.scene.globe.pick(ray, _this.scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      pickedAnchor.position.setValue(cartesian)
      var oid = pickedAnchor.oid
      _this.positions[oid] = cartesian
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  },
  _createPoint: function(cartesian, oid) {
    var _this = this
    var point = _this.viewer.entities.add({
      position: cartesian,
      billboard: {
        image: _this.dragIconLight,
        eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    point.oid = oid
    point.layerId = _this.layerId
    point.flag = 'anchor'
    return point
  },
  _showRegion2Map: function() {
    var _this = this
    if (_this.material == null) {
      _this.material = Cesium.Color.WHITE.withAlpha(0.1)
    }
    if (_this.outlineMaterial == null) {
      _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
      })
    }
    var dynamicPositions = new Cesium.CallbackProperty(function() {
      if (_this.positions.length > 1) {
        var rect = Cesium.Rectangle.fromCartesianArray(_this.positions)
        return rect
      } else {
        return null
      }
    }, false)
    var outlineDynamicPositions = new Cesium.CallbackProperty(function() {
      if (_this.positions.length > 1) {
        var rect = Cesium.Rectangle.fromCartesianArray(_this.positions)
        var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north]
        var positions = Cesium.Cartesian3.fromRadiansArray(arr)
        return positions
      } else {
        return null
      }
    }, false)
    var bData = {
      rectangle: {
        coordinates: dynamicPositions,
        material: _this.material,
        show: _this.fill
      },
      polyline: {
        positions: outlineDynamicPositions,
        clampToGround: true,
        width: _this.outlineWidth,
        material: _this.outlineMaterial,
        show: _this.outline
      }
    }
    if (_this.extrudedHeight > 0) {
      bData.rectangle.extrudedHeight = _this.extrudedHeight
      bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
      bData.rectangle.closeTop = true
      bData.rectangle.closeBottom = true
      bData.rectangle.outline = false
      bData.rectangle.outlineWidth = 0
    }
    _this.entity = _this.viewer.entities.add(bData)
    _this.entity.layerId = _this.layerId
  },
  _showModifyRegion2Map: function() {
    var _this = this
    if (_this.material == null) {
      _this.material = Cesium.Color.WHITE.withAlpha(0.1)
    }
    if (_this.outlineMaterial == null) {
      _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
      })
    }
    var dynamicPositions = new Cesium.CallbackProperty(function() {
      if (_this.positions.length > 1) {
        var rect = Cesium.Rectangle.fromCartesianArray(_this.positions)
        return rect
      } else {
        return null
      }
    }, false)
    var outlineDynamicPositions = new Cesium.CallbackProperty(function() {
      if (_this.positions.length > 1) {
        var rect = Cesium.Rectangle.fromCartesianArray(_this.positions)
        var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north]
        var positions = Cesium.Cartesian3.fromRadiansArray(arr)
        return positions
      } else {
        return null
      }
    }, false)
    var bData = {
      rectangle: {
        coordinates: dynamicPositions,
        material: _this.material,
        show: _this.fill
      },
      polyline: {
        positions: outlineDynamicPositions,
        clampToGround: true,
        width: _this.outlineWidth,
        material: _this.outlineMaterial,
        show: _this.outline
      }
    }
    if (_this.extrudedHeight > 0) {
      bData.rectangle.extrudedHeight = _this.extrudedHeight
      bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
      bData.rectangle.closeTop = true
      bData.rectangle.closeBottom = true
      bData.rectangle.outline = false
      bData.rectangle.outlineWidth = 0
    }
    _this.entity = _this.viewer.entities.add(bData)
    _this.entity.layerId = _this.layerId
    var positions = _this.positions
    for (var i = 0; i < positions.length; i++) {
      _this._createPoint(positions[i], i)
    }
  },
  _computeRectangle: function(p1, p2) {
    var _this = this
    var c1 = _this.ellipsoid.cartesianToCartographic(p1)
    var c2 = _this.ellipsoid.cartesianToCartographic(p2)
    var rect = Cesium.Rectangle.fromCartesianArray([p1, p2])
    return rect
  },
  _showToolBar: function() {
    var _this = this
    _this._createToolBar()
    // var width = $(window).width();
    // var wTop = 60;
    // var wLeft = parseInt((width - 145) / 2);
    // _this.toolBarIndex = layer.open({
    //     title: false,
    //     type: 1,
    //     fixed: true,
    //     resize: false,
    //     shade: 0,
    //     content: $("#shapeEditContainer"),
    //     offset: [wTop + "px", wLeft + "px"],
    //     move: "#shapeEditRTCorner"
    // });
    // var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
    // $(cssSel).hide();
  },
  _createToolBar: function() {
    var _this = this
    // var objs = $("#shapeEditContainer");
    // objs.remove();
    // var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
    //          + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal">  确定 </button>'
    //          + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger">  取消 </button>'
    //          + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
    //          + '    </div>'
    //          + '</div>';
    // $("body").append(html);
    // var btnOK = $("#shapeEditContainer button[name='btnOK']");
    // var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
    // btnOK.unbind("click").bind("click", function () {
    //     _this.clear();
    //     layer.close(_this.toolBarIndex);
    //     if (_this.okHandler) {
    //         _this.okHandler(_this.positions);
    //     }
    // });
    // btnCancel.unbind("click").bind("click", function () {
    //     _this.clear();
    //     layer.close(_this.toolBarIndex);
    //     if (_this.cancelHandler) {
    //         _this.cancelHandler();
    //     }
    // });

    _this.vueComponent.$prompt('请输入高度', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[0-9]*$/,
      inputErrorMessage: '请输入数字'
    }).then(({ value }) => {
      _this.clear()
      if (_this.okHandler) {
        _this.okHandler(_this.vueComponent, _this.positions)
        _this.setHeight(Number(value))
      }
    }).catch(() => {
      _this.clear()
    })

  },
  _isSimpleXYZ: function(p1, p2) {
    if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
      return true
    }
    return false
  },
  _clearMarkers: function(layerName) {
    var _this = this
    var viewer = _this.viewer
    var entityList = viewer.entities.values
    if (entityList == null || entityList.length < 1)
      return
    for (var i = 0; i < entityList.length; i++) {
      var entity = entityList[i]
      if (entity.layerId == layerName) {
        viewer.entities.remove(entity)
        i--
      }
    }
  },
  selectPoints() {
    let _this = this
    var a = new Cesium.JulianDate()
    for (let i = 0; i < draw.shape.length; i++) {
      let r = draw.shape[i].polygon.hierarchy.getValue().positions
      _this.inShapes[i] = {}
      _this.inShapes[i].entity = draw.shape[i]
      _this.inShapes[i].coord = {}
      for (let j = 0; j < r.length; j++) {
        // 判断是否在区域内部 true在内部
        let v = Cesium.Rectangle.contains(_this.entity.rectangle.coordinates.getValue(a), Cesium.Cartographic.fromCartesian(r[j]))
        console.log(v)
        if (!v) {
          continue
        }
        let point = _this.viewer.entities.add({
          position: r[j],
          billboard: {
            image: './img/point.png',
            eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        })
        _this.tempShapes.push(point)
        _this.inShapes[i].coord[j] = r[j]
      }
    }
    console.log(_this.inShapes)
  },
  setHeight(height) {
    let _this = this
    for (const inShapesKey in _this.inShapes) {
      let entity = _this.inShapes[inShapesKey].entity
      for (const coordKey in _this.inShapes[inShapesKey].coord) {
        let cartesian = _this.inShapes[inShapesKey].coord[coordKey]
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        var lon = Cesium.Math.toDegrees(cartographic.longitude)
        var lat = Cesium.Math.toDegrees(cartographic.latitude)
        let newCartPoint = Cesium.Cartesian3.fromDegrees(lon, lat, height)
        console.log(newCartPoint)
        let originPositions = entity.polygon.hierarchy.getValue().positions
        originPositions.splice(Number(coordKey), 1, newCartPoint)
        entity.polygon.hierarchy = new Cesium.PolygonHierarchy(originPositions)
        console.log(entity.polygon.hierarchy.getValue().positions)
      }
    }
  },
  CLASS_NAME: 'GlobeRectangleDrawer'
}
