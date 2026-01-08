import type { AIProviderType } from '../interfaces/ai-provider.type.js';
import type { PlatformConfig } from '../interfaces/platform-config.interface.js';

/**
 * Configuration for creating AI adapters via the factory
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
