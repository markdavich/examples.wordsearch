/**
 * AI Adapters
 *
 * This module exports all available AI adapters.
 * To add a new AI service, create a new adapter file and export it here.
 *
 * Available adapters:
 * - GeminiAdapter: Google's Gemini AI (recommended, has free tier)
 *
 * Future adapters could include:
 * - OpenAIAdapter: For GPT-4 Vision
 * - ClaudeAdapter: For Claude's vision capabilities
 * - OllamaAdapter: For local/self-hosted models
 */

export { GeminiAdapter } from './gemini-adapter';
export type { GeminiAdapterConfig } from './gemini-adapter';

// Re-export the interface for convenience
export type { AIAdapter } from '../core/interfaces';
