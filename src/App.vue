<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import { RouterLink, RouterView } from 'vue-router'
export default {
  name: "App",
  components: {
    NavBar,
  },
};
</script>

<style>
.shadow {
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.267);
}

:root {
  --light-grey: rgb(107, 107, 107);
  --white: rgb(231, 231, 231);
  --padding: 10px;
  --tile-background: white;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
