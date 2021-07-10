var loadGeojson = function() {

}
loadGeojson.prototype = {
  start(pageFrameVue,url) {
    tracker.waterDrawer.vueComponent = pageFrameVue;
    axios.get(url)
      .then(function(response) {
        // data:
        //   features: Array(1)
        // 0:
        // geometry:
        //   coordinates: Array(1)
        // 0: Array(14)
        let data = response.data
        let coordinate = data.features[0].geometry.coordinates[0]
        let cart3 = []
        for (let i = 0; i < coordinate.length; i++) {
          let c = Cesium.Cartesian3.fromDegrees(coordinate[i][0], coordinate[i][1],200)
          cart3.push(c)
        }
        console.log(cart3)
        let objId = (new Date()).getTime()
        draw.shapeDic[objId] = cart3
        let HPositions = drawS.getPositionsWithHeight2(cart3)
        console.log(HPositions)
        let material = Cesium.Color.fromCssColorString('#0a6bb5').withAlpha(0.85)
        let bData = {
          layerId: 'globeDrawerDemoLayer',
          objId: objId,
          shapeType: 'Water',
          polygon: {
            hierarchy: cart3,
            // asynchronous: false,
            material: material,
            perPositionHeight: true,
            extrudedHeight: 0
          },
          customProp: {
            positions: HPositions,
            name: '水面'
          }
        }
        let entity = _viewer.entities.add(bData)
        draw.shape.push(entity)
        pageFrameVue.$data.layers.push(bData)
      })
      .catch(function(error) {
        // handle error
        console.log(error)
      })
      .then(function() {
        // always executed
      })
  }
}
