<template>
  <div class="answers shadow">
    <div class="title">Answers</div>
    <div
      class="row"
      v-for="(answer, rIndex) in answers"
      :key="`wsg-row-${rIndex}`"
      :class="{ highlighted: answer in highlightedAnswers }"
      :style="getAnswerStyle(answer)"
      @click="emit('answerSelected', answer)"
    >
      {{ answer }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  answers: { type: Array, required: true },
  highlightedAnswers: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['answerSelected']);

function getAnswerStyle(answer) {
  if (answer in props.highlightedAnswers) {
    return { backgroundColor: props.highlightedAnswers[answer] };
  }
  return {};
}
</script>

<style lang="css" scoped>
.answers {
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
  cursor: pointer;
}

.row:hover {
  filter: brightness(0.9);
}

.row.highlighted {
  font-weight: bold;
}

.answers .row:last-child {
  border-bottom: none;
}

.title {
  font-size: 1.6em;
  margin-bottom: 5px;
}
</style>