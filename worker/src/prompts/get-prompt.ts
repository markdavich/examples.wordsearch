import { IMAGE_PARSE_PROMPT } from './image-parse.prompt.js';
import { TEXT_PARSE_PROMPT } from './text-parse.prompt.js';

/**
 * Get the appropriate prompt based on content type.
 *
 * @param contentType - Whether we're parsing an image or text
 * @returns The prompt string to send to the AI
 */
export function getPrompt(contentType: 'image' | 'text'): string {
  switch (contentType) {
    case 'image':
      return IMAGE_PARSE_PROMPT;
    case 'text':
      return TEXT_PARSE_PROMPT;
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}
