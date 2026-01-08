/**
 * AI Adapters
 *
 * This module exports all available AI adapters and the factory for creating them.
 * To add a new AI service, create a new adapter file and register it in the factory.
 *
 * Available adapters:
 * - GeminiAdapter: Google's Gemini AI (has free tier)
 * - GroqAdapter: Groq with Llama 4 (has generous free tier, very fast)
 * - CloudflareAIAdapter: Cloudflare Workers AI (no API key needed, uses account)
 * - TogetherAIAdapter: Together AI with Llama Vision ($5 free credits)
 *
 * Future adapters could include:
 * - OpenAIAdapter: For GPT-4 Vision
 * - ClaudeAdapter: For Claude's vision capabilities
 * - OllamaAdapter: For local/self-hosted models
 */

// Individual adapters
export { GeminiAdapter } from './gemini-adapter';
export type { GeminiAdapterConfig } from './gemini-adapter';

export { GroqAdapter } from './groq-adapter';
export type { GroqAdapterConfig } from './groq-adapter';

export { CloudflareAIAdapter } from './cloudflare-ai-adapter';
export type { CloudflareAIAdapterConfig } from './cloudflare-ai-adapter';

export { TogetherAIAdapter } from './together-ai-adapter';
export type { TogetherAIAdapterConfig } from './together-ai-adapter';

// Factory for creating adapters
export {
  createAIAdapter,
  getSupportedProviders,
  isProviderSupported,
} from './ai-adapter-factory';
export type { AIAdapterFactoryConfig } from './ai-adapter-factory';

// Re-export the interface for convenience
export type { AIAdapter } from '../core/interfaces';
