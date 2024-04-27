import Matrix from "@/models/matrix.js";

export default class VerticalWords {
  constructor(lettersGrid) {
    this.columnCount = lettersGrid[0].length;
    const tranposed = Matrix.transpose(lettersGrid);
    this.data = tranposed.flat().join("");
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

function _findForward(data, word) {
  return _find(data, word);
}

function _findReverse(data, word) {
  return _find(data, [...word].reverse().join(""));
}

function _find(data, word) {
  const result = [...data.matchAll(new RegExp(word, "gi"))].map(
    (iterator) => iterator.index
  );

  return result;
}

function _processMatches(matches, columnCount) {
  //  matches: {
  //   WORD: {
  //     forward: [0, 8] -- matches at index 0 and 8
  //     reverse: []     -- has no matches
  //   }
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
      return;
    }

    const endIndex = columnIndex + word.length - 1;

    const matchCoords = isForward
      ? `${columnIndex}:${rowIndex} ${endIndex}:${rowIndex}`
      : `${endIndex}:${rowIndex} ${columnIndex}:${rowIndex}`;

    result.push(matchCoords);
  });

  return result;
}

/*
  Data     Diagonal   From     From
  Array    Array      Left     Right
  ----------------------------------
  0 1 2    0: []      0        2        
  1 2 3    1: []      1 1      1 3
  2 3 4    2: []      2 2 2    0 2 4
  3 4 5    3: []      3 3 3    1 3 5
           4: []      4 4      2 4
           5: []      5        3
*/
