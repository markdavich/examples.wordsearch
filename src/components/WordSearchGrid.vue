<template>
  <div class="word-search-grid shadow">
    <div class="row" v-for="(row, rIndex) in letters" :key="`wsg-row-${rIndex}`">
      <div
        class="letter"
        v-for="(letter, lIndex) in row"
        :key="`wsg-column-${lIndex}`"
        :class="{ highlighted: getCellColor(rIndex, lIndex) }"
        :style="getCellStyle(rIndex, lIndex)"
      >
        {{ letter }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  letters: { type: Array, required: true },
  highlightedCells: { type: Array, default: () => [] },
});

function getCellColor(row, col) {
  const cell = props.highlightedCells.find(c => c.row === row && c.col === col);
  return cell ? cell.color : null;
}

function getCellStyle(row, col) {
  const color = getCellColor(row, col);
  if (color) {
    return { backgroundColor: color };
  }
  return {};
}
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

.letter.highlighted {
  font-weight: bold;
}
</style>