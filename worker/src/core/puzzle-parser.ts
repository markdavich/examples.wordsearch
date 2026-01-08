/**
 * Puzzle Parser - Core Business Logic
 *
 * This is the heart of the application. It orchestrates the puzzle parsing
 * process without knowing anything about:
 * - Which platform it's running on (Cloudflare, Vercel, AWS, etc.)
 * - Which AI service is being used (Gemini, OpenAI, Claude, etc.)
 *
 * This follows the Single Responsibility Principle (the "S" in SOLID):
 * This class has one job - coordinate the puzzle parsing process.
 *
 * It also follows the Open/Closed Principle (the "O" in SOLID):
 * It's open for extension (new AI adapters) but closed for modification
 * (we don't need to change this code to add new AI services).
 */

import type {
  AIAdapter,
  PlatformConfig,
  ParsePuzzleRequest,
  ParsePuzzleResult,
} from '../interfaces/index.js';
import { isImageType, isDocumentType } from '../interfaces/index.js';

/**
 * The main puzzle parser class.
 *
 * Usage:
 *   const parser = new PuzzleParser(aiAdapter, platformConfig);
 *   const result = await parser.parse(request);
 */
export class PuzzleParser {
  /**
   * Create a new PuzzleParser instance.
   *
   * @param aiAdapter - The AI service to use for parsing (Gemini, OpenAI, etc.)
   * @param platform - Platform-specific configuration (for secrets, logging)
   */
  constructor(
    private readonly aiAdapter: AIAdapter,
    private readonly platform: PlatformConfig
  ) {}

  /**
   * Parse a puzzle from an image or text document.
   *
   * @param request - The parse request from the frontend
   * @returns A result object with either the puzzle data or an error
   */
  async parse(request: ParsePuzzleRequest): Promise<ParsePuzzleResult> {
    this.platform.log(`Starting puzzle parse with ${this.aiAdapter.name}`, 'info');

    // Validate the request
    const validationError = this.validateRequest(request);
    if (validationError) {
      this.platform.log(`Validation failed: ${validationError}`, 'warn');
      return {
        success: false,
        error: 'Invalid request',
        details: validationError,
      };
    }

    try {
      // Parse based on content type
      let puzzleData: string;

      if (request.contentType === 'image') {
        this.platform.log(`Parsing image (${request.mimeType})`, 'info');
        puzzleData = await this.aiAdapter.parseImage(request.content, request.mimeType);
      } else {
        this.platform.log(`Parsing text document (${request.mimeType})`, 'info');
        puzzleData = await this.aiAdapter.parseText(request.content);
      }

      // Validate the AI response looks like puzzle data
      const formatError = this.validatePuzzleFormat(puzzleData);
      if (formatError) {
        this.platform.log(`AI response validation failed: ${formatError}`, 'warn');
        return {
          success: false,
          error: 'Could not parse puzzle from the provided content',
          details: formatError,
        };
      }

      this.platform.log('Puzzle parsed successfully', 'info');
      return {
        success: true,
        puzzleData: puzzleData.trim(),
        message: `Parsed successfully using ${this.aiAdapter.name}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.platform.log(`Parse error: ${errorMessage}`, 'error');

      return {
        success: false,
        error: 'Failed to parse puzzle',
        details: errorMessage,
      };
    }
  }

  /**
   * Validate the incoming request.
   *
   * @param request - The request to validate
   * @returns An error message if invalid, or null if valid
   */
  private validateRequest(request: ParsePuzzleRequest): string | null {
    if (!request.content) {
      return 'No content provided';
    }

    if (!request.contentType) {
      return 'No content type specified';
    }

    if (!request.mimeType) {
      return 'No MIME type specified';
    }

    if (request.contentType === 'image' && !isImageType(request.mimeType)) {
      return `Unsupported image type: ${request.mimeType}. Supported types: PNG, JPEG, WebP, GIF`;
    }

    if (request.contentType === 'text' && !isDocumentType(request.mimeType)) {
      return `Unsupported document type: ${request.mimeType}. Supported types: TXT, PDF, DOCX`;
    }

    return null;
  }

  /**
   * Validate that the AI response looks like valid puzzle data.
   *
   * We expect:
   * - First line: dimensions (e.g., "10x10")
   * - Next N lines: letter grid (space-separated letters)
   * - Remaining lines: words to find
   *
   * @param puzzleData - The data returned by the AI
   * @returns An error message if invalid, or null if valid
   */
  private validatePuzzleFormat(puzzleData: string): string | null {
    if (!puzzleData || puzzleData.trim().length === 0) {
      return 'AI returned empty response';
    }

    const lines = puzzleData.trim().split('\n');

    if (lines.length < 3) {
      return 'Response too short - expected dimensions, grid, and words';
    }

    // Check first line is dimensions (e.g., "10x10" or "5x8")
    const dimensionPattern = /^\d+x\d+$/i;
    if (!dimensionPattern.test(lines[0].trim())) {
      return `First line should be dimensions (e.g., "10x10"), got: "${lines[0]}"`;
    }

    // Parse dimensions
    const [rows] = lines[0].toLowerCase().split('x').map(Number);

    // Check that we have at least some grid lines
    if (lines.length < rows + 1) {
      return `Expected ${rows} grid rows based on dimensions, but got fewer lines`;
    }

    // Check first grid line looks like space-separated letters
    const firstGridLine = lines[1].trim();
    const gridPattern = /^[A-Za-z](\s+[A-Za-z])*$/;
    if (!gridPattern.test(firstGridLine)) {
      return `Grid lines should be space-separated letters, got: "${firstGridLine}"`;
    }

    return null;
  }
}
