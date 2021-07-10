var GlobeTracker = function() {
  this.init.apply(this, arguments)
}

GlobeTracker.prototype = {
  viewer: null,
  ctrArr: [],
  pointDrawer: null,
  polylineDrawer: null,
  polygonDrawer: null,
  waterDrawer: null,
  circleDrawer: null,
  rectDrawer: null,
  selectRectDrawer: null,
  bufferLineDrawer: null,
  straightArrowDrawer: null,
  attackArrowDrawer: null,
  pincerArrowDrawer: null,
  posMeasure: null,
  spaceDisMeasure: null,
  stickDisMeasure: null,
  areaMeasure: null,
  moveShape: null,
  pullPolygon: null,
  changeColor: null,
  init: function(viewer) {
    var _this = this
    _this.viewer = viewer

    _this.pointDrawer = new GlobePointDrawer(_this.viewer)
    _this.ctrArr.push(_this.pointDrawer)

    _this.polylineDrawer = new GlobePolylineDrawer(_this.viewer)
    _this.ctrArr.push(_this.polylineDrawer)

    _this.polygonDrawer = new GlobePolygonDrawer(_this.viewer)
    _this.ctrArr.push(_this.polygonDrawer)
    _this.waterDrawer = new GlobeWaterPolygonDrawer(_this.viewer)
    _this.ctrArr.push(_this.waterDrawer)

    _this.circleDrawer = new GlobeCircleDrawer(_this.viewer)
    _this.ctrArr.push(_this.circleDrawer)

    _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer)
    _this.ctrArr.push(_this.rectDrawer)
    _this.selectRectDrawer = new GlobeSelectRectangleDrawer(_this.viewer)
    _this.ctrArr.push(_this.selectRectDrawer)

    _this.moveShape = new GlobeMoveShape(_this.viewer)
    _this.ctrArr.push(_this.moveShape)

    _this.bufferLineDrawer = new GlobeBufferLineDrawer(_this.viewer)
    _this.ctrArr.push(_this.bufferLineDrawer)

    _this.straightArrowDrawer = new PlotStraightArrowDrawer(_this.viewer)
    _this.ctrArr.push(_this.straightArrowDrawer)

    _this.attackArrowDrawer = new PlotAttackArrowDrawer(_this.viewer)
    _this.ctrArr.push(_this.attackArrowDrawer)

    _this.pincerArrowDrawer = new PlotPincerArrowDrawer(_this.viewer)
    _this.ctrArr.push(_this.pincerArrowDrawer)
  },
  clear: function() {
    var _this = this
    for (var i = 0; i < _this.ctrArr.length; i++) {
      try {
        var ctr = _this.ctrArr[i]
        if (ctr.clear) {
          ctr.clear()
        }
      } catch (err) {
        console.log('发生未知出错：GlobeTracker.clear')
      }
    }
  },
  trackBufferLine: function(okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.bufferLineDrawer == null) {
      _this.bufferLineDrawer = new GlobeBufferLineDrawer(_this.viewer)
      _this.ctrArr.push(_this.bufferLineDrawer)
    }
    _this.bufferLineDrawer.startDrawBufferLine(okHandler, cancelHandler)
  },
  trackPoint: function(okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.pointDrawer == null) {
      _this.pointDrawer = new GlobePointDrawer(_this.viewer)
      _this.ctrArr.push(_this.pointDrawer)
    }
    _this.pointDrawer.startDrawPoint(okHandler, cancelHandler)
  },
  trackPolyline: function(vueComponent, okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.polylineDrawer == null) {
      _this.polylineDrawer = new GlobePolylineDrawer(_this.viewer)
      _this.ctrArr.push(_this.polylineDrawer)
    }
    _this.polylineDrawer.startDrawPolyline(vueComponent, okHandler, cancelHandler)
  },
  trackPolygon: function(vueComponent, okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.polygonDrawer == null) {
      _this.polygonDrawer = new GlobePolygonDrawer(_this.viewer)
      _this.ctrArr.push(_this.polygonDrawer)
    }
    _this.polygonDrawer.startDrawPolygon(vueComponent, okHandler, cancelHandler)
  },
  trackWater: function(vueComponent, okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.waterDrawer == null) {
      _this.waterDrawer = new GlobeWaterPolygonDrawer(_this.viewer)
      _this.ctrArr.push(_this.waterDrawer)
    }
    _this.waterDrawer.startDrawWater(vueComponent, okHandler, cancelHandler)
  },
  trackCircle: function(okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.circleDrawer == null) {
      _this.circleDrawer = new GlobeCircleDrawer(_this.viewer)
      _this.ctrArr.push(_this.circleDrawer)
    }
    _this.circleDrawer.startDrawCircle(okHandler, cancelHandler)
  },
  trackRectangle: function(okHandler, cancelHandler) {
    var _this = this
    if (_this.rectDrawer == null) {
      _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer)
      _this.ctrArr.push(_this.rectDrawer)
    }
    _this.clear()
    _this.rectDrawer.startDrawRectangle(okHandler, cancelHandler)
  },
  trackSelectRectangle: function(vueComponent,okHandler, cancelHandler) {
    var _this = this
    if (_this.rectDrawer == null) {
      _this.selectRectDrawer = new GlobeSelectRectangleDrawer(_this.viewer)
      _this.ctrArr.push(_this.selectRectDrawer)
    }
    _this.clear()
    _this.selectRectDrawer.startDrawSelectRectangle(vueComponent,okHandler, cancelHandler)
  },

  trackStraightArrow: function(okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.straightArrowDrawer == null) {
      _this.straightArrowDrawer = new PlotStraightArrowDrawer(_this.viewer)
      _this.ctrArr.push(_this.straightArrowDrawer)
    }
    _this.straightArrowDrawer.startDrawStraightArrow(okHandler, cancelHandler)
  },
  trackAttackArrow: function(okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.attackArrowDrawer == null) {
      _this.attackArrowDrawer = new PlotAttackArrowDrawer(_this.viewer)
      _this.ctrArr.push(_this.attackArrowDrawer)
    }
    _this.attackArrowDrawer.startDrawAttackArrow(okHandler, cancelHandler)
  },
  trackPincerArrow: function(okHandler, cancelHandler) {
    var _this = this
    _this.clear()
    if (_this.pincerArrowDrawer == null) {
      _this.pincerArrowDrawer = new PlotPincerArrowDrawer(_this.viewer)
      _this.ctrArr.push(_this.pincerArrowDrawer)
    }
    _this.pincerArrowDrawer.startDrawPincerArrow(okHandler, cancelHandler)
  },
  CLASS_NAME: 'GlobeTracker'
}
