/**
 * AI Adapter Factory
 *
 * This factory creates the appropriate AI adapter based on the provider type.
 * It centralizes the adapter creation logic and makes it easy to add new providers.
 *
 * This follows the Factory Pattern and Open/Closed Principle:
 * - Open for extension: Add new providers by creating new adapters and adding them here
 * - Closed for modification: Existing code doesn't need to change when adding providers
 */

import type { AIAdapter, AIProviderType, PlatformConfig } from '../core/interfaces';
import { DEFAULT_AI_PROVIDER } from '../core/interfaces';
import { GeminiAdapter } from './gemini-adapter';
import { GroqAdapter } from './groq-adapter';
import { CloudflareAIAdapter } from './cloudflare-ai-adapter';
import { TogetherAIAdapter } from './together-ai-adapter';

/**
 * Configuration for creating AI adapters
 */
export interface AIAdapterFactoryConfig {
  /**
   * Platform configuration for accessing secrets
   */
  platform: PlatformConfig;

  /**
   * Which AI provider to use
   */
  provider?: AIProviderType;

  /**
   * Cloudflare AI binding (only needed for 'cloudflare-ai' provider)
   * This comes from the Cloudflare Workers environment
   */
  cloudflareAI?: Ai;
}

/**
 * Create an AI adapter based on the specified provider.
 *
 * @param config - Factory configuration
 * @returns The appropriate AI adapter
 * @throws Error if the provider is not supported or API key is missing
 */
export function createAIAdapter(config: AIAdapterFactoryConfig): AIAdapter {
  const provider = config.provider || DEFAULT_AI_PROVIDER;

  switch (provider) {
    case 'gemini': {
      const apiKey = config.platform.getSecret('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }
      return new GeminiAdapter({ apiKey });
    }

    case 'groq': {
      const apiKey = config.platform.getSecret('GROQ_API_KEY');
      if (!apiKey) {
        throw new Error('GROQ_API_KEY not configured');
      }
      return new GroqAdapter({ apiKey });
    }

    case 'cloudflare-ai': {
      if (!config.cloudflareAI) {
        throw new Error('Cloudflare AI binding not available. Add [ai] binding to wrangler.toml');
      }
      return new CloudflareAIAdapter({ ai: config.cloudflareAI });
    }

    case 'together': {
      const apiKey = config.platform.getSecret('TOGETHER_API_KEY');
      if (!apiKey) {
        throw new Error('TOGETHER_API_KEY not configured');
      }
      return new TogetherAIAdapter({ apiKey });
    }

    case 'openai': {
      const apiKey = config.platform.getSecret('OPENAI_API_KEY');
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      // TODO: Implement OpenAI adapter
      // return new OpenAIAdapter({ apiKey });
      throw new Error('OpenAI adapter not yet implemented');
    }

    case 'claude': {
      const apiKey = config.platform.getSecret('ANTHROPIC_API_KEY');
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }
      // TODO: Implement Claude adapter
      // return new ClaudeAdapter({ apiKey });
      throw new Error('Claude adapter not yet implemented');
    }

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Get the list of currently supported AI providers
 */
export function getSupportedProviders(): AIProviderType[] {
  return ['gemini', 'groq', 'cloudflare-ai', 'together'];
}

/**
 * Check if a provider is supported
 */
export function isProviderSupported(provider: string): provider is AIProviderType {
  return getSupportedProviders().includes(provider as AIProviderType);
}
