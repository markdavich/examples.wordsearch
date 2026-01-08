/**
 * The successful response returned to the frontend.
 * This matches the format expected by the WordSearch parser in the Vue app.
 */
export interface ParsePuzzleResponse {
  /**
   * Whether the parsing was successful
   */
  success: true;

  /**
   * The parsed puzzle data in the format the Vue app expects:
   * - First line: dimensions (e.g., "10x10")
   * - Next N lines: space-separated letter grid
   * - Remaining lines: words to find
   */
  puzzleData: string;

  /**
   * Optional message providing additional context
   */
  message?: string;
}
