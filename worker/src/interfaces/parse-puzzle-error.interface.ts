/**
 * The error response when something goes wrong.
 */
export interface ParsePuzzleError {
  success: false;
  error: string;
  details?: string;
}
