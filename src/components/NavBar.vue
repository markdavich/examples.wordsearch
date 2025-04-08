<template>
  <div class="nav-bar">
    <div class="title">Alphabet Soup</div>
    <router-link class="link" v-if="route === 'About'" to="/">WordSearch</router-link>
    <router-link class="link" v-if="route === 'WordSearch'" to="/about">About</router-link>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  computed: {
    route() {
      return this.$route.name;
    },
  },
};
</script>

<style lang="css" scoped>
.nav-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: var(--light-grey);
  color: var(--white);
  padding: var(--padding);
}

.title {
  font-size: 2em;
  font-weight: bolder;
}

.link {
  color: var(--white);
}
</style>
