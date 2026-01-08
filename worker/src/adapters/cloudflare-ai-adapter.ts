/**
 * Cloudflare Workers AI Adapter
 *
 * This adapter uses Cloudflare's built-in AI capabilities.
 * No external API key needed - it uses your Cloudflare account's AI allocation.
 *
 * Cloudflare Workers AI provides:
 * - 10,000 neurons/day on the free tier
 * - Low latency (runs on Cloudflare's edge)
 * - No cold starts
 * - Vision models like LLaVA
 *
 * To enable: Add the AI binding to wrangler.toml:
 *   [ai]
 *   binding = "AI"
 *
 * Documentation: https://developers.cloudflare.com/workers-ai/
 */

import type { AIAdapter } from '../interfaces/index.js';
import type { CloudflareAIAdapterConfig } from '../config/index.js';
import { IMAGE_PARSE_PROMPT, TEXT_PARSE_PROMPT } from '../prompts/index.js';

export type { CloudflareAIAdapterConfig } from '../config/index.js';

/**
 * Cloudflare Workers AI Adapter implementation
 */
export class CloudflareAIAdapter implements AIAdapter {
  readonly name = 'Cloudflare AI (LLaVA)';

  private readonly ai: Ai;
  private readonly visionModel: string;
  private readonly textModel: string;

  constructor(config: CloudflareAIAdapterConfig) {
    if (!config.ai) {
      throw new Error('Cloudflare AI binding is required. Add [ai] binding to wrangler.toml');
    }

    this.ai = config.ai;
    this.visionModel = config.visionModel || '@cf/llava-hf/llava-1.5-7b-hf';
    this.textModel = config.textModel || '@cf/meta/llama-3.1-8b-instruct';
  }

  /**
   * Parse an image of a word search puzzle using Cloudflare's LLaVA model.
   *
   * @param imageBase64 - The image encoded as base64
   * @param mimeType - The image MIME type (e.g., 'image/png')
   * @returns The extracted puzzle data as a string
   */
  async parseImage(imageBase64: string, mimeType: string): Promise<string> {
    // Convert base64 to Uint8Array for Cloudflare AI
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const response = await this.ai.run(this.visionModel as Parameters<typeof this.ai.run>[0], {
      image: [...bytes],
      prompt: IMAGE_PARSE_PROMPT,
      max_tokens: 4096,
    } as any);

    const text = (response as { description?: string }).description;
    if (!text) {
      throw new Error('Cloudflare AI returned an empty response');
    }

    return text;
  }

  /**
   * Parse text content from a document using Cloudflare's Llama model.
   *
   * @param textContent - The extracted text from a document
   * @returns The extracted puzzle data as a string
   */
  async parseText(textContent: string): Promise<string> {
    const response = await this.ai.run(this.textModel as Parameters<typeof this.ai.run>[0], {
      prompt: TEXT_PARSE_PROMPT + '\n\n' + textContent,
      max_tokens: 4096,
    } as any);

    const text = (response as { response?: string }).response;
    if (!text) {
      throw new Error('Cloudflare AI returned an empty response');
    }

    return text;
  }
}
