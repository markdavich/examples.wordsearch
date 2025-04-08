<template>
  <div class="nav-bar">
    <div class="title">Alphabet Soup
    </div>
    <div class="shortcut">
      Press <span class="key">Ctrl</span> + <span class="key">Shift</span> + <span class="key">I</span> to check out the
      data in the <u><i>console</i></u> tab.
    </div>
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

.shortcut {
  font-size: 0.9em;
  color: var(--white);
}

.key {
  background-color: var(--vt-c-text-light-2);
  color: var(--white);
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
  margin: 0 2px;
}
</style>
