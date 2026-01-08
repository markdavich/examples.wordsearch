/**
 * Configuration options for the Gemini adapter
 */
export interface GeminiAdapterConfig {
  /**
   * Your Gemini API key (get one free at https://ai.google.dev)
   */
  apiKey: string;

  /**
   * Which Gemini model to use.
   * Default: 'gemini-2.0-flash' (good balance of speed and quality)
   *
   * Options:
   * - 'gemini-2.0-flash' - Fast, good for most use cases
   * - 'gemini-1.5-pro' - Higher quality, slower
   * - 'gemini-1.5-flash' - Previous generation flash model
   */
  model?: string;
}
