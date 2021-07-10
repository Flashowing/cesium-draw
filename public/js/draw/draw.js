const draw = {
  shape: [], // 封装所有的实体
  layerId: "globeDrawerDemoLayer", //图层名称
  shapeDic: {}, //全局变量，用来记录shape坐标信息
  flag: 0, //编辑或删除标识,1为编辑，2为删除

}
var drawShape = function() {
  this.init.apply(this, arguments)
}
drawShape.prototype = {
  viewer: null,
  init: function(viewer) {
    var _this = this
    _this.viewer = viewer
  },
  initDrawHelper: function() {
    var _this = this
    $('#editShape').click(function() {
      //  layer.msg("点击要编辑的箭头！");
      draw.flag = 1
      //清除标绘状态
      object.tracker.clear()
    })
    $('#deleteShape').click(function() {
      //   layer.msg("点击要删除的箭头！");
      draw.flag = 2
      //清除标绘状态
      object.tracker.clear()
    })
    $('#drawPoint').click(function() {
      draw.flag = 0
      object.tracker.trackPoint(function(position) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = position
        _this.showPoint(objId, position)
      })
    })
    $('#drawLine').click(function() {
      draw.flag = 0
      object.tracker.trackPolyline(function(positions) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        _this.showPolyline(objId, positions)
      })
    })
    $('#drawPolygon').click(function() {
      draw.flag = 0
      object.tracker.trackPolygon(function(vueComponent, positions) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        _this.showPolygon(objId, positions)
      })
    })
    $('#drawRectangle').click(function() {
      draw.flag = 0
      object.tracker.trackRectangle(function(positions) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        _this.showRectangle(objId, positions)
      })
    })
    $('#drawCircle').click(function() {
      draw.flag = 0
      object.tracker.trackCircle(function(positions) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        _this.showCircle(objId, positions)
      })
    })
    $('#mouse').click(function() {
      object.tracker.pointDrawer.remove()
    })
    $('#drawBufferLine').click(function() {
      draw.flag = 0
      object.tracker.trackBufferLine(function(positions, radius) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = {
          positions: positions,
          radius: radius
        }
        _this.showBufferLine(objId, positions, radius)
      })
    })
    $('#drawPlotPincer').click(function() {
      draw.flag = 0
      object.tracker.trackPincerArrow(function(positions, custom) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = {
          custom: custom,
          positions: positions
        }
        _this.showPincerArrow(objId, positions)
      })
    })
    $('#drawAlotAttack').click(function() {
      draw.flag = 0
      object.tracker.trackAttackArrow(function(positions, custom) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = {
          custom: custom,
          positions: positions
        }
        _this.showAttackArrow(objId, positions)
      })
    })
    $('#drawPlotStraight').click(function() {
      draw.flag = 0
      object.tracker.trackStraightArrow(function(positions) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        _this.showStraightArrow(objId, positions)
      })
    })
  },
  bindGloveEvent: function() {
    var _this = this
    var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    handler.setInputAction(function(movement) {
      var pick = _this.viewer.scene.pick(movement.position)
      if (!pick) {
        return
      }
      var obj = pick.id
      if (!obj || !obj.layerId || draw.flag == 0) {
        return
      }
      var objId = obj.objId
      //flag为编辑或删除标识,1为编辑，2为删除
      if (draw.flag == 1) {
        switch (obj.shapeType) {
          case 'Polygon':
            draw.flag = 0
            _this.editPolygon(objId)
            break
          case 'Water':
            draw.flag = 0
            _this.editWater(objId)
            break
          case 'Polyline':
            draw.flag = 0
            _this.editPolyline(objId)
            break
          case 'Rectangle':
            draw.flag = 0
            _this.editRectangle(objId)
            break
          case 'Circle':
            draw.flag = 0
            _this.editCircle(objId)
            break
          case 'Point':
            draw.flag = 0
            _this.editPoint(objId)
            break
          case 'BufferLine':
            draw.flag = 0
            _this.editBufferLine(objId)
            break
          case 'StraightArrow':
            flag = 0
            _this.editStraightArrow(objId)
            break
          case 'AttackArrow':
            flag = 0
            _this.editAttackArrow(objId)
            break
          case 'PincerArrow':
            flag = 0
            _this.editPincerArrow(objId)
            break
          default:
            break
        }
      } else if (draw.flag == 2) {
        _this.clearEntityById(objId)
      }
      // else if (draw.flag == 3){
      // 	var moveTool= MoveEntity({ 'viewer': viewer});
      // }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  },
  showPolygon: function(objId, positions, vueComponent) {
    let _this = this
    // _this.getPositionsWithHeight(positions, (HPositions) => {
    let HPositions = _this.getPositionsWithHeight2(positions);
      console.log(HPositions)
    let material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.7)
    let bData = {
        layerId: 'globeDrawerDemoLayer',
        objId: objId,
        shapeType: 'Polygon',
        polygon: {
          hierarchy: positions,
          asynchronous: false,
          material: material
        },
        customProp: {
          positions: HPositions,
          name: '多边形'
        }
      }
    let entity = _this.viewer.entities.add(bData)
      draw.shape.push(entity)
      vueComponent.$data.layers.push(bData)
    // })
  },
  showWater: function(objId, positions, vueComponent) {
    let _this = this
    // _this.getPositionsWithHeight(positions, (HPositions) => {
    let HPositions = _this.getPositionsWithHeight2(positions);
      console.log(HPositions)
    let material = Cesium.Color.fromCssColorString('#0a6bb5').withAlpha(0.5)
    let bData = {
        layerId: 'globeDrawerDemoLayer',
        objId: objId,
        shapeType: 'Water',
        polygon: {
          hierarchy: positions,
          // asynchronous: false,
          material: material,
          perPositionHeight: true,
          extrudedHeight: 0,
        },
        customProp: {
          positions: HPositions,
          name: '水面'
        }
      }
    let entity = _this.viewer.entities.add(bData)
      draw.shape.push(entity)
      vueComponent.$data.layers.push(bData)
    // })
  },
  showPolyline: function(objId, positions, vueComponent) {
    var _this = this
    _this.getPositionsWithHeight(positions, (HPositions) => {
      var color = new Cesium.Color.fromCssColorString('#00f').withAlpha(0.9)
      var material = new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.25,
        // color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.9)
        color: new Cesium.Color.fromCssColorString('#00f').withAlpha(0.9)
      })
      var bData = {
        layerId: 'globeDrawerDemoLayer',
        objId: objId,
        shapeType: 'Polyline',
        polyline: {
          positions: positions,
          clampToGround: true,
          width: 8,
          material: material
        },
        customProp: {
          positions: HPositions,
          name: '折线'
        }
      }
      var entity = _this.viewer.entities.add(bData)
      // draw.shape.push(entity)
      vueComponent.$data.layers.push(bData)
    })
  },
  showRectangle: function(objId, positions) {
    var _this = this
    var color = object.tracker.changeColor.transform(colorViewModel.color)
    var material = object.tracker.changeColor.getColor(color, colorViewModel.alpha)
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
    })
    var rect = Cesium.Rectangle.fromCartesianArray(positions)
    var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west,
      rect.north
    ]
    var outlinePositions = Cesium.Cartesian3.fromRadiansArray(arr)
    var bData = {
      rectanglePosition: positions,
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'Rectangle',
      // polyline: {
      //     positions: outlinePositions,
      //     clampToGround: true,
      //     width: 2,
      //     material: outlineMaterial
      // },
      rectangle: {
        coordinates: rect,
        material: material
      }
    }
    var entity = _this.viewer.entities.add(bData)
    draw.shape.push(entity)
  },
  showSelectRectangle: function(objId, positions,vueComponent) {
    var _this = this
    var material = Cesium.Color.WHITE.withAlpha(0.1);
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
    })
    var rect = Cesium.Rectangle.fromCartesianArray(positions)
    var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west,
      rect.north
    ]
    var outlinePositions = Cesium.Cartesian3.fromRadiansArray(arr)
    var bData = {
      rectanglePosition: positions,
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'Rectangle',
      polyline: {
          positions: outlinePositions,
          clampToGround: true,
          width: 2,
          material: outlineMaterial
      },
      rectangle: {
        coordinates: rect,
        material: material
      },
      customProp: {
        positions: "",
        name: '框选'
      }
    }
    var entity = _this.viewer.entities.add(bData)
    // draw.shape.push(entity)
    vueComponent.$data.layers.push(bData)
  },

  showCircle: function(objId, positions) {
    var _this = this
    var distance = 0
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i])
      var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1])
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      //返回两点之间的距离
      //			s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
      s = Math.abs(point2cartographic.height - point1cartographic.height)
      distance = distance + s
    }

    var color = object.tracker.changeColor.transform(colorViewModel.color)
    var material = object.tracker.changeColor.getColor(color, colorViewModel.alpha)
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
    })
    var radiusMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
    })
    var pnts = object.tracker.circleDrawer._computeCirclePolygon(positions)
    var dis = object.tracker.circleDrawer._computeCircleRadius3D(positions)
    // dis = (dis / 1000).toFixed(3);
    var value = typeof positions.getValue === 'function' ? positions.getValue(0) : positions
    var text = dis + 'km'
    var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2))
    // var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));

    var bData = {
      circlePosition: positions,
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'Circle',
      position: positions[0],
      ellipse: {
        semiMajorAxis: dis ? dis : dis + 1,
        semiMinorAxis: dis ? dis : dis + 1,
        material: material,
        outline: true
      }
    }
    var entity = _this.viewer.entities.add(bData)
    draw.shape.push(entity)

    var outlineBdata = {
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'Circle',
      polyline: {
        positions: pnts,
        clampToGround: true,
        width: 2,
        material: outlineMaterial
      }
    }
    // var outlineEntity = viewer.entities.add(outlineBdata);

  },

  showBufferLine: function(objId, positions, radius) {
    var _this = this
    // var buffer = object.tracker.bufferLineDrawer.computeBufferLine(positions, radius);
    var color = object.tracker.changeColor.transform(colorViewModel.color)
    var material = object.tracker.changeColor.getColor(color, colorViewModel.alpha)
    // var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5);
    var lineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.0)
    })
    var r = radius / 2
    var buffer
    var bData = {
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'BufferLine',
      polygon: new Cesium.PolygonGraphics({
        hierarchy: new Cesium.CallbackProperty(function() {
          r += 2
          if (r >= radius) {
            r = radius / 2
          }
          buffer = object.tracker.bufferLineDrawer.computeBufferLine(positions, r)
          return new Cesium.PolygonHierarchy(buffer)
        }, false),
        asynchronous: false,
        material: material
      }),
      polyline: {
        positions: positions,
        clampToGround: true,
        width: 2,
        material: lineMaterial
      }
    }
    var entity = _this.viewer.entities.add(bData)
    draw.shape.push(entity)
  },
  showPoint: function(objId, position) {
    var _this = this
    var cartographics = Cesium.Cartographic.fromCartesian(position)
    let lat = Cesium.Math.toDegrees(cartographics.latitude)
    let lng = Cesium.Math.toDegrees(cartographics.longitude)
    var entity = _this.viewer.entities.add({
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'Point',
      position: position,
      billboard: {
        image: './images/circle_red.png',
        eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
        clampToGround: true,
        disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
      },
      // point: {
      // 	color: Cesium.Color.RED,
      // 	pixelSize: 5,
      // 	clampToGround: true,
      // 	// height: 10,
      // 	heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
      // 	disableDepthTestDistance: Number.POSITIVE_INFINITY, //元素在正上方
      // },
      clampToGround: true
    })
    draw.shape.push(entity)
  },
  showStraightArrow: function(objId, positions) {
    var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5)
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
    })
    var outlinePositions = [].concat(positions)
    outlinePositions.push(positions[0])
    var bData = {
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'StraightArrow',
      polyline: {
        positions: outlinePositions,
        clampToGround: true,
        width: 2,
        material: outlineMaterial
      },
      polygon: new Cesium.PolygonGraphics({
        hierarchy: positions,
        asynchronous: false,
        material: material
      })
    }
    var entity = viewer.entities.add(bData)
    draw.shape.push(entity)
  },
  showAttackArrow: function(objId, positions) {
    var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5)
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
    })
    var outlinePositions = [].concat(positions)
    outlinePositions.push(positions[0])
    var bData = {
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'AttackArrow',
      polyline: {
        positions: outlinePositions,
        clampToGround: true,
        width: 2,
        material: outlineMaterial
      },
      polygon: new Cesium.PolygonGraphics({
        hierarchy: positions,
        asynchronous: false,
        material: material
      })
    }
    var entity = viewer.entities.add(bData)
    draw.shape.push(entity)
  },
  showPincerArrow: function(objId, positions) {
    var material = Cesium.Color.fromCssColorString('#ff0').withAlpha(0.5)
    var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7)
    })
    var outlinePositions = [].concat(positions)
    outlinePositions.push(positions[0])
    var bData = {
      layerId: draw.layerId,
      objId: objId,
      shapeType: 'PincerArrow',
      polyline: {
        positions: outlinePositions,
        clampToGround: true,
        width: 2,
        material: outlineMaterial
      },
      polygon: new Cesium.PolygonGraphics({
        hierarchy: positions,
        asynchronous: false,
        material: material
      })
    }
    var entity = viewer.entities.add(bData)
    draw.shape.push(entity)
  },
  moveShape: function() {
    object.tracker.clear()
    var _this = this
    var objId = (new Date()).getTime()
    draw.flag = 0
    var leftDownFlag = false
    var pointDraged = null
    // var handler;
    var startPoint
    // 保存线，多边形，矩形坐标
    var polylinePreviousCoordinates = {}
    var polygonPreviousCoordinates = {}
    var rectanglePreviousCoordinates = {}
    var ellipsePreviousCoordinates = {}
    var pointPreviousCoordinates = {}
    var rectanglePosition = {}
    var StraightArrowCoordinates = {}
    var AttackArrowCoordinates = {}
    var PincerArrowCoordinates = {}
    // 临时存储点坐标
    var rectanglePoint = []
    let currentsPoint = []
    var saveCurrentsPoint = []
    var saveRectangle = []
    var saveAttackArrow = []
    var savePincerArrow = []

    var pincerPoints = [] //保存钳击箭头中“点”的经纬度
    var pincerPointsCart = [] //保存钳击箭头中“点”的墨卡托
    var attackPoints = [] //保存攻击箭头中“点”的经纬度
    var attackPointsCart = [] //保存攻击箭头中“点”的墨卡托
    var obj

    var moveHandler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas)
    moveHandler.setInputAction(function(movement) {
      pointDraged = _this.viewer.scene.pick(movement.position) //选取当前的entity
      if (!pointDraged) {
        return
      }
      obj = pointDraged.id
      objId = obj.objId
      leftDownFlag = true
      if (pointDraged) {
        currentsPoint = []
        //记录按下去的坐标
        startPoint = _this.viewer.scene.pickPosition(movement.position)
        _this.viewer.scene.screenSpaceCameraController.enableRotate = false //锁定相机
        if (pointDraged.id.shapeType == 'StraightArrow') {
          StraightArrowCoordinates = pointDraged.id.polygon.hierarchy.getValue()
        } else if (pointDraged.id.shapeType == 'PincerArrow') {
          PincerArrowCoordinates = pointDraged.id.polygon.hierarchy.getValue()
          pincerPoints = draw.shapeDic[objId].custom
          for (let i = 0; i < pincerPoints.length; i++) {
            pincerPointsCart.push(Cesium.Cartesian3.fromDegrees(pincerPoints[i][0], pincerPoints[i][1]))
          }
        } else if (pointDraged.id.shapeType == 'AttackArrow') {
          AttackArrowCoordinates = pointDraged.id.polygon.hierarchy.getValue()
          attackPoints = draw.shapeDic[objId].custom
          for (let i = 0; i < attackPoints.length; i++) {
            attackPointsCart.push(Cesium.Cartesian3.fromDegrees(attackPoints[i][0], attackPoints[i][1]))
          }
        } else { // 放在else里面是因为写的是“pointDraged.id.polyline”，应该像上面一样写shapeType，如果改成shapeType就可以放出来
          if (pointDraged.id.billboard) {
            pointPreviousCoordinates = pointDraged.id.position.getValue()
          }
          if (pointDraged.id.polyline) {
            polylinePreviousCoordinates = pointDraged.id.polyline.positions.getValue()
          }
          if (pointDraged.id.polygon && pointDraged.id.shapeType == 'Polygon') {
            polygonPreviousCoordinates = pointDraged.id.polygon.hierarchy.getValue()
          }
          if (pointDraged.id.rectangle) {
            rectanglePreviousCoordinates = pointDraged.id.rectangle.coordinates.getValue()
            rectanglePosition = pointDraged.id.rectanglePosition
          }
          if (pointDraged.id.ellipse) {
            ellipsePreviousCoordinates = pointDraged.id.circlePosition
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    moveHandler.setInputAction(function(movement) {
      let startPosition = _this.viewer.scene.pickPosition(movement.startPosition)
      let endPosition = _this.viewer.scene.pickPosition(movement.endPosition)
      if (startPosition && endPosition) {
        if (Cesium.defined(currentsPoint)) {
          //计算每次的偏差
          let changed_x = endPosition.x - startPosition.x
          let changed_y = endPosition.y - startPosition.y
          let changed_z = endPosition.z - startPosition.z
          if (pointDraged) {
            // 点击直线箭头、攻击箭头、钳击箭头，偷个懒，直接写在一起判断，毕竟都是多边形外面包了一个折线边框
            if (pointDraged.id.shapeType == 'StraightArrow') {
              currentsPoint = []
              for (let i = 0; i < StraightArrowCoordinates.positions.length; i++) {
                StraightArrowCoordinates.positions[i].x = StraightArrowCoordinates.positions[i].x + changed_x
                StraightArrowCoordinates.positions[i].y = StraightArrowCoordinates.positions[i].y + changed_y
                StraightArrowCoordinates.positions[i].z = StraightArrowCoordinates.positions[i].z + changed_z
                currentsPoint.push(StraightArrowCoordinates.positions[i])
              }
              saveCurrentsPoint = currentsPoint
              obj.polygon.hierarchy = new Cesium.CallbackProperty(function() {
                return new Cesium.PolygonHierarchy(saveCurrentsPoint)
              }, false)
              obj.polyline.positions = new Cesium.CallbackProperty(function() {
                return saveCurrentsPoint
              }, false)
            } else if (pointDraged.id.shapeType == 'AttackArrow') {
              currentsPoint = [] //笛卡尔
              saveAttackArrow = [] //经纬度
              for (let i = 0; i < AttackArrowCoordinates.positions.length; i++) {
                AttackArrowCoordinates.positions[i].x = AttackArrowCoordinates.positions[i].x + changed_x
                AttackArrowCoordinates.positions[i].y = AttackArrowCoordinates.positions[i].y + changed_y
                AttackArrowCoordinates.positions[i].z = AttackArrowCoordinates.positions[i].z + changed_z
                currentsPoint.push(AttackArrowCoordinates.positions[i])
              }
              for (var i = 0; i < attackPointsCart.length; i++) {
                attackPointsCart[i].x += changed_x
                attackPointsCart[i].y += changed_y
                attackPointsCart[i].z += changed_z
                var cartographic = Cesium.Cartographic.fromCartesian(attackPointsCart[i])
                var lon = Cesium.Math.toDegrees(cartographic.longitude)
                var lat = Cesium.Math.toDegrees(cartographic.latitude)
                saveAttackArrow.push([lon, lat])
              }
              saveCurrentsPoint = currentsPoint
              obj.polygon.hierarchy = new Cesium.CallbackProperty(function() {
                return new Cesium.PolygonHierarchy(saveCurrentsPoint)
              }, false)
              obj.polyline.positions = new Cesium.CallbackProperty(function() {
                return saveCurrentsPoint
              }, false)
              draw.shapeDic[objId] = {
                custom: saveAttackArrow,
                positions: currentsPoint
              }
            } else if (pointDraged.id.shapeType == 'PincerArrow') {
              currentsPoint = []
              savePincerArrow = []
              for (let i = 0; i < PincerArrowCoordinates.positions.length; i++) {
                PincerArrowCoordinates.positions[i].x = PincerArrowCoordinates.positions[i].x + changed_x
                PincerArrowCoordinates.positions[i].y = PincerArrowCoordinates.positions[i].y + changed_y
                PincerArrowCoordinates.positions[i].z = PincerArrowCoordinates.positions[i].z + changed_z
                currentsPoint.push(PincerArrowCoordinates.positions[i])
              }
              for (var i = 0; i < pincerPointsCart.length; i++) {
                pincerPointsCart[i].x += changed_x
                pincerPointsCart[i].y += changed_y
                pincerPointsCart[i].z += changed_z
                var cartographic = Cesium.Cartographic.fromCartesian(pincerPointsCart[i])
                var lon = Cesium.Math.toDegrees(cartographic.longitude)
                var lat = Cesium.Math.toDegrees(cartographic.latitude)
                savePincerArrow.push([lon, lat])
              }
              saveCurrentsPoint = currentsPoint
              obj.polygon.hierarchy = new Cesium.CallbackProperty(function() {
                return new Cesium.PolygonHierarchy(saveCurrentsPoint)
              }, false)
              obj.polyline.positions = new Cesium.CallbackProperty(function() {
                return saveCurrentsPoint
              }, false)
              draw.shapeDic[objId] = {
                custom: savePincerArrow,
                positions: currentsPoint
              }
            } else {
              if (pointDraged.id.billboard) {
                currentsPoint = []
                obj.position = new Cesium.CallbackProperty(function() {
                  return endPosition
                }, false)
                draw.shapeDic[objId] = endPosition
              }
              if (pointDraged.id.polyline) {
                currentsPoint = []
                for (let i = 0; i < polylinePreviousCoordinates.length; i++) {
                  //与之前的算差 替换掉
                  polylinePreviousCoordinates[i].x = polylinePreviousCoordinates[i].x + changed_x
                  polylinePreviousCoordinates[i].y = polylinePreviousCoordinates[i].y + changed_y
                  polylinePreviousCoordinates[i].z = polylinePreviousCoordinates[i].z + changed_z
                  currentsPoint.push(polylinePreviousCoordinates[i])
                }
                saveCurrentsPoint = currentsPoint
                obj.polyline.positions = new Cesium.CallbackProperty(function() {
                  return saveCurrentsPoint
                }, false)
              }
              if (polygonPreviousCoordinates.positions) {
                currentsPoint = []
                if (pointDraged.id.polygon) {
                  for (let i = 0; i < polygonPreviousCoordinates.positions.length; i++) {
                    polygonPreviousCoordinates.positions[i].x = polygonPreviousCoordinates.positions[i].x + changed_x
                    polygonPreviousCoordinates.positions[i].y = polygonPreviousCoordinates.positions[i].y + changed_y
                    polygonPreviousCoordinates.positions[i].z = polygonPreviousCoordinates.positions[i].z + changed_z
                    currentsPoint.push(polygonPreviousCoordinates.positions[i])
                  }
                  saveCurrentsPoint = currentsPoint
                  obj.polygon.hierarchy = new Cesium.CallbackProperty(function() {
                    return new Cesium.PolygonHierarchy(saveCurrentsPoint)
                  }, false)
                }
              }
              if (pointDraged.id.rectangle) {
                let storePoint = {}
                rectanglePoint = []
                let position_start = startPosition
                let cartographic_start = Cesium.Cartographic.fromCartesian(position_start)
                let longitude_start = Cesium.Math.toDegrees(cartographic_start.longitude)
                let latitude_start = Cesium.Math.toDegrees(cartographic_start.latitude)
                let height_start = cartographic_start.height

                let position_end = endPosition
                let cartographic_end = Cesium.Cartographic.fromCartesian(position_end)
                let longitude_end = Cesium.Math.toDegrees(cartographic_end.longitude)
                let latitude_end = Cesium.Math.toDegrees(cartographic_end.latitude)
                let height_end = cartographic_end.height
                let changer_lng = longitude_end - longitude_start
                let changer_lat = latitude_end - latitude_start
                rectanglePreviousCoordinates.west = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.west) +
                  changer_lng)
                rectanglePreviousCoordinates.east = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.east) +
                  changer_lng)
                rectanglePreviousCoordinates.south = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.south) +
                  changer_lat)
                rectanglePreviousCoordinates.north = Cesium.Math.toRadians(Cesium.Math.toDegrees(rectanglePreviousCoordinates.north) +
                  changer_lat)
                storePoint = rectanglePreviousCoordinates
                saveRectangle = storePoint
                obj.rectangle.coordinates = new Cesium.CallbackProperty(function() {
                  return saveRectangle
                }, false)
                for (let i = 0; i < rectanglePosition.length; i++) {
                  //与之前的算差 替换掉
                  rectanglePosition[i].x = rectanglePosition[i].x + changed_x
                  rectanglePosition[i].y = rectanglePosition[i].y + changed_y
                  rectanglePosition[i].z = rectanglePosition[i].z + changed_z
                  rectanglePoint.push(rectanglePosition[i])
                }
                obj.rectanglePosition = rectanglePoint
                draw.shapeDic[objId] = rectanglePoint
              }
              if (pointDraged.id.ellipse) {
                saveId = objId
                currentsPoint = []
                for (let i = 0; i < ellipsePreviousCoordinates.length; i++) {
                  //与之前的算差 替换掉
                  ellipsePreviousCoordinates[i].x = ellipsePreviousCoordinates[i].x + changed_x
                  ellipsePreviousCoordinates[i].y = ellipsePreviousCoordinates[i].y + changed_y
                  ellipsePreviousCoordinates[i].z = ellipsePreviousCoordinates[i].z + changed_z
                  currentsPoint.push(ellipsePreviousCoordinates[i])
                }
                saveCurrentsPoint = currentsPoint
                obj.position = new Cesium.CallbackProperty(function() {
                  return saveCurrentsPoint[0]
                }, false)
              }
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    moveHandler.setInputAction(function(movement) {
      _this.viewer.scene.screenSpaceCameraController.enableRotate = true //解锁相机
      currentsPoint = undefined
      moveHandler.destroy()
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
  },
  editPolygon: function(objId) {
    var _this = this
    var oldPositions = draw.shapeDic[objId]
    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    tracker.polygonDrawer.showModifyPolygon(oldPositions, function(positions) {
      draw.shapeDic[objId] = positions
      _this.showPolygon(objId, positions)
    }, function() {
      _this.showPolygon(objId, oldPositions)
    })
  },
  editWater: function(objId) {
    var _this = this
    var oldPositions = JSON.parse(JSON.stringify(draw.shapeDic[objId]))
    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    tracker.waterDrawer.showModifyWater(oldPositions, function(vueComponent,positions) {
      draw.shapeDic[objId] = positions
      _this.showWater(objId, positions,vueComponent)
    }, function() {
      _this.showWater(objId, oldPositions,vueComponent)
    })
  },
  editPolyline: function(objId) {
    var _this = this
    var oldPositions = draw.shapeDic[objId]

    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    object.tracker.polylineDrawer.showModifyPolyline(oldPositions, function(positions) {
      draw.shapeDic[objId] = positions
      _this.showPolyline(objId, positions)
    }, function() {
      _this.showPolyline(objId, oldPositions)
    })
  },
  editRectangle: function(objId) {
    var _this = this
    var oldPositions = draw.shapeDic[objId]
    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    object.tracker.rectDrawer.showModifyRectangle(oldPositions, function(positions) {
      draw.shapeDic[objId] = positions
      _this.showRectangle(objId, positions)
    }, function() {
      _this.showRectangle(objId, oldPositions)
    })
  },
  editCircle: function(objId) {
    var _this = this
    var oldPositions = draw.shapeDic[objId]
    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    object.tracker.circleDrawer.showModifyCircle(oldPositions, function(positions) {

      draw.shapeDic[objId] = positions
      _this.showCircle(objId, positions)
    }, function() {
      _this.showCircle(objId, oldPositions)
    })
  },
  editBufferLine: function(objId) {
    var _this = this
    var old = draw.shapeDic[objId]

    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    object.tracker.bufferLineDrawer.showModifyBufferLine(old.positions, old.radius, function(positions, radius) {
      draw.shapeDic[objId] = {
        positions: positions,
        radius: radius
      }
      _this.showBufferLine(objId, positions, radius)
    }, function() {
      _this.showBufferLine(old.positions, old.radius, oldPositions)
    })
  },
  editStraightArrow: function(objId) {
    var _this = this
    var oldPositions = draw.shapeDic[objId]

    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    object.tracker.straightArrowDrawer.showModifyStraightArrow(oldPositions, function(positions) {
      draw.shapeDic[objId] = positions
      _this.showStraightArrow(objId, positions)
    }, function() {
      _this.showStraightArrow(objId, oldPositions)
    })
  },
  editAttackArrow: function(objId) {
    var _this = this
    var old = draw.shapeDic[objId]
    //先移除entity
    _this.clearEntityById(objId)

    object.tracker.attackArrowDrawer.showModifyAttackArrow(old.custom, function(positions, custom) {
      //保存编辑结果
      draw.shapeDic[objId] = {
        custom: custom,
        positions: positions
      }
      _this.showAttackArrow(objId, positions)
    }, function() {
      _this.showAttackArrow(objId, old.positions)
    })
  },
  editPincerArrow: function(objId) {
    var _this = this
    var old = draw.shapeDic[objId]

    //先移除entity
    _this.clearEntityById(objId)

    object.tracker.pincerArrowDrawer.showModifyPincerArrow(old.custom, function(positions, custom) {
      //保存编辑结果
      draw.shapeDic[objId] = {
        custom: custom,
        positions: positions
      }
      _this.showPincerArrow(objId, positions)
    }, function() {
      _this.showPincerArrow(objId, old.positions)
    })
  },
  editPoint: function(objId) {
    var _this = this
    var oldPosition = draw.shapeDic[objId]

    //先移除entity
    _this.clearEntityById(objId)

    //进入编辑状态
    object.tracker.pointDrawer.showModifyPoint(oldPosition, function(position) {
      draw.shapeDic[objId] = position
      _this.showPoint(objId, position)
    }, function() {
      _this.showPoint(objId, oldPosition)
    })
  },
  clearEntityById: function(objId) {
    var _this = this
    var entityList = _this.viewer.entities.values
    if (entityList == null || entityList.length < 1) {
      return
    }
    for (var i = 0; i < entityList.length; i++) {
      var entity = entityList[i]
      if (entity.layerId == draw.layerId && entity.objId == objId) {
        _this.viewer.entities.remove(entity)
        i--
      }
    }
  },
  clearAll: function(vueComponent) {
    var _this = this
    var entityList = _this.viewer.entities.values
    if (entityList == null || entityList.length < 1) {
      return
    }
    for (var i = 0; i < entityList.length; i++) {
      var entity = entityList[i]
      if (entity.layerId == 'globeDrawerDemoLayer') {
        _this.viewer.entities.remove(entity)
        i--
      }
    }
    vueComponent.$data.layers = []
  },
  getPositionsWithHeight: function(cartPositions, callback) {
    var pos = []
    for (let i = 0; i < cartPositions.length; i++) {
      const element = cartPositions[i]
      let cartographic = Cesium.Cartographic.fromCartesian(element)
      pos.push(cartographic)
    }
    var promise = Cesium.sampleTerrainMostDetailed(_viewer.terrainProvider, pos)
    Cesium.when(promise, function(updatedPositions) {
      var HPositions = []
      for (let i = 0; i < updatedPositions.length; i++) {
        let lon = Cesium.Math.toDegrees(updatedPositions[i].longitude)
        let lat = Cesium.Math.toDegrees(updatedPositions[i].latitude)
        let height = updatedPositions[i].height
        HPositions.push([lon, lat, height])
      }
      callback(HPositions)
    }).otherwise(function(error) {
      console.log(error)
    })
  },
  getPositionsWithHeight2: function(cartPositions) {
    let HPositions = []
    for (let i = 0; i < cartPositions.length; i++) {
      const cartesian = cartPositions[i]
      let carto = Cesium.Cartographic.fromCartesian(cartesian)　　//输入经纬度
      let height = _viewer.scene.globe.getHeight(carto)
      let lon = Cesium.Math.toDegrees(carto.longitude)
      let lat = Cesium.Math.toDegrees(carto.latitude)
      HPositions.push([lon, lat, height])
    }
    return HPositions
  }
}
