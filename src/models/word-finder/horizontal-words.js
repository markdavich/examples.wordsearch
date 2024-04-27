export default class HorizontalWords {
  constructor(lettersGrid) {
    this.columnCount = lettersGrid[0].length;
    this.data = lettersGrid.flat().join(""); // Reduce the grid to a single line string
  }

  find(words) {
    const matches = {};

    words.forEach((word) => {
      const w = word.replace(/ /g, "");
      matches[w] = matches[word] || {};
      matches[w].forward = _findForward(this.data, w);
      matches[w].reverse = _findReverse(this.data, w);
    });

    return _processMatches(matches, this.columnCount);
  }
}

/**
 * Returns an array of indices where word was found in data.
 * @param {string} data - The letters grid as a single line string.
 * @param {string} word - The word to find in data.
 * @returns {number[]}
 */
function _findForward(data, word) {
  return _find(data, word);
}

/**
 * Reverses "word" and returns an array of indices where word was found in data.
 * @param {string} data - The letters grid as a single line string.
 * @param {string} word - The word to find in data.
 * @returns {number[]} stuff
 */
function _findReverse(data, word) {
  return _find(data, [...word].reverse().join(""));
}

/**
 * Returns an array of indices where word was found in data.
 * @param {string} data - The letters grid as a single line string.
 * @param {string} word - The word to find in data.
 * @returns {number[]}
 */
function _find(data, word) {
  const result = [...data.matchAll(new RegExp(word, "gi"))].map(
    (iterator) => iterator.index
  );

  return result;
}

/**
 * Converts the object with word keys to
 * @param {{WORD: {forward: number[], reverse: number[]}} matches
 * @param {number} columnCount The column count of the letters grid
 * @returns {Object.<string, string[]>} Ex: { word1: ["2:3 3:2", "4:6 6:4"]}
 */
function _processMatches(matches, columnCount) {
  //  INPUT
  //  matches: {
  //   WORD: {
  //     forward: [0, 8] -- matches at index 0 and 8
  //     reverse: []     -- has no matches
  //   }
  // }
  //
  // OUTPUT
  // {
  //   WORD: ["R1:C1 R2:C2"]
  // }
  const result = {};

  Object.keys(matches).forEach((key) => {
    const assesment = matches[key];

    if (!_hasMatches(assesment)) {
      return;
    }

    result[key] = [];

    let match = result[key];

    match = match.concat(
      _getMatches(columnCount, key, assesment.forward, true),
      _getMatches(columnCount, key, assesment.reverse, false)
    );

    result[key] = match;
  });

  console.log(result);
  return result;
}

function _hasMatches(assesment) {
  const result = assesment.forward.length > 0 || assesment.reverse.length > 0;
  return result;
}

function _getMatches(columnCount, word, assessment, isForward) {
  // assessment.forward/reverse is an array of indices where "word" was found
  const result = [];

  if (assessment.length === 0) {
    return result;
  }

  assessment.forEach((index) => {
    const mod = index % columnCount;
    const indexGroup = index - mod;
    const rowIndex = indexGroup / columnCount;
    const columnIndex = index - indexGroup;
    const matchOnSameLine = columnIndex + word.length <= columnCount;

    if (!matchOnSameLine) {
      return; // This is equivlent to a for loop continue
    }

    const endIndex = columnIndex + word.length - 1;

    const matchCoords = isForward
      ? `${rowIndex}:${columnIndex} ${rowIndex}:${endIndex}`
      : `${rowIndex}:${endIndex} ${rowIndex}:${columnIndex}`;

    result.push(matchCoords);
  });

  return result;
}
