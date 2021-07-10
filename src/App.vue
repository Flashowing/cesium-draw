<template>
  <div id="app">
    <PageFrame></PageFrame>
    <CesiumContainer></CesiumContainer>
  </div>
</template>
<script>
import CesiumContainer from './views/CesiumContainer'
import PageFrame from './views/PageFrame'
export default {
  name: 'app',
  components: {
    CesiumContainer,PageFrame
  }
}
</script>
<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
