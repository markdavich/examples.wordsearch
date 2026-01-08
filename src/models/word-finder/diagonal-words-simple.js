/**
 * SIMPLE VERSION: Direct diagonal search without complex transformations
 *
 * This implementation directly iterates through all diagonals and searches
 * for words, avoiding the complex coordinate translation of the original.
 *
 * Two diagonal directions:
 * - Down-Right (↘): row increases, col increases
 * - Down-Left (↙): row increases, col decreases
 */
export default class DiagonalWords {
  constructor(lettersGrid) {
    this.grid = lettersGrid;
    this.rows = lettersGrid.length;
    this.cols = lettersGrid[0].length;
  }

  find(words) {
    const results = {};

    words.forEach((word) => {
      const normalizedWord = word.replace(/ /g, "").toUpperCase();
      results[normalizedWord] = [];

      // Search both diagonal directions
      const downRightMatches = this._findInDirection(normalizedWord, 1, 1);   // ↘
      const downLeftMatches = this._findInDirection(normalizedWord, 1, -1);   // ↙

      results[normalizedWord].push(...downRightMatches, ...downLeftMatches);
    });

    return results;
  }

  /**
   * Search for word in a diagonal direction
   * @param {string} word - Word to find
   * @param {number} rowDir - Row direction (1 = down)
   * @param {number} colDir - Column direction (1 = right, -1 = left)
   */
  _findInDirection(word, rowDir, colDir) {
    const matches = [];
    const wordLen = word.length;
    const reversedWord = [...word].reverse().join("");

    // Try starting from every cell
    for (let startRow = 0; startRow < this.rows; startRow++) {
      for (let startCol = 0; startCol < this.cols; startCol++) {
        // Check if word fits in this direction
        const endRow = startRow + (wordLen - 1) * rowDir;
        const endCol = startCol + (wordLen - 1) * colDir;

        if (endRow < 0 || endRow >= this.rows || endCol < 0 || endCol >= this.cols) {
          continue;
        }

        // Extract diagonal string
        let diagonalStr = "";
        for (let i = 0; i < wordLen; i++) {
          const r = startRow + i * rowDir;
          const c = startCol + i * colDir;
          diagonalStr += this.grid[r][c];
        }

        // Check forward match
        if (diagonalStr.toUpperCase() === word) {
          matches.push(`${startRow}:${startCol} ${endRow}:${endCol}`);
        }

        // Check reverse match
        if (diagonalStr.toUpperCase() === reversedWord) {
          matches.push(`${endRow}:${endCol} ${startRow}:${startCol}`);
        }
      }
    }

    return matches;
  }
}
