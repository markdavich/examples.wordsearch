/**
 * Groq AI Adapter
 *
 * This adapter implements the AIAdapter interface using Groq's API.
 * Groq provides extremely fast inference using custom LPU (Language Processing Unit) hardware.
 *
 * Groq was chosen as an alternative to Gemini because:
 * - Generous free tier (14,400 requests/day)
 * - Very fast inference
 * - OpenAI-compatible API
 * - Good vision capabilities with Llama 4 models
 *
 * Get your free API key at: https://console.groq.com
 */

import type { AIAdapter } from '../core/interfaces';
import { IMAGE_PARSE_PROMPT, TEXT_PARSE_PROMPT } from '../core/prompts';

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

/**
 * The structure of a Groq API request (OpenAI-compatible)
 */
interface GroqRequest {
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
}

/**
 * The structure of a Groq API response
 */
interface GroqResponse {
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
 * Groq AI Adapter implementation
 */
export class GroqAdapter implements AIAdapter {
  readonly name = 'Groq (Llama 4)';

  private readonly apiKey: string;
  private readonly visionModel: string;
  private readonly textModel: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(config: GroqAdapterConfig) {
    if (!config.apiKey) {
      throw new Error('Groq API key is required');
    }

    this.apiKey = config.apiKey;
    this.visionModel = config.visionModel || 'meta-llama/llama-4-scout-17b-16e-instruct';
    this.textModel = config.textModel || 'llama-3.3-70b-versatile';
  }

  /**
   * Parse an image of a word search puzzle using Groq's vision capabilities.
   *
   * @param imageBase64 - The image encoded as base64
   * @param mimeType - The image MIME type (e.g., 'image/png')
   * @returns The extracted puzzle data as a string
   */
  async parseImage(imageBase64: string, mimeType: string): Promise<string> {
    // Groq uses OpenAI-compatible format with data URLs for images
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const request: GroqRequest = {
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
    };

    return this.callGroqAPI(request);
  }

  /**
   * Parse text content from a document using Groq.
   *
   * @param textContent - The extracted text from a document
   * @returns The extracted puzzle data as a string
   */
  async parseText(textContent: string): Promise<string> {
    const request: GroqRequest = {
      model: this.textModel,
      messages: [
        {
          role: 'user',
          content: TEXT_PARSE_PROMPT + '\n\n' + textContent,
        },
      ],
      max_tokens: 4096,
    };

    return this.callGroqAPI(request);
  }

  /**
   * Make a request to the Groq API.
   *
   * @param request - The request body to send
   * @returns The text response from Groq
   */
  private async callGroqAPI(request: GroqRequest): Promise<string> {
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
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data: GroqResponse = await response.json();

    // Check for API-level errors
    if (data.error) {
      throw new Error(`Groq API error: ${data.error.message}`);
    }

    // Extract the text from the response
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Groq returned an empty response');
    }

    return text;
  }
}
