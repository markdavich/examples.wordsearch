/**
 * Together AI Adapter
 *
 * This adapter implements the AIAdapter interface using Together AI's API.
 * Together AI provides access to many open-source models with fast inference.
 *
 * Together AI was chosen because:
 * - $5 free credits for new accounts
 * - Great vision models (Llama Vision, etc.)
 * - Fast inference
 * - OpenAI-compatible API
 *
 * Get your API key at: https://api.together.xyz/
 */

import type { AIAdapter } from '../interfaces/index.js';
import type { TogetherAIAdapterConfig } from '../config/index.js';
import { IMAGE_PARSE_PROMPT, TEXT_PARSE_PROMPT } from '../prompts/index.js';

export type { TogetherAIAdapterConfig } from '../config/index.js';

/**
 * Together AI API request structure (OpenAI-compatible)
 */
interface TogetherRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }>;
  max_tokens?: number;
  temperature?: number;
}

/**
 * Together AI API response structure
 */
interface TogetherResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
  };
}

/**
 * Together AI Adapter implementation
 */
export class TogetherAIAdapter implements AIAdapter {
  readonly name = 'Together AI (Llama Vision)';

  private readonly apiKey: string;
  private readonly visionModel: string;
  private readonly textModel: string;
  private readonly baseUrl = 'https://api.together.xyz/v1/chat/completions';

  constructor(config: TogetherAIAdapterConfig) {
    if (!config.apiKey) {
      throw new Error('Together AI API key is required');
    }

    this.apiKey = config.apiKey;
    this.visionModel = config.visionModel || 'meta-llama/Llama-Vision-Free';
    this.textModel = config.textModel || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
  }

  /**
   * Parse an image of a word search puzzle using Together AI's vision model.
   *
   * @param imageBase64 - The image encoded as base64
   * @param mimeType - The image MIME type (e.g., 'image/png')
   * @returns The extracted puzzle data as a string
   */
  async parseImage(imageBase64: string, mimeType: string): Promise<string> {
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const request: TogetherRequest = {
      model: this.visionModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
            {
              type: 'text',
              text: IMAGE_PARSE_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    };

    return this.callTogetherAPI(request);
  }

  /**
   * Parse text content from a document using Together AI.
   *
   * @param textContent - The extracted text from a document
   * @returns The extracted puzzle data as a string
   */
  async parseText(textContent: string): Promise<string> {
    const request: TogetherRequest = {
      model: this.textModel,
      messages: [
        {
          role: 'user',
          content: TEXT_PARSE_PROMPT + '\n\n' + textContent,
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    };

    return this.callTogetherAPI(request);
  }

  /**
   * Make a request to the Together AI API.
   *
   * @param request - The request body to send
   * @returns The text response from Together AI
   */
  private async callTogetherAPI(request: TogetherRequest): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Together AI API error (${response.status}): ${errorText}`);
    }

    const data: TogetherResponse = await response.json();

    if (data.error) {
      throw new Error(`Together AI API error: ${data.error.message}`);
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Together AI returned an empty response');
    }

    return text;
  }
}
