/**
 * Prompts Module
 *
 * This module exports all AI prompts used for puzzle parsing.
 * Each prompt is defined in its own file following the "one type per file" principle.
 */

export { OUTPUT_FORMAT_INSTRUCTIONS } from './output-format.prompt.js';
export { IMAGE_PARSE_PROMPT } from './image-parse.prompt.js';
export { TEXT_PARSE_PROMPT } from './text-parse.prompt.js';
export { getPrompt } from './get-prompt.js';
