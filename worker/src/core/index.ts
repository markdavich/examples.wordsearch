/**
 * Core Module Exports
 *
 * This module exports the platform-agnostic core functionality.
 * Everything exported here works regardless of which platform or AI service you use.
 */

// Main puzzle parser
export { PuzzleParser } from './puzzle-parser';

// Interfaces and types
export type {
  AIAdapter,
  PlatformConfig,
  ParsePuzzleRequest,
  ParsePuzzleResponse,
  ParsePuzzleError,
  ParsePuzzleResult,
} from './interfaces';

// Utility functions
export {
  isImageType,
  isDocumentType,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
} from './interfaces';

// Prompts (in case you want to customize them)
export { IMAGE_PARSE_PROMPT, TEXT_PARSE_PROMPT, getPrompt } from './prompts';
