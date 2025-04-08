<template>
  <div class="words shadow">
    <div class="title">Find These</div>
    <div class="row" v-for="(word, wIndex) in words" :key="`wtf-word-${wIndex}`">{{ word }}</div>
  </div>
</template>

<script>
export default {
  name: "WordsToFind",
  props: {
    words: { type: Array, required: true },
  },
};
</script>

<style lang="css" scoped>
.words {
  display: inline-flex;
  flex-direction: column;
  padding: 5px;
  border-radius: 5px;
  border: solid var(--light-grey) 1px;
  height: min-content;
  background-color: var(--tile-background);
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  font-family: monospace;

  border: solid rgba(223, 223, 223, 0.472) 1px;
  border-right: none;
  border-left: none;
  border-top: none;

  margin-bottom: 2px;
}

.words .row:last-child {
  border-bottom: none;
}

.title {
  font-size: 1.6em;
  margin-bottom: 5px;
}
</style>