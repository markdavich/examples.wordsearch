/**
 * Configuration for the Cloudflare AI adapter
 */
export interface CloudflareAIAdapterConfig {
  /**
   * The AI binding from Cloudflare Workers environment.
   * This is passed from the worker's env object.
   */
  ai: Ai;

  /**
   * Which model to use for vision tasks.
   * Default: '@cf/llava-hf/llava-1.5-7b-hf'
   */
  visionModel?: string;

  /**
   * Which model to use for text tasks.
   * Default: '@cf/meta/llama-3.1-8b-instruct'
   */
  textModel?: string;
}
