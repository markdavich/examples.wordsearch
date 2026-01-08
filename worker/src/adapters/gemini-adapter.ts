/**
 * Gemini AI Adapter
 *
 * This adapter implements the AIAdapter interface using Google's Gemini API.
 * It handles both image-based (vision) and text-based puzzle parsing.
 *
 * Gemini was chosen as the default because:
 * - It has a generous free tier
 * - It supports both vision and text in the same model
 * - The API is straightforward to use
 *
 * This follows the Liskov Substitution Principle (the "L" in SOLID):
 * This adapter can be swapped with any other AIAdapter implementation
 * without affecting the rest of the application.
 */

import type { AIAdapter } from '../interfaces/index.js';
import type { GeminiAdapterConfig } from '../config/index.js';
import { IMAGE_PARSE_PROMPT, TEXT_PARSE_PROMPT } from '../prompts/index.js';

export type { GeminiAdapterConfig } from '../config/index.js';

/**
 * The structure of a Gemini API request
 */
interface GeminiRequest {
  contents: Array<{
    parts: Array<
      | { text: string }
      | { inline_data: { mime_type: string; data: string } }
    >;
  }>;
}

/**
 * The structure of a Gemini API response
 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Gemini AI Adapter implementation
 */
export class GeminiAdapter implements AIAdapter {
  readonly name = 'Google Gemini';

  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: GeminiAdapterConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.0-flash-exp';
  }

  /**
   * Parse an image of a word search puzzle using Gemini's vision capabilities.
   *
   * @param imageBase64 - The image encoded as base64
   * @param mimeType - The image MIME type (e.g., 'image/png')
   * @returns The extracted puzzle data as a string
   */
  async parseImage(imageBase64: string, mimeType: string): Promise<string> {
    // Build the request with both the image and the prompt
    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
            {
              text: IMAGE_PARSE_PROMPT,
            },
          ],
        },
      ],
    };

    return this.callGeminiAPI(request);
  }

  /**
   * Parse text content from a document using Gemini.
   *
   * @param textContent - The extracted text from a document
   * @returns The extracted puzzle data as a string
   */
  async parseText(textContent: string): Promise<string> {
    // Build the request with the prompt and the text content
    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: TEXT_PARSE_PROMPT + '\n\n' + textContent,
            },
          ],
        },
      ],
    };

    return this.callGeminiAPI(request);
  }

  /**
   * Make a request to the Gemini API.
   *
   * @param request - The request body to send
   * @returns The text response from Gemini
   */
  private async callGeminiAPI(request: GeminiRequest): Promise<string> {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data: GeminiResponse = await response.json();

    // Check for API-level errors
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    // Extract the text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned an empty response');
    }

    return text;
  }
}
