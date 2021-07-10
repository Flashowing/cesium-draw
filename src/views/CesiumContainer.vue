<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { Viewer } from 'cesium'
import * as turf from '@turf/turf'
export default {
  name: 'CesiumContainer',
  mounted() {
    /* eslint no-new: */
    window._viewer = new Viewer('cesiumContainer',{
      imageryProvider:new Cesium.UrlTemplateImageryProvider({
      	url: "http://222.178.182.14:9010/dataserver?x={x}&y={y}&l={z}&t=img_c",
      	tilingScheme: new Cesium.GeographicTilingScheme(),
      	maximumLevel: 20,
      }),
      baseLayerPicker: false,
      homeButton: false,
      animation: false,
      timeline: false,
      geocoder: true,
      infoBox: false,
      selectionIndicator: false,
      sceneModePicker: true,
      navigationHelpButton: false,
      sceneMode: Cesium.SceneMode.SCENE3D, //使用earthsdk切换3d视角要加上这句
      scene3DOnly: false,
      shouldAnimate: true,
      fullscreenButton: false,
      contextOptions: {
        webgl: {
          alpha: false, // 这个属性如果设置为true,图形在地下部分会更亮，开启地表透明时会特别亮,找了好久这个问题,痛苦😭
          depth: true,
          stencil: true,
          antialias: true,
          premultipliedAlpha: true,
          //通过canvas.toDataURL()实现截图需要将该项设置为true
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: true
        }
      },
    })
    //隐藏版权信息
    _viewer._cesiumWidget._creditContainer.style.display = "none";
    // 地形深度检测
    _viewer.scene.globe.depthTestAgainstTerrain = true;
    _viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    _viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(106.3931931565161, 29.805810956616792, 1100),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: Cesium.Math.toRadians(0)
      }
    });
    let wxt = _viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
    	url: "http://183.230.114.154:9010/Satellite/{z}/{x}/{y}.png",
    }));
    wxt.name = "新卫星图";
    wxt.saturation = 1.7;
    window.tracker = new GlobeTracker(_viewer); // 画图 draw/GlobeTracker.js
    window.drawS = new drawShape(_viewer); // 画图 draw/draw.js
    window.lgeo = new loadGeojson();
    drawS.bindGloveEvent();
    /**
     * 新地形图
     * @type {CesiumTerrainProvider}
     */
    var newTerrainProvider = new Cesium.CesiumTerrainProvider({
      url: "http://183.230.114.154:9010/terrain",
      maxiumLevel: 20,
      requestWaterMask: false,
      requestVertexNormals: false,
    })
    // 加载地形图
    _viewer.terrainProvider = newTerrainProvider;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
