/**
 * The expected output format, shared across all prompts.
 * This ensures consistency regardless of which prompt is used.
 */
export const OUTPUT_FORMAT_INSTRUCTIONS = `
Return ONLY the puzzle data in this EXACT format (no other text, no explanations, no markdown):

CRITICAL FORMAT RULES:
1. First line: dimensions as ROWSxCOLUMNS (e.g., "10x10" or "15x12")
2. Next N lines: the letter grid - EACH ROW must have SPACES BETWEEN EVERY LETTER (e.g., "A B C D E")
3. After ALL grid rows: the words to find, ONE WORD PER LINE with NO SPACES

HOW TO DISTINGUISH GRID FROM WORDS:
- Grid rows have SPACES between each letter: "H E L L O"
- Words have NO spaces, just the word: "HELLO"
- The grid section has EXACTLY the number of rows specified in dimensions
- Words come AFTER all grid rows are complete

GRID CONSISTENCY RULES:
- If dimensions are "20x18", every row must have EXACTLY 18 letters
- ALL rows must have the SAME number of columns - no exceptions
- Double-check each row has the correct letter count before outputting

Example output for a 5x5 puzzle with 3 words to find:
5x5
H A S D F
G E Y B H
J K L Z X
C V B L N
G O O D O
HELLO
GOOD
BYE

In this example:
- "5x5" means 5 rows of grid
- Lines 2-6 are the grid (5 rows, each with spaces between letters)
- Lines 7-9 are the words to find (no spaces, just the word)
`.trim();
