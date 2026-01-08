/**
 * Core Interfaces for the Puzzle Parser API
 *
 * These interfaces define the contracts between different parts of the system.
 * By programming to interfaces (not implementations), we can easily swap out
 * platforms, AI providers, or any other component without changing the core logic.
 *
 * This follows the Dependency Inversion Principle (the "D" in SOLID):
 * High-level modules should not depend on low-level modules.
 * Both should depend on abstractions.
 */

// ============================================================================
// REQUEST & RESPONSE TYPES
// ============================================================================

/**
 * The input that comes from the frontend application.
 * Supports both image files (for OCR) and text files (PDFs, documents).
 */
export interface ParsePuzzleRequest {
  /**
   * The file content encoded as a base64 string.
   * For images: the raw image data
   * For text files: the extracted text content
   */
  content: string;

  /**
   * The type of content being sent.
   * - 'image': A picture of a word search puzzle (PNG, JPG, etc.)
   * - 'text': Text extracted from a document (PDF, DOCX, TXT)
   */
  contentType: 'image' | 'text';

  /**
   * The MIME type of the original file (e.g., 'image/png', 'application/pdf')
   * This helps the AI understand what it's looking at.
   */
  mimeType: string;

  /**
   * Which AI provider to use for parsing.
   * Currently supported: 'gemini'
   * Future: 'openai', 'claude'
   */
  aiProvider?: AIProviderType;
}

/**
 * Supported AI provider types
 */
export type AIProviderType = 'gemini' | 'groq' | 'cloudflare-ai' | 'together' | 'openai' | 'claude';

/**
 * Default AI provider if none specified
 */
export const DEFAULT_AI_PROVIDER: AIProviderType = 'groq';

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

/**
 * The error response when something goes wrong.
 */
export interface ParsePuzzleError {
  success: false;
  error: string;
  details?: string;
}

/**
 * Union type for all possible responses
 */
export type ParsePuzzleResult = ParsePuzzleResponse | ParsePuzzleError;

// ============================================================================
// AI ADAPTER INTERFACE
// ============================================================================

/**
 * Interface for AI service adapters.
 *
 * This follows the Interface Segregation Principle (the "I" in SOLID):
 * Clients should not be forced to depend on interfaces they don't use.
 *
 * Any AI service (Gemini, OpenAI, Claude, etc.) can be used as long as
 * it implements this simple interface.
 */
export interface AIAdapter {
  /**
   * The name of the AI service (for logging and debugging)
   */
  readonly name: string;

  /**
   * Parse an image of a word search puzzle and extract the grid and words.
   *
   * @param imageBase64 - The image encoded as a base64 string
   * @param mimeType - The MIME type of the image (e.g., 'image/png')
   * @returns The extracted puzzle data as a formatted string
   */
  parseImage(imageBase64: string, mimeType: string): Promise<string>;

  /**
   * Parse text content (from a PDF or document) and extract the puzzle data.
   *
   * @param textContent - The raw text extracted from a document
   * @returns The extracted puzzle data as a formatted string
   */
  parseText(textContent: string): Promise<string>;
}

// ============================================================================
// PLATFORM ADAPTER INTERFACE
// ============================================================================

/**
 * Configuration that varies between platforms.
 * Each platform (Cloudflare, Vercel, AWS) has different ways of:
 * - Accessing environment variables / secrets
 * - Handling HTTP requests and responses
 * - Logging and monitoring
 */
export interface PlatformConfig {
  /**
   * Get a secret value (like an API key) from the platform's secrets store.
   *
   * @param key - The name of the secret
   * @returns The secret value, or undefined if not found
   */
  getSecret(key: string): string | undefined;

  /**
   * Log a message (platforms have different logging systems)
   */
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
}

// ============================================================================
// SUPPORTED MIME TYPES
// ============================================================================

/**
 * Image MIME types we support for vision-based parsing
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
] as const;

/**
 * Document MIME types we support for text-based parsing
 */
export const SUPPORTED_DOCUMENT_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
] as const;

/**
 * Check if a MIME type is a supported image type
 */
export function isImageType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType as any);
}

/**
 * Check if a MIME type is a supported document type
 */
export function isDocumentType(mimeType: string): boolean {
  return SUPPORTED_DOCUMENT_TYPES.includes(mimeType as any);
}
