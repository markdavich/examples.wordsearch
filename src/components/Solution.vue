<template>
    <div>
        <!-- 3x3 Grid -->
        <div style="display: inline-block;">
            <div class="grid" data-columns="3">
                <!-- Column headers -->
                <div class="header"></div> <!-- Empty cell for alignment -->
                <div class="header" v-for="colIndex in 3" :key="'3x3-header-' + colIndex">
                    {{ colIndex - 1 }}
                </div>

                <!-- Rows with row headers and cells -->
                <template v-for="rowIndex in 3" :key="'3x3-row-header-' + rowIndex">
                    <div class="row-header">
                        {{ rowIndex - 1 }}
                    </div>
                    <div class="cell" v-for="colIndex in 3" :key="'3x3-cell-' + rowIndex + '-' + colIndex">
                        {{ rowIndex - 1 + colIndex - 1 }}
                    </div>
                </template>
            </div>

            <br>

            <!-- 3x2 Grid -->
            <div class="grid" data-columns="2">
                <!-- Column headers -->
                <div class="header"></div> <!-- Empty cell for alignment -->
                <div class="header" v-for="colIndex in 2" :key="'3x2-header-' + colIndex">
                    {{ colIndex - 1 }}
                </div>

                <!-- Rows with row headers and cells -->
                <template v-for="rowIndex in 3" :key="'3x2-row-header-' + rowIndex">
                    <div class="row-header">
                        {{ rowIndex - 1 }}
                    </div>
                    <div class="cell" v-for="colIndex in 2" :key="'3x2-cell-' + rowIndex + '-' + colIndex"
                        style="width: 46px; height: 46px;">
                        {{ rowIndex - 1 + colIndex - 1 }}
                    </div>
                </template>
            </div>

            <br>

            <!-- 2x3 Grid -->
            <div class="grid" data-columns="3">
                <!-- Column headers -->
                <div class="header"></div> <!-- Empty cell for alignment -->
                <div class="header" v-for="colIndex in 3" :key="'2x3-header-' + colIndex">
                    {{ colIndex - 1 }}
                </div>

                <!-- Rows with row headers and cells -->
                <template v-for="rowIndex in 2" :key="'2x3-row-header-' + rowIndex">
                    <div class="row-header">
                        {{ rowIndex - 1 }}
                    </div>
                    <div class="cell" v-for="colIndex in 3" :key="'2x3-cell-' + rowIndex + '-' + colIndex">
                        {{ rowIndex - 1 + colIndex - 1 }}
                    </div>
                </template>
            </div>
        </div>

        <br>
        <br>

        <div>
            <h2>See the <code>models</code> folder for the algorithm I developed</h2>
            <code>models > word-finder > diagonal-words.js > DiagonalWords._buildDiagonalArrays</code>
            <!-- Explanation of Diagonal Extraction -->
            <pre class="explanation">
<code>Diagonal Count = Rows + Columns - 1</code>
<code>     Max Index = Rows + Columns - 2</code>
<code>
const matrix = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
];
const rows = matrix.length;
const columns = matrix[0].length;
const diagonalCount = rows + columns - 1; // Number of diagonals
const diagonals = Array.from({ length: diagonalCount }, () => []);

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
        // Calculate the diagonal index
        const diagonalIndex = i + j;
        if (diagonalIndex < diagonalCount) {
            // Add the current cell to the diagonal array
            diagonals[diagonalIndex].push(matrix[i][j]);
        }
    }
}</code></pre>

            <!-- Explanation of Code -->
            <div class="explanation">
                <p>
                    The code above calculates the diagonals of a 2D matrix. Each diagonal is identified by its index,
                    which is the sum of the row and column indices of the matrix element. The diagonals are stored in an
                    array where each index corresponds to a diagonal.
                </p>
                <p>
                    For example, given the matrix:
                </p>
                <pre>
    [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]
    ]
            </pre>
                <p>
                    The diagonals would be:
                </p>
                <pre>
    [
        [0],       // Diagonal 0
        [1, 3],    // Diagonal 1
        [2, 4, 6], // Diagonal 2
        [5, 7],    // Diagonal 3
        [8]        // Diagonal 4
    ]
            </pre>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Solution",
};
</script>

<style scoped>
.grid {
    display: grid;
    gap: 5px;
    text-align: center;
}

.grid[data-columns="3"] {
    grid-template-columns: auto repeat(3, 1fr); /* Add an extra column for row headers */
}

.grid[data-columns="2"] {
    grid-template-columns: auto repeat(2, 46px); /* Add an extra column for row headers with fixed cell size */
}

.header {
    font-weight: bold;
    border-bottom: 2px solid #000;
}

.row-header {
    font-weight: bold;
    border-right: 2px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cell {
    border: 1px solid #ccc;
    width: 46px; /* Fixed width for square cells */
    height: 46px; /* Fixed height for square cells */
    aspect-ratio: 1 / 1; /* Ensures the cell is square */
    display: flex;
    align-items: center;
    justify-content: center;
}

.explanation {
    margin-top: 20px;
    font-size: 14px;
    color: #555;
    text-align: left;
    background-color: #f9f9f9;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

pre {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    font-family: monospace;
}

code {
    font-family: monospace;
    background-color: #eaeaea;
    padding: 2px 4px;
    border-radius: 3px;
}
</style>
