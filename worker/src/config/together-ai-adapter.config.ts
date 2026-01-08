/**
 * Configuration options for the Together AI adapter
 */
export interface TogetherAIAdapterConfig {
  /**
   * Your Together AI API key (get one at https://api.together.xyz/)
   */
  apiKey: string;

  /**
   * Which model to use for vision tasks.
   * Default: 'meta-llama/Llama-Vision-Free' (free tier)
   */
  visionModel?: string;

  /**
   * Which model to use for text-only tasks.
   * Default: 'meta-llama/Llama-3.3-70B-Instruct-Turbo'
   */
  textModel?: string;
}
