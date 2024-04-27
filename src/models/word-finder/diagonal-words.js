import HorizontalWords from "./horizontal-words";

export class Direction {
  static get fromLeft() {
    return "from left";
  }
  static get fromRight() {
    return "from right";
  }
}

export default class DiagonalWords {
  constructor(lettersGrid) {
    this.data = lettersGrid;
    this.rows = this.data.length;
    this.columns = this.data[0].length;
    this.diagonalCount = this.rows + this.columns - 1;
    this._buildDiagonalArrays();
  }

  _buildDiagonalArrays() {
    let columnFactor = this.columns - 1;
    this.fromLeft = this._getEmptyDiagonalArray();
    this.fromRight = this._getEmptyDiagonalArray();

    for (let row = 0; row < this.rows; row++) {
      let shift = row + columnFactor;
      for (let di = row; di < row + this.columns; di++) {
        this.fromLeft[di].push(this.data[row][di - row]);
        this.fromRight[shift--].push(this.data[row][di - row]);
      }
    }

    this._logData();
    this._padArrays(); // This prepares them for HorizontalWords
    this._logData();
  }

  _padArrays() {
    const factor = Math.min(this.rows, this.columns) + 1;
    this.fromLeft.forEach((arr) => {
      arr.push.apply(arr, Array(factor - arr.length).fill(" "));
    });
    this.fromRight.forEach((arr) => {
      arr.push.apply(arr, Array(factor - arr.length).fill(" "));
    });
  }

  _logData() {
    console.log("");
    console.log("-- Data");
    for (let i = 0; i < this.rows; i++) {
      console.log(JSON.stringify(this.data[i]));
    }
    console.log("");
    console.log("-- Diagonal From Left");
    for (let i = 0; i < this.fromLeft.length; i++) {
      console.log(JSON.stringify(this.fromLeft[i]));
    }
    console.log("");
    console.log("-- Diagonal From Right");
    for (let i = 0; i < this.fromRight.length; i++) {
      console.log(JSON.stringify(this.fromRight[i]));
    }
  }

  _getEmptyDiagonalArray() {
    return new Array(this.diagonalCount).fill().map(() => []);
    hd;
  }

  find(words) {
    // output = {
    //   WORD: [matches]
    // }
    const leftMatches = new HorizontalWords(this.fromLeft).find(words);
    const rightMatches = new HorizontalWords(this.fromRight).find(words);
    const lProcessed = this._processMatches(leftMatches, Direction.fromLeft);
    const rProcessed = this._processMatches(rightMatches, Direction.fromRight);
    return this._combineLeftRight(lProcessed, rProcessed);
  }

  _combineLeftRight(lProcessed, rProcessed) {
    const result = {};
    Object.keys(lProcessed).forEach((word) => {
      result[word] = result[word] || [];
      result[word] = result[word].concat(lProcessed[word]);
    });
    Object.keys(rProcessed).forEach((word) => {
      result[word] = result[word] || [];
      result[word] = result[word].concat(rProcessed[word]);
    });
    return result;
  }

  _processMatches(unprocessedMatches, direction) {
    const result = {};
    Object.keys(unprocessedMatches).forEach((word) => {
      result[word] = result[word] || [];
      const matches = unprocessedMatches[word];
      matches.forEach((match) => {
        const coords = match.split(" ");
        const initialMatch = {
          word: word,
          ri: parseInt(coords[0].split(":")[0]),
          ci: parseInt(coords[0].split(":")[1]),
          rf: parseInt(coords[1].split(":")[0]),
          cf: parseInt(coords[1].split(":")[1])
        };
        switch (direction) {
          case Direction.fromLeft:
            result[word].push(this._processLeft(initialMatch));
            break;
          case Direction.fromRight:
            result[word].push(this._processRight(initialMatch));
        }
      });
    });
    return result;
  }

  _processLeft(initialMatch) {
    // This translation starts from the right side of the grid being index 0
    // The top of the grid remains at index 0
    // ri = initial row equivalent to diagonalIndex
    // ci = initial column
    // rf = final row = ri because they are matched horizontally
    // cf = final column
    //
    // All we are doing here is converting the horizontal
    // matches to diagonal matches
    const { word, ri: row, ci: start, cf: end } = initialMatch;
    let absoluteTop, absoluteBottom, startColumn, endColumn, offset;

    if (row <= this.columns - 1) {
      absoluteTop = Math.min(start, end);
      startColumn =
        start < end ? row - absoluteTop : row - absoluteTop - word.length + 1;
      endColumn =
        start < end ? startColumn - word.length + 1 : row - absoluteTop;
    } else {
      offset = row - this.columns + 1;
      absoluteTop = offset + Math.min(start, end);
      startColumn = this.columns - start - 1;
      endColumn = this.columns - end - 1;
    }

    absoluteBottom = absoluteTop + word.length - 1;

    let result = "";
    if (startColumn < endColumn) {
      // Word is reversed
      result = `${absoluteBottom}:${startColumn} ${absoluteTop}:${endColumn}`;
    } else {
      result = `${absoluteTop}:${startColumn} ${absoluteBottom}:${endColumn}`;
    }
    return result;
  }

  _processRight(initialMatch) {
    // See notes on process left
    const { word, ri: row, ci: start, cf: end } = initialMatch;
    let absoluteTop, absoluteBottom, startColumn, endColumn, offset;

    if (row > this.columns - 1) {
      absoluteTop = row - (this.columns - 1);
      startColumn = start < end ? start : end;
      endColumn = start < end ? end : start;
    } else {
      offset = this.columns - 1 - row;
      absoluteTop = offset + Math.min(start, end);
      startColumn = start + offset;
      endColumn = end + offset;
    }

    absoluteBottom = absoluteTop + word.length - 1;

    let result = "";
    if (startColumn > endColumn) {
      // Word is reversed
      result = `${absoluteBottom}:${startColumn} ${absoluteTop}:${endColumn}`;
    } else {
      result = `${absoluteTop}:${startColumn} ${absoluteBottom}:${endColumn}`;
    }
    return result;
  }
}
