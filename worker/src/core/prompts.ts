/**
 * AI Prompts for Puzzle Parsing
 *
 * These prompts are carefully crafted to get consistent, parseable output
 * from AI models. The prompts are separated from the code so they can be
 * easily tweaked and improved without changing the business logic.
 */

/**
 * The expected output format, shared across all prompts.
 * This ensures consistency regardless of which prompt is used.
 */
const OUTPUT_FORMAT_INSTRUCTIONS = `
Return ONLY the puzzle data in this EXACT format (no other text, no explanations, no markdown):

<dimensions>
<grid>
<words>

Where:
- <dimensions> is the grid size as "ROWSxCOLUMNS" (e.g., "10x10" or "15x12")
- <grid> is the letter grid with EACH ROW on its own line, letters separated by SINGLE SPACES
- <words> is the list of words to find, ONE WORD PER LINE

Example output for a 3x3 puzzle:
3x3
A B C
D E F
G H I
CAT
DOG
BEE
`.trim();

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

/**
 * Get the appropriate prompt based on content type.
 *
 * @param contentType - Whether we're parsing an image or text
 * @returns The prompt string to send to the AI
 */
export function getPrompt(contentType: 'image' | 'text'): string {
  switch (contentType) {
    case 'image':
      return IMAGE_PARSE_PROMPT;
    case 'text':
      return TEXT_PARSE_PROMPT;
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}
