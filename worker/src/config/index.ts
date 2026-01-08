/**
 * Config Module
 *
 * This module exports all configuration interfaces for adapters.
 * Each config is defined in its own file following the "one type per file" principle.
 */

export type { GeminiAdapterConfig } from './gemini-adapter.config.js';
export type { GroqAdapterConfig } from './groq-adapter.config.js';
export type { TogetherAIAdapterConfig } from './together-ai-adapter.config.js';
export type { CloudflareAIAdapterConfig } from './cloudflare-ai-adapter.config.js';
export type { AIAdapterFactoryConfig } from './ai-adapter-factory.config.js';
