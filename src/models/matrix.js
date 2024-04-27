// An attemt a enumerations
export class MatrixShape {
  static get tall() {
    return "tall";
  }
  static get wide() {
    return "wide";
  }
  static get square() {
    return "square";
  }
}

// This makes a square matrix
export default class Matrix {
  constructor(matrix) {
    this.matrix = matrix;
    this.rows = matrix.length;
    this.columns = matrix[0].length;
  }
  get shape() {
    const r = this.rows;
    const c = this.columns;

    if (r > c) {
      return MatrixShape.tall;
    } else if (c > r) {
      return MatrixShape.wide;
    }
    return MatrixShape.square;
  }
  get padded() {
    switch (this.shape) {
      case MatrixShape.square:
        return this.values;
      case MatrixShape.tall:
        let m = this.values;
        _padTallMatrix(this.values); // mutates m
        return m;
      case MatrixShape.wide:
        let t = Matrix.transpose(this.values);
        _padTallMatrix(t); // mutates t
        t = Matrix.transpose(t);
        return t;
    }
  }
  get values() {
    return _copyMatrix(this.matrix);
  }
  static transpose(matrix) {
    // col is unused, but we need access to the index of in the map function
    return matrix[0].map((col, i) => matrix.map((row) => row[i]));
  }
}

// This mutates
function _padTallMatrix(matrix) {
  const columns = matrix[0].length;
  const padding = Array(columns).fill("");
  for (let i = 0; i < columns - 1; i++) {
    matrix.unshift(padding);
    matrix.push(padding);
  }
}

function _copyMatrix(matrix) {
  return matrix.map((rows) => rows.slice());
}
