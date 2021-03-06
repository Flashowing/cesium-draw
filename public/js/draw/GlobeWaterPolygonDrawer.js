var GlobeWaterPolygonDrawer = function() {
  this.init.apply(this, arguments)
}

GlobeWaterPolygonDrawer.prototype = {
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
  dragIcon: '../img/circle_red.png',
  dragIconLight: '../img/circle_red.png',
  material: null,
  outlineMaterial: null,
  fill: true,
  outline: true,
  outlineWidth: 2,
  extrudedHeight: 0,
  toolBarIndex: null,
  markers: {},
  layerId: 'globeDrawerLayer',
  vueComponent: null,
  init: function(viewer) {
    var _this = this
    _this.viewer = viewer
    _this.scene = viewer.scene
    _this.clock = viewer.clock
    _this.canvas = viewer.scene.canvas
    _this.camera = viewer.scene.camera
    _this.ellipsoid = viewer.scene.globe.ellipsoid
    _this.tooltip = new GlobeTooltip(_this.viewer.container)
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
  },
  showModifyWater: function(positions, okHandler, cancelHandler) {
    var _this = this
    _this.positions = positions
    _this.okHandler = okHandler
    _this.cancelHandler = cancelHandler
    _this._showModifyRegion2Map()
  },
  startDrawWater: function(vueComponent, okHandler, cancelHandler) {
    var _this = this
    _this.okHandler = okHandler
    _this.cancelHandler = cancelHandler
    _this.vueComponent = vueComponent
    _this.positions = []
    var floatingPoint = null
    _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas)

    _this.drawHandler.setInputAction(function(event) {
      // _this.viewer.scene.screenSpaceCameraController.enableRotate = false //????????????
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
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      var lon = Cesium.Math.toDegrees(cartographic.longitude)
      var lat = Cesium.Math.toDegrees(cartographic.latitude)
      var elev = _viewer.scene.globe.getHeight(cartographic)
      let newCartesian = Cesium.Cartesian3.fromDegrees(lon, lat, elev)
      var num = _this.positions.length

      if (num == 0) {
        _this.positions.push(newCartesian)
        floatingPoint = _this._createPoint(newCartesian, -1)
        _this._showRegion2Map()
      }

      _this.positions.push(newCartesian)
      var oid = _this.positions.length - 2
      _this._createPoint(newCartesian, oid)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    _this.drawHandler.setInputAction(function(event) {
      var position = event.endPosition
      if (!Cesium.defined(position)) {
        return
      }
      if (_this.positions.length < 1) {
        // _this.tooltip.showAt(position, "<p>????????????</p>");

        return
      }
      var num = _this.positions.length
      // var tip = "<p>????????????????????????</p>";
      if (num > 3) {
        // tip += "<p>??????????????????</p>";
        // layer.msg("??????????????????")
      }
      //_this.tooltip.showAt(position, tip);
      var ray = _this.camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = _this.scene.globe.pick(ray, _this.scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      var lon = Cesium.Math.toDegrees(cartographic.longitude)
      var lat = Cesium.Math.toDegrees(cartographic.latitude)
      var elev = _viewer.scene.globe.getHeight(cartographic)
      let newCartesian = Cesium.Cartesian3.fromDegrees(lon, lat, elev)
      floatingPoint.position.setValue(newCartesian)
      _this.positions.pop()
      _this.positions.push(newCartesian)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    _this.drawHandler.setInputAction(function(movement) {
      // _this.viewer.scene.screenSpaceCameraController.enableRotate = true //????????????
      if (_this.positions.length < 4) {
        return
      }
      _this.positions.pop()
      _this.viewer.entities.remove(floatingPoint)
      _this.tooltip.setVisible(false)

      //??????????????????
      _this.clear()
      _this._showModifyRegion2Map()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  },
  _startMovePolygon: function() {
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
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      var lon = Cesium.Math.toDegrees(cartographic.longitude)
      var lat = Cesium.Math.toDegrees(cartographic.latitude)
      var elev = _viewer.scene.globe.getHeight(cartographic)
      let newCartesian = Cesium.Cartesian3.fromDegrees(lon, lat, elev)
      if (isMoving) {
        isMoving = false
        pickedAnchor.position.setValue(newCartesian)
        var oid = pickedAnchor.oid
        _this.tempPositions[oid] = newCartesian
        _this.tooltip.setVisible(false)
        if (pickedAnchor.flag == 'mid_anchor') {
          _this._updateModifyAnchors(oid)
        }
      } else {
        var pickedObject = _this.scene.pick(position)
        if (!Cesium.defined(pickedObject)) {
          return
        }
        if (!Cesium.defined(pickedObject.id)) {
          return
        }
        var entity = pickedObject.id
        if (entity.layerId != _this.layerId) {
          return
        }
        if (entity.flag != 'anchor' && entity.flag != 'mid_anchor') {
          return
        }
        pickedAnchor = entity
        isMoving = true
        if (entity.flag == 'anchor') {
          // _this.tooltip.showAt(position, "<p>???????????????</p>");
        }
        if (entity.flag == 'mid_anchor') {
          // _this.tooltip.showAt(position, "<p>???????????????????????????</p>");
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    _this.modifyHandler.setInputAction(function(event) {
      if (!isMoving) {
        return
      }
      var position = event.endPosition
      if (!Cesium.defined(position)) {
        return
      }
      //  _this.tooltip.showAt(position, "<p>???????????????</p>");

      var ray = _this.camera.getPickRay(position)
      if (!Cesium.defined(ray)) {
        return
      }
      var cartesian = _this.scene.globe.pick(ray, _this.scene)
      if (!Cesium.defined(cartesian)) {
        return
      }
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      var lon = Cesium.Math.toDegrees(cartographic.longitude)
      var lat = Cesium.Math.toDegrees(cartographic.latitude)
      var elev = _viewer.scene.globe.getHeight(cartographic)
      let newCartesian = Cesium.Cartesian3.fromDegrees(lon, lat, elev)
      var oid = pickedAnchor.oid
      if (pickedAnchor.flag == 'anchor') {
        pickedAnchor.position.setValue(newCartesian)
        _this.tempPositions[oid] = newCartesian
        //??????????????????
        _this._updateNewMidAnchors(oid)
      } else if (pickedAnchor.flag == 'mid_anchor') {
        pickedAnchor.position.setValue(newCartesian)
        _this.tempPositions[oid] = newCartesian
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  },
  _showRegion2Map: function() {
    var _this = this
    if (_this.material == null) {
      // ?????????
      _this.material = Cesium.Color.fromCssColorString('#0a6bb5').withAlpha(0.5)
      //_this.material = getColor(viewModel.color, viewModel.alpha),
    }
    if (_this.outlineMaterial == null) {
      _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
      })
    }
    var dynamicHierarchy = new Cesium.CallbackProperty(function() {
      if (_this.positions.length > 2) {
        var pHierarchy = new Cesium.PolygonHierarchy(_this.positions)
        return pHierarchy
      } else {
        return null
      }
    }, false)
    var outlineDynamicPositions = new Cesium.CallbackProperty(function() {
      if (_this.positions.length > 1) {
        var arr = [].concat(_this.positions)
        var first = _this.positions[0]
        arr.push(first)
        return arr
      } else {
        return null
      }
    }, false)
    var bData = {
      polygon: new Cesium.PolygonGraphics({
        hierarchy: dynamicHierarchy,
        material: _this.material,
        show: _this.fill
      }),
      polyline: {
        positions: outlineDynamicPositions,
        clampToGround: true,
        width: _this.outlineWidth,
        material: _this.outlineMaterial,
        show: _this.outline
      }
    }
    if (_this.extrudedHeight > 0) {
      bData.polygon.extrudedHeight = _this.extrudedHeight
      bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
      bData.polygon.closeTop = true
      bData.polygon.closeBottom = true
    }
    bData.polygon.extrudedHeight = 0
    bData.polygon.perPositionHeight = true
    _this.entity = _this.viewer.entities.add(bData)
    _this.entity.layerId = _this.layerId
  },
  _showModifyRegion2Map: function() {
    var _this = this

    _this._startModify()
    _this._computeTempPositions()

    var dynamicHierarchy = new Cesium.CallbackProperty(function() {
      if (_this.positions.length > 2) {
        var pHierarchy = new Cesium.PolygonHierarchy(_this.tempPositions)
        return pHierarchy
      } else {
        return null
      }
    }, false)
    var outlineDynamicPositions = new Cesium.CallbackProperty(function() {
      if (_this.tempPositions.length > 1) {
        var arr = [].concat(_this.tempPositions)
        var first = _this.tempPositions[0]
        arr.push(first)
        return arr
      } else {
        return null
      }
    }, false)
    if (_this.material == null) {
      _this.material = Cesium.Color.fromCssColorString('#0a6bb5').withAlpha(0.5)
    }
    if (_this.outlineMaterial == null) {
      _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
        dashLength: 16,
        color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
      })
    }
    var bData = {
      polygon: new Cesium.PolygonGraphics({
        hierarchy: dynamicHierarchy,
        material: _this.material,
        show: _this.fill
      }),
      polyline: {
        positions: outlineDynamicPositions,
        clampToGround: true,
        width: _this.outlineWidth,
        material: _this.outlineMaterial,
        show: _this.outline
      }
    }
    if (_this.extrudedHeight > 0) {
      bData.polygon.extrudedHeight = _this.extrudedHeight
      bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
      bData.polygon.closeTop = true
      bData.polygon.closeBottom = true
    }
    bData.polygon.extrudedHeight = 0
    bData.polygon.perPositionHeight = true
    _this.entity = _this.viewer.entities.add(bData)
    _this.entity.layerId = _this.layerId
    var positions = _this.tempPositions
    for (var i = 0; i < positions.length; i++) {
      var ys = i % 2
      if (ys == 0) {
        _this._createPoint(positions[i], i)
      } else {
        _this._createMidPoint(positions[i], i)
      }
    }
  },
  _updateModifyAnchors: function(oid) {
    var _this = this

    //????????????tempPositions
    var p = _this.tempPositions[oid]
    var p1 = null
    var p2 = null
    var num = _this.tempPositions.length
    if (oid == 0) {
      p1 = _this.tempPositions[num - 1]
      p2 = _this.tempPositions[oid + 1]
    } else if (oid == num - 1) {
      p1 = _this.tempPositions[oid - 1]
      p2 = _this.tempPositions[0]
    } else {
      p1 = _this.tempPositions[oid - 1]
      p2 = _this.tempPositions[oid + 1]
    }
    //????????????
    var cp1 = _this._computeCenterPotition(p1, p)
    var cp2 = _this._computeCenterPotition(p, p2)

    //?????????
    var arr = [cp1, p, cp2]
    _this.tempPositions.splice(oid, 1, cp1, p, cp2)

    //??????????????????
    _this._clearAnchors(_this.layerId)
    var positions = _this.tempPositions
    for (var i = 0; i < positions.length; i++) {
      var ys = i % 2
      if (ys == 0) {
        _this._createPoint(positions[i], i)
      } else {
        _this._createMidPoint(positions[i], i)
      }
    }
  },
  _updateNewMidAnchors: function(oid) {
    var _this = this
    if (oid == null || oid == undefined) {
      return
    }
    //?????????????????????oid2??????????????????
    var oid1 = null
    var oid2 = null

    //?????????????????????oid3??????????????????
    var oid3 = null
    var oid4 = null
    var num = _this.tempPositions.length
    if (oid == 0) {
      oid1 = num - 2
      oid2 = num - 1
      oid3 = oid + 1
      oid4 = oid + 2
    } else if (oid == num - 2) {
      oid1 = oid - 2
      oid2 = oid - 1
      oid3 = num - 1
      oid4 = 0
    } else {
      oid1 = oid - 2
      oid2 = oid - 1
      oid3 = oid + 1
      oid4 = oid + 2
    }

    var c1 = _this.tempPositions[oid1]
    var c = _this.tempPositions[oid]
    var c4 = _this.tempPositions[oid4]

    var c2 = _this._computeCenterPotition(c1, c)
    var c3 = _this._computeCenterPotition(c4, c)

    _this.tempPositions[oid2] = c2
    _this.tempPositions[oid3] = c3

    _this.markers[oid2].position.setValue(c2)
    _this.markers[oid3].position.setValue(c3)
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
    _this.markers[oid] = point
    return point
  },
  _createMidPoint: function(cartesian, oid) {
    var _this = this
    var point = _this.viewer.entities.add({
      position: cartesian,
      billboard: {
        image: _this.dragIcon,
        eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    point.oid = oid
    point.layerId = _this.layerId
    point.flag = 'mid_anchor'
    _this.markers[oid] = point
    return point
  },
  _computeTempPositions: function() {
    var _this = this

    var pnts = [].concat(_this.positions)
    var num = pnts.length
    var first = pnts[0]
    var last = pnts[num - 1]
    if (_this._isSimpleXYZ(first, last) == false) {
      pnts.push(first)
      num += 1
    }
    _this.tempPositions = []
    for (var i = 1; i < num; i++) {
      var p1 = pnts[i - 1]
      var p2 = pnts[i]
      var cp = _this._computeCenterPotition(p1, p2)
      _this.tempPositions.push(p1)
      _this.tempPositions.push(cp)
    }
  },
  _computeCenterPotition: function(p1, p2) {
    var _this = this
    var c1 = _this.ellipsoid.cartesianToCartographic(p1)
    var c2 = _this.ellipsoid.cartesianToCartographic(p2)
    var cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5)
    // ????????????
    let hi = _this.viewer.scene.globe.getHeight(cm)
    cm.height = hi;
    var cp = _this.ellipsoid.cartographicToCartesian(cm)
    return cp
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
    // var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">' +
    //     '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> ?????? </button>' +
    //     '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> ?????? </button>' +
    //     '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">' +
    //     '    </div>' +
    //     '</div>';
    // $("body").append(html);
    //
    // var btnOK = $("#shapeEditContainer button[name='btnOK']");
    // var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
    // btnOK.unbind("click").bind("click", function () {
    //     layer.close(_this.toolBarIndex);
    //     // function a(callback) {
    //     if (_this.okHandler) {
    //         var positions = [];
    //         for (var i = 0; i < _this.tempPositions.length; i += 2) {
    //             var p = _this.tempPositions[i];
    //             positions.push(p);
    //         }
    //         _this.positions = positions;
    //         _this.okHandler(positions);
    //         _this.clear();
    //     }
    //     //     callback()
    //     // }
    //     // a(_this.clear())
    //     // //  _this.clear();
    // });
    // btnCancel.unbind("click").bind("click", function () {
    //     _this.clear();
    //     layer.close(_this.toolBarIndex);
    //     if (_this.cancelHandler) {
    //         _this.cancelHandler();
    //     }
    // });


    // _this.vueComponent.$confirm('', '', {
    //   confirmButtonText: '??????',
    //   cancelButtonText: '??????',
    //   center: true
    // }).then(() => {
    //   if (_this.okHandler) {
    //     var positions = []
    //     for (var i = 0; i < _this.tempPositions.length; i += 2) {
    //       var p = _this.tempPositions[i]
    //       positions.push(p)
    //     }
    //     _this.positions = positions
    //     _this.okHandler(_this.vueComponent, positions)
    //     _this.clear()
    //   }
    // }).catch(() => {
    //   _this.clear()
    // })

    let html = `<div style='position: absolute;left: 400px;top: 100px'>
  <button id='btnOK'>??????</button><button id='btnCancel'>??????</button>
</div>`
    document.getElementById('alert').innerHTML = html;
    document.getElementById('btnOK').addEventListener('click',function(){
        if (_this.okHandler) {
          var positions = []
          for (var i = 0; i < _this.tempPositions.length; i += 2) {
            var p = _this.tempPositions[i]
            positions.push(p)
          }
          _this.positions = positions
          _this.okHandler(_this.vueComponent, positions)
          _this.clear()
        }
      document.getElementById('alert').innerHTML = "";
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
  _clearAnchors: function() {
    var _this = this
    for (var key in _this.markers) {
      var m = _this.markers[key]
      _this.viewer.entities.remove(m)
    }
    _this.markers = {}
  },
  CLASS_NAME: 'GlobePolygonDrawer'
}
