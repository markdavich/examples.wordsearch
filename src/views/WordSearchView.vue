<template>
  <div class="word-search-view">
    <div class="col top mr pad">
      <FileInput class="mb shadow" @fileSelected="fileSelected" :label="'Word Search File'" />
      <div class="row mb">
        <AIUpload class="mr shadow" :aiProvider="selectedAiProvider" @puzzleParsed="fileSelected" />
        <Ai class="shadow" v-model="selectedAiProvider" />
      </div>
      <button class="clear-btn mb" @click="clearHighlights">Clear Highlights</button>
      <button class="circle-btn mb" @click="toggleCircles" :class="{ active: showCircles }">
        {{ showCircles ? 'Hide Circles' : 'Circle Answers' }}
      </button>
      <div class="row">
        <WordsToFind
          class="mr"
          :words="words"
          :selectedWord="selectedWord"
          @wordSelected="onWordSelected"
        />
        <Answers
          :answers="answers"
          :highlightedAnswers="highlightedAnswers"
          @answerSelected="onAnswerSelected"
        />
      </div>
    </div>
    <div class="col fill-width">
      <WordSearchGrid
        :letters="letters"
        :highlightedCells="highlightedCells"
        :circles="circleData"
        :hoveredCircle="hoveredCircle"
        @circleHover="onCircleHover"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Components
import FileInput from "@/components/FileInput.vue";
import AIUpload from "@/components/AIUpload.vue";
import Ai from "@/components/Ai.vue";
import WordSearchGrid from "@/components/WordSearchGrid.vue";
import Answers from "@/components/Answers.vue";
import WordsToFind from "@/components/WordsToFind.vue";

// Models
import WordSearch from "@/models/word-search.js";
import WordFinder from "@/models/word-finder";

// Rainbow color palette
const RAINBOW_COLORS = [
  '#FF6B6B', // red
  '#FF9F43', // orange
  '#FECA57', // yellow
  '#48DBFB', // light blue
  '#1DD1A1', // green
  '#5F27CD', // purple
  '#FF6B9D', // pink
  '#00D2D3', // cyan
];

const letters = ref([]);
const words = ref([]);
const answers = ref([]);
const selectedWord = ref(null);
const selectedAiProvider = ref('gemini');
// Map of answer string -> color for highlighted answers
const highlightedAnswers = ref({});
// Circle state
const showCircles = ref(false);
const hoveredCircle = ref(null);

// Compute highlighted cells with colors from all highlighted answers
const highlightedCells = computed(() => {
  // Don't highlight grid cells when hovering circles - the circle fill handles it
  if (showCircles.value && hoveredCircle.value) {
    return [];
  }

  const cells = [];
  for (const [answer, color] of Object.entries(highlightedAnswers.value)) {
    const answerCells = parseAnswerCoords(answer);
    answerCells.forEach(cell => {
      cells.push({ ...cell, color });
    });
  }
  return cells;
});

// Compute circle data for all answers
const circleData = computed(() => {
  if (!showCircles.value) return [];

  return answers.value.map((answer, index) => {
    const parts = answer.split(' ');
    if (parts.length < 3) return null;

    const word = parts[0];
    const [startRow, startCol] = parts[1].split(':').map(Number);
    const [endRow, endCol] = parts[2].split(':').map(Number);

    // Calculate word length from coordinates
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    const wordLength = Math.max(rowDiff, colDiff) + 1;

    return {
      answer,
      word,
      startRow,
      startCol,
      endRow,
      endCol,
      wordLength,
      color: RAINBOW_COLORS[index % RAINBOW_COLORS.length],
    };
  }).filter(Boolean);
});

function fileSelected(file) {
  const wordSearch = new WordSearch(file);
  letters.value = wordSearch.letters;
  words.value = wordSearch.words;

  const finder = new WordFinder(letters.value, words.value);
  answers.value = finder.matches;

  showCircles.value = false;
  hoveredCircle.value = null;
  clearHighlights();
}

function normalizeWord(word) {
  return word.replace(/\s/g, '').toUpperCase();
}

function getAnswerWord(answer) {
  // Extract word from "WORD row:col row:col"
  return answer.split(' ')[0];
}

function onWordSelected(word) {
  clearHighlights();
  selectedWord.value = word;

  // Find all matching answers (word without spaces matches answer word)
  const normalizedWord = normalizeWord(word);
  const matchingAnswers = answers.value.filter(
    answer => getAnswerWord(answer) === normalizedWord
  );

  // Assign rainbow colors to each matching answer
  const newHighlighted = {};
  matchingAnswers.forEach((answer, index) => {
    newHighlighted[answer] = RAINBOW_COLORS[index % RAINBOW_COLORS.length];
  });
  highlightedAnswers.value = newHighlighted;
}

function onAnswerSelected(answer) {
  clearHighlights();

  // Find the matching word in Find These (compare without spaces)
  const answerWord = getAnswerWord(answer);
  const matchingWord = words.value.find(
    word => normalizeWord(word) === answerWord
  );

  if (matchingWord) {
    selectedWord.value = matchingWord;
  }

  // Highlight just this one answer
  highlightedAnswers.value = {
    [answer]: RAINBOW_COLORS[0]
  };
}

function clearHighlights() {
  selectedWord.value = null;
  highlightedAnswers.value = {};
}

function toggleCircles() {
  showCircles.value = !showCircles.value;
  if (!showCircles.value) {
    hoveredCircle.value = null;
    clearHighlights();
  }
}

function onCircleHover(answer) {
  hoveredCircle.value = answer;

  if (answer) {
    const circle = circleData.value.find(c => c.answer === answer);
    if (circle) {
      // Highlight the word in Find These
      const matchingWord = words.value.find(
        word => normalizeWord(word) === circle.word
      );
      if (matchingWord) {
        selectedWord.value = matchingWord;
      }
      // Highlight the answer in the Answers list
      highlightedAnswers.value = {
        [answer]: circle.color
      };
    }
  } else {
    clearHighlights();
  }
}

function parseAnswerCoords(answer) {
  // Format: "WORD row:col row:col"
  const parts = answer.split(' ');
  if (parts.length < 3) return [];

  const [startRow, startCol] = parts[1].split(':').map(Number);
  const [endRow, endCol] = parts[2].split(':').map(Number);

  const cells = [];
  const rowStep = endRow === startRow ? 0 : (endRow > startRow ? 1 : -1);
  const colStep = endCol === startCol ? 0 : (endCol > startCol ? 1 : -1);

  let row = startRow;
  let col = startCol;

  while (true) {
    cells.push({ row, col });
    if (row === endRow && col === endCol) break;
    row += rowStep;
    col += colStep;
  }

  return cells;
}
</script>

<style lang="css" scoped>
.word-search-view {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  padding: var(--padding);
  border: solid var(--light-grey) 1px;
  border-top: none;
}
.row {
  display: flex;
  flex-direction: row;
}
.col {
  display: flex;
  flex-direction: column;
  background-color: var(--white);
}
.top {
  justify-items: flex-start;
  justify-content: flex-start;
}
.mb {
  margin-bottom: 10px;
}
.mr {
  margin-right: 10px;
}
.fill-width {
  flex: 1;
}

.pad {
  padding: 10px;
}

.clear-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid var(--light-grey);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.clear-btn:hover {
  background-color: #e0e0e0;
}

.circle-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid var(--light-grey);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.circle-btn:hover {
  background-color: #e0e0e0;
}

.circle-btn.active {
  background-color: #b3d9ff;
  border-color: #66b3ff;
}

.shadow {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
