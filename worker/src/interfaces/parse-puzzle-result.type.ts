import type { ParsePuzzleResponse } from './parse-puzzle-response.interface.js';
import type { ParsePuzzleError } from './parse-puzzle-error.interface.js';

/**
 * Union type for all possible responses
 */
export type ParsePuzzleResult = ParsePuzzleResponse | ParsePuzzleError;
