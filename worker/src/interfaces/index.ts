/**
 * Interfaces Module
 *
 * This module exports all interfaces and types used throughout the application.
 * Each type is defined in its own file following the "one type per file" principle.
 */

// AI Adapter
export type { AIAdapter } from './ai-adapter.interface.js';

// AI Provider
export type { AIProviderType } from './ai-provider.type.js';
export { DEFAULT_AI_PROVIDER } from './ai-provider.type.js';

// Request/Response
export type { ParsePuzzleRequest } from './parse-puzzle-request.interface.js';
export type { ParsePuzzleResponse } from './parse-puzzle-response.interface.js';
export type { ParsePuzzleError } from './parse-puzzle-error.interface.js';
export type { ParsePuzzleResult } from './parse-puzzle-result.type.js';

// Platform
export type { PlatformConfig } from './platform-config.interface.js';

// MIME Types
export {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  isImageType,
  isDocumentType,
} from './mime-types.js';
