<template>
  <div class="word-search-view">
    <div class="col top mr pad">
      <FileInput class="mb shadow" @fileSelected="fileSelected" :label="'Word Search File'" />
      <div class="row">
        <WordsToFind class="mr" :words="words" />
        <Answers :answers="answers" />
      </div>
    </div>
    <div class="col fill-width">
      <WordSearchGrid :letters="letters" />
    </div>
  </div>
</template>

<script>
import Vue from "vue";

// Components
import FileInput from "@/components/FileInput.vue";
import WordSearchGrid from "@/components/WordSearchGrid.vue";
import Answers from "@/components/Answers.vue";
import WordsToFind from "@/components/WordsToFind.vue";

// Models
import WordSearch from "@/models/word-search.js";
import WordFinder from "@/models/word-finder";

export default Vue.extend({
  name: "WordSearchView",
  components: {
    FileInput,
    WordSearchGrid,
    Answers,
    WordsToFind,
  },
  data() {
    return {
      file: "",
      letters: [],
      words: [],
      answers: ["a", "b"],
    };
  },
  methods: {
    fileSelected(file) {
      const wordSearch = new WordSearch(file);
      this.letters = wordSearch.letters;
      this.words = wordSearch.words;

      const finder = new WordFinder(this.letters, this.words);

      this.answers = finder.matches;
    },
  },
});
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
</style>
