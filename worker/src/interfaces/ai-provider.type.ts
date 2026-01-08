/**
 * Supported AI provider types
 */
export type AIProviderType = 'gemini' | 'groq' | 'cloudflare-ai' | 'together' | 'openai' | 'claude';

/**
 * Default AI provider if none specified
 */
export const DEFAULT_AI_PROVIDER: AIProviderType = 'groq';
