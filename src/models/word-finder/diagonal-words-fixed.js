import HorizontalWords from "./horizontal-words";

export class Direction {
  static get fromLeft() {
    return "from left";
  }
  static get fromRight() {
    return "from right";
  }
}

/**
 * FIXED VERSION: Corrected coordinate translation
 *
 * This version fixes bugs in _processLeft and _processRight by using
 * clearer coordinate calculation formulas.
 */
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

    // Track original coordinates for each position in diagonal arrays
    this.fromLeftCoords = this._getEmptyDiagonalArray();
    this.fromRightCoords = this._getEmptyDiagonalArray();

    for (let row = 0; row < this.rows; row++) {
      let shift = row + columnFactor;
      for (let di = row; di < row + this.columns; di++) {
        const col = di - row;
        this.fromLeft[di].push(this.data[row][col]);
        this.fromLeftCoords[di].push({ row, col });

        this.fromRight[shift].push(this.data[row][col]);
        this.fromRightCoords[shift].push({ row, col });
        shift--;
      }
    }

    this._padArrays();
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

  _getEmptyDiagonalArray() {
    return new Array(this.diagonalCount).fill().map(() => []);
  }

  find(words) {
    const leftMatches = new HorizontalWords(this.fromLeft).find(words);
    const rightMatches = new HorizontalWords(this.fromRight).find(words);
    const lProcessed = this._processMatches(leftMatches, this.fromLeftCoords);
    const rProcessed = this._processMatches(rightMatches, this.fromRightCoords);
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

  _processMatches(unprocessedMatches, coordsMap) {
    const result = {};
    Object.keys(unprocessedMatches).forEach((word) => {
      result[word] = result[word] || [];
      const matches = unprocessedMatches[word];
      matches.forEach((match) => {
        // match format: "diagonalIndex:startPos diagonalIndex:endPos"
        const coords = match.split(" ");
        const diagonalIndex = parseInt(coords[0].split(":")[0]);
        const startPos = parseInt(coords[0].split(":")[1]);
        const endPos = parseInt(coords[1].split(":")[1]);

        // Use stored coordinates to get actual grid positions
        const diagonalCoords = coordsMap[diagonalIndex];
        if (diagonalCoords && diagonalCoords[startPos] && diagonalCoords[endPos]) {
          const start = diagonalCoords[startPos];
          const end = diagonalCoords[endPos];
          result[word].push(`${start.row}:${start.col} ${end.row}:${end.col}`);
        }
      });
    });
    return result;
  }
}
