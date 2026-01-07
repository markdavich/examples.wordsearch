# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server at http://localhost:5173
npm run build  # Production build
npm run preview # Preview production build
```

No test framework is currently configured.

## Architecture Overview

This is a Vue 3 + Vite word search puzzle solver. Users upload a text file containing a letter grid and words to find; the app displays the grid and outputs word locations.

### Input File Format
```
5x5
H A S D F
G E Y B H
...
HELLO
GOOD
```
First line: dimensions (rows x columns). Next N lines: space-separated letter grid. Remaining lines: words to find.

### Core Data Flow

1. **File Upload** (`WordSearchView.vue`): Main view orchestrates the entire flow
2. **Parsing** (`src/models/word-search.js`): `WordSearch` class parses uploaded file into `letters` (2D array), `words` (array), and dimensions
3. **Finding** (`src/models/word-finder/`): `WordFinder` class aggregates results from three specialized finders:
   - `HorizontalWords` - flattens grid to string, uses regex matching
   - `VerticalWords` - transposes grid, then uses horizontal approach
   - `DiagonalWords` - uses padded matrix for diagonal extraction
4. **Output**: Matches formatted as `WORD row:col row:col` (start and end positions)

### Key Utility

`src/models/matrix.js`: Matrix class handles grid transformations (transpose, padding for non-square grids) used by diagonal word finding.

### Routing

- `/` - WordSearchView (main puzzle solver)
- `/about` - About page (lazy-loaded)
