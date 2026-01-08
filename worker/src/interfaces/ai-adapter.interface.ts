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
