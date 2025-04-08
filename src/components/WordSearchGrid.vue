<template>
  <div class="word-search-grid shadow">
    <div class="row" v-for="(row, rIndex) in letters" :key="`wsg-row-${rIndex}`">
      <div class="letter" v-for="(letter, lIndex) in row" :key="`wsg-column-${lIndex}`">{{ letter }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WordSearchGrid",
  props: {
    letters: { type: Array, required: true },
  },
};
</script>

<style lang="css" scoped>
.word-search-grid {
  margin-top: auto;
  margin-bottom: auto;
  margin: auto;
  display: inline-flex;
  flex-direction: column;
  /* padding: 5px; */
  border-radius: 5px;
  border: solid var(--light-grey) 1px;
  height: min-content;

  background-color: var(--tile-background);
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.letter {
  border: solid rgba(223, 223, 223, 0.472) 1px;
  border-right: none;
  border-bottom: none;

  display: flex;
  flex-direction: column;
  justify-content: center;

  font-family: monospace;
  font-size: 1.5em;
  height: 1.5em;
  width: 1.5em;
}
</style>