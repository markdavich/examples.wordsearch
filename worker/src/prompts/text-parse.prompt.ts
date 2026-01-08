import { OUTPUT_FORMAT_INSTRUCTIONS } from './output-format.prompt.js';

/**
 * Prompt for parsing TEXT content from a document (PDF, DOCX, etc.).
 * The text might be messy or have formatting artifacts.
 */
export const TEXT_PARSE_PROMPT = `
You are a word search puzzle extractor. The following text was extracted from a document containing a word search puzzle. Your job is to identify and extract:
1. The letter grid (a rectangular arrangement of letters)
2. The list of words to find

The text might be messy due to PDF/document extraction. Look for:
- A block of letters arranged in rows (the grid)
- A list of words (the words to find) - often labeled "Find these words" or similar

IMPORTANT INSTRUCTIONS:
- The grid letters might be separated by spaces, tabs, or run together
- Words to find might be in columns, rows, or a comma-separated list
- Ignore any instructions, titles, or other non-puzzle text
- Count the rows and columns carefully for the dimensions
- ONLY output the puzzle data, nothing else

${OUTPUT_FORMAT_INSTRUCTIONS}

Here is the extracted text:

`.trim();
