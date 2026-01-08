# Performance Discussion Checkpoint

**Date**: 2026-01-07
**Topic**: Optimizing word search for large files (96MB+, 5000x10000 grid, 11K words)

---

## Problem Summary

The app hangs when loading `big.txt` (96MB test file). Root causes identified:

1. **Repeated file parsing** - `getLines()` called 3x, creating ~288MB of string arrays
2. **Character-by-character allocation** - 50 million single-char strings
3. **Diagonal array duplication** - Two full copies of grid for diagonal search
4. **String flattening** - `HorizontalWords` creates 50M char string
5. **Console logging** - `_logData()` JSON.stringifies entire dataset multiple times

Current complexity: **O(words × grid_size)** = 550 billion operations for this test case

---

## Solutions Explored

### Approach A: Streaming (Solves Memory)
- Use `ReadableStream` / `Blob.slice()` to process chunks
- Memory stays bounded at O(chunk_size)
- Still O(words × grid) for searching

### Approach B: Aho-Corasick Trie (Solves CPU)
- Build automaton from all words once
- Scan grid once, match all words simultaneously
- Complexity: O(grid_size + pattern_length) regardless of word count
- Industry standard: Unix fgrep, intrusion detection, DNA sequencing, spam filters

### Optimal: Combine Both
- Stream file in chunks
- Feed chunks to Aho-Corasick automaton
- Memory: O(trie_size + chunk_size)
- Time: O(n + m) - approximately **10,000x faster** for this use case

---

## Key Files to Modify

- `src/models/word-search.js` - File parsing (streaming)
- `src/models/word-finder/index.js` - Orchestration
- `src/models/word-finder/horizontal-words.js` - Uses regex per word
- `src/models/word-finder/diagonal-words.js` - Builds duplicate arrays, has console.log

---

## Open Questions (Where We Left Off)

1. **Trie construction**: How does the Aho-Corasick automaton get built? (failure links, output links)
2. **Chunk boundaries**: What happens when a word like "HELLO" spans two chunks?
3. **Diagonal handling**: How to apply Aho-Corasick to diagonal traversal without materializing diagonal arrays?

---

## Test File

Generated `big.txt` for testing:
- 5000 rows x 10000 columns
- 11,000 words to find
- 96MB file size

---

## Resources

- [Aho-Corasick - Wikipedia](https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm)
- [Aho-Corasick - GeeksforGeeks](https://www.geeksforgeeks.org/dsa/aho-corasick-algorithm-pattern-searching/)
- [Toptal - Aho-Corasick Algorithm](https://www.toptal.com/algorithms/aho-corasick-algorithm)
- [Parsing Large Files with Streams API](https://medium.com/@AlexanderObregon/parsing-large-files-in-the-browser-using-javascript-streams-api-78cb88f30d23)
- [Handling Large Files in JavaScript](https://accreditly.io/articles/handling-large-files-in-javascript)
