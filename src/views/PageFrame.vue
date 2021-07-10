<template>
  <div class='PageFrame'>
    <el-row>
      <el-button type='primary' icon='el-icon-edit' @click='drawPolyline()'>折线</el-button>
      <el-button type='primary' icon='el-icon-edit' @click='drawPolygon()'>多边形</el-button>
      <el-button type='primary' icon='el-icon-edit' @click='drawWater()'>水面</el-button>
      <el-button type='primary' icon='el-icon-edit' @click='clearShape()'>清除</el-button>
      <el-button type='primary' icon='el-icon-edit' @click='editShape()'>编辑</el-button>
      <el-button type='primary' icon='el-icon-edit' @click='selectShape()'>框选</el-button>
      <el-button type='primary' icon='el-icon-edit' @click='loadGeojson()'>加载geojson</el-button>
    </el-row>
    <el-row>
      <ul id='layersPanel' v-tap='directiveOption'>
        <li class='layers' v-for='(layer,i) in layers' @contextmenu='rightClick1(layer.customProp.positions)'>
          {{ layer.customProp.name }}
        </li>
      </ul>
    </el-row>
    <vue-mouse-menu :visible.sync='visible' source='rightClick' :option="menuOption">
      <ul class='right_click_panel_ul'>
        <li @click='clickLi(this)' v-for='item in menuList'>{{ item.txt }}</li>
      </ul>
    </vue-mouse-menu>
    <div id='alert'></div>
  </div>
</template>

<script>
export default {
  name: 'PageFrame',
  mounted() {
    setTimeout(() => {
      // this.initContextMenu()
    }, 1000)
  },
  data() {
    return {
      visible: false,
      menuOption: {
        className: 'right_click_panel',    //自定义 vue-mouse-menu 的 css 样式名
        pointx: -35,        //弹出菜单左上角锚点，离点击位置的水平距离
        pointy: -40,        //弹出菜单左上角锚点，离点击位置的垂直距离
      },
      menuList: [
        {
          txt: '导出geojson',
          positions: null
        }
      ],
      directiveOption: {
        eventType: 'mouseClick',
        target: 'rightClick'
        //preventNativePOP: true,   //默认阻止原生鼠标右键弹出菜单
      },
      layersPanel: {},
      layers: [],
      degreesData: []
    }
  },
  methods: {
    clickLi() {
      this.exportPositions(this.menuList[0].positions)
    },
    rightClick1: function(positions) {
    // 右键方法触发
      try {
        const that = this
        // 需要用到 electron
        const { remote } = require('electron')
        const { Menu, MenuItem } = remote
        try {
        document.getElementsByClassName('right_click_panel')[0].style.display = 'none'
        }catch (e) {}
        // 右键菜单
        const menu = new Menu()
        menu.append(new MenuItem({ label: 'geojson', type: 'checkbox', checked: true }))//选中
        menu.append(new MenuItem({ type: 'separator' }))//分割线
        menu.append(new MenuItem({
          label: '导出',
          click: function() {
            that.exportPositions(positions)
          }
        }))

        // 第二个菜单
        // menu.append( ... )
        // 展示出来
        menu.popup({ window: remote.getCurrentWindow() })
      }catch (e) {
        this.menuList[0].positions = positions
      }

    },
    drawPolyline() {
      let _this = this
      draw.flag = 0
      tracker.trackPolyline(_this, function(vueComponent, position) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        drawS.showPolyline(objId, position, vueComponent)
      })
    },
    drawPolygon() {
      let _this = this
      draw.flag = 0
      tracker.trackPolygon(_this, function(vueComponent, positions, params) {
        var objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        drawS.showPolygon(objId, positions, vueComponent, params)
      })
    },
    drawWater() {
      let _this = this
      draw.flag = 0
      tracker.trackWater(_this, function(vueComponent, positions, params) {
        let objId = (new Date()).getTime()
        draw.shapeDic[objId] = positions
        drawS.showWater(objId, positions, vueComponent, params)
      })
    },
    selectShape(){
      let _this = this
      draw.flag = 0
      tracker.trackSelectRectangle(_this,function(vueComponent,positions) {
        let objId = (new Date()).getTime()
        // draw.shapeDic[objId] = positions
        // drawS.showSelectRectangle(objId, positions,vueComponent)
      })
    },
    clearShape() {
      drawS.clearAll(this)
    },
    editShape() {
      draw.flag = 1
      //清除标绘状态
      tracker.clear()
    },
    loadGeojson(){
      this.$prompt('文件路径', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        lgeo.start(this,value)
      }).catch(() => {
      });

   },
    exportPositions(positions) {
      let _this = this
      var geojsonTitleString = `{
  "type": "FeatureCollection",
  "features": [
  ]
}`
      var geojsonContentString = `{
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
        ]
      }
    }`
      var geojson = JSON.parse(geojsonTitleString)
      var length = positions.length
      var content = JSON.parse(geojsonContentString)
      content.geometry.coordinates[0] = positions
      geojson.features[0] = content
      // for (let i = 0; i < length; i++) {
      //   var content = JSON.parse(geojsonContentString)
      //   content.geometry.coordinates[0] = positions[i]
      //   geojson.features[i] = content
      // }
      this.sequenceDownload(JSON.stringify(geojson))
    },
    sequenceDownload(data) {
      var blob = new Blob([data], { type: 'application/geojson;charset=utf-8' })
      var downloadElement = document.createElement('a')
      var href = window.URL.createObjectURL(blob) //创建下载的链接
      downloadElement.href = href
      downloadElement.download = unescape('test' + '.geojson') //下载后文件名
      document.body.appendChild(downloadElement)
      downloadElement.click() //点击下载
      document.body.removeChild(downloadElement) //下载完成移除元素
      window.URL.revokeObjectURL(href) //释放掉blob对象
    }
  }
}
</script>

<style scoped>
.PageFrame {
  position: absolute;
  z-index: 1;
  left: 30px;
  top: 50px;
}

.layers {
  color: white;
}
.right_click_panel{

}
.right_click_panel_ul{
  padding: 5px;
  margin: 5px;
}
.right_click_panel_ul li{
  cursor: pointer;
  list-style-type: none;
}
</style>
