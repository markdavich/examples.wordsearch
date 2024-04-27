export default class WordSearch {
  constructor(file) {
    const dimensions = getDimensions(file);
    this.rows = dimensions.rows;
    this.columns = dimensions.columns;
    this.letters = getLetters(file, this.rows);
    this.words = getWords(file, this.rows);
  }
}

function getDimensions(file) {
  const dims = getLines(file)[0]
    .toLowerCase()
    .split("x");
  return {
    rows: parseInt(dims[0]),
    columns: parseInt(dims[1])
  };
}

function getLetters(file, rows) {
  const result = [];
  const lines = getLines(file);
  for (let i = 1; i <= rows; i++) {
    const l = lines[i].replace(/ /g, "");
    result.push([...l]);
  }
  return result;
}

function getWords(file, rows) {
  const result = [];
  const lines = getLines(file);
  for (let i = rows + 1; i < lines.length; i++) {
    const word = lines[i];
    if (word) {
      result.push(word);
    }
  }
  return result;
}

function getLines(file) {
  return file.split(/\n/);
}
