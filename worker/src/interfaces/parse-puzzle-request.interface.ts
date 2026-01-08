import type { AIProviderType } from './ai-provider.type.js';

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
   */
  aiProvider?: AIProviderType;
}
