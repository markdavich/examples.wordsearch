import { OUTPUT_FORMAT_INSTRUCTIONS } from './output-format.prompt.js';

/**
 * Prompt for parsing an IMAGE of a word search puzzle.
 * Used when the user uploads a photo or screenshot of a puzzle.
 */
export const IMAGE_PARSE_PROMPT = `
You are a word search puzzle extractor. Your job is to look at this image of a word search puzzle and extract:
1. The letter grid (the box of letters)
2. The list of words to find (usually shown below or beside the grid)

IMPORTANT INSTRUCTIONS:
- Look carefully at EVERY letter in the grid
- The grid might not be perfectly aligned - do your best to read each cell
- Words to find are usually listed separately from the grid
- If you can't read a letter clearly, make your best guess based on context
- Count the rows and columns carefully for the dimensions
- ONLY output the puzzle data, nothing else

${OUTPUT_FORMAT_INSTRUCTIONS}
`.trim();
