import HorizontalWords from "./horizontal-words.js";
import VerticalWords from "./vertical-words.js";
import DiagonalWords from "./diagonal-words.js";

export default class WordFinder {
  constructor(lettersGrid, words) {
    this.words = words;
    this.horizontalMatches = new HorizontalWords(lettersGrid).find(words);
    this.verticalMatches = new VerticalWords(lettersGrid).find(words);
    this.diagonalMatches = new DiagonalWords(lettersGrid).find(words);
  }

  get matches() {
    let result = [];

    this.words.forEach((word) => {
      const w = word.replace(/ /g, "");
      result = result.concat(
        _getMatches(w, this.horizontalMatches),
        _getMatches(w, this.verticalMatches),
        _getMatches(w, this.diagonalMatches)
      );
    });

    return result;
  }
}

function _getMatches(word, matches) {
  const result = [];

  if (_isEmpty(word, matches)) {
    return result;
  }

  matches[word].forEach((match) => {
    result.push(`${word} ${match}`);
  });

  return result;
}

function _isEmpty(word, matches) {
  return !(word in matches) || Object.keys(matches[word]).length === 0;
}
