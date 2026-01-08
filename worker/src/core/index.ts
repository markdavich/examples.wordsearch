/**
 * Core Module Exports
 *
 * This module exports the platform-agnostic core functionality.
 * Everything exported here works regardless of which platform or AI service you use.
 */

// Main puzzle parser
export { PuzzleParser } from './puzzle-parser.js';

// Re-export interfaces and types from the interfaces folder
export type {
  AIAdapter,
  PlatformConfig,
  ParsePuzzleRequest,
  ParsePuzzleResponse,
  ParsePuzzleError,
  ParsePuzzleResult,
  AIProviderType,
} from '../interfaces/index.js';

// Re-export utility functions and constants from the interfaces folder
export {
  isImageType,
  isDocumentType,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  DEFAULT_AI_PROVIDER,
} from '../interfaces/index.js';

// Re-export prompts from the prompts folder
export { IMAGE_PARSE_PROMPT, TEXT_PARSE_PROMPT, getPrompt } from '../prompts/index.js';
