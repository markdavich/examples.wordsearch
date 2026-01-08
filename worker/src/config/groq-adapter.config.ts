/**
 * Configuration options for the Groq adapter
 */
export interface GroqAdapterConfig {
  /**
   * Your Groq API key (get one free at https://console.groq.com)
   */
  apiKey: string;

  /**
   * Which Groq model to use for vision tasks.
   * Default: 'meta-llama/llama-4-scout-17b-16e-instruct'
   *
   * Options:
   * - 'meta-llama/llama-4-scout-17b-16e-instruct' - Fast, good quality
   * - 'meta-llama/llama-4-maverick-17b-128e-instruct' - Best quality, slower
   */
  visionModel?: string;

  /**
   * Which Groq model to use for text-only tasks.
   * Default: 'llama-3.3-70b-versatile'
   */
  textModel?: string;
}
